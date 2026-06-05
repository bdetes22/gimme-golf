import { NextRequest, NextResponse } from "next/server";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all customers
  const customers = await dbSelect("customers", "order=created_at.desc");

  // Fetch all active memberships
  const memberships = await dbSelect("memberships", "active=eq.true");

  // Fetch bookings with customer info
  const bookings = await dbSelect(
    "bookings",
    "select=*,customers(name,email)&order=start_time.desc&limit=1000"
  );

  // Fetch locations
  const locations = await dbSelect("locations", "select=*&order=name.asc");

  // Map customers with memberships
  const customersWithMembership = (customers || []).map((c: Record<string, unknown>) => {
    const mem = (memberships || []).find(
      (m: Record<string, unknown>) => m.customer_id === c.id
    ) || null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      notes: c.notes || null,
      created_at: c.created_at,
      membership: mem,
    };
  });

  // Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
  const weekEnd = new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const todayBookingsCount = await dbSelect(
    "bookings",
    `select=id&start_time=gte.${todayStart}&start_time=lt.${todayEnd}&status=neq.cancelled`
  );
  const weekBookings = await dbSelect(
    "bookings",
    `select=id&start_time=gte.${weekStart}&start_time=lt.${weekEnd}&status=neq.cancelled`
  );
  const activeMembers = await dbSelect("memberships", "select=id&active=eq.true");

  // Upcoming bookings (today and tomorrow) with customer info
  const upcomingBookings = await dbSelect(
    "bookings",
    `select=*,customers(name,email,phone)&start_time=gte.${todayStart}&start_time=lt.${tomorrowEnd}&status=neq.cancelled&order=start_time.asc`
  );

  // Revenue calculations
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = monthStart;
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const thisMonthPaid = await dbSelect(
    "bookings",
    `select=id&payment_status=eq.paid&created_at=gte.${monthStart}&created_at=lt.${monthEnd}&status=neq.cancelled`
  );
  const lastMonthPaid = await dbSelect(
    "bookings",
    `select=id&payment_status=eq.paid&created_at=gte.${lastMonthStart}&created_at=lt.${lastMonthEnd}&status=neq.cancelled`
  );
  const thisYearPaid = await dbSelect(
    "bookings",
    `select=id&payment_status=eq.paid&created_at=gte.${yearStart}&status=neq.cancelled`
  );

  const revenue = {
    thisMonth: Array.isArray(thisMonthPaid) ? thisMonthPaid.length * 35 : 0,
    lastMonth: Array.isArray(lastMonthPaid) ? lastMonthPaid.length * 35 : 0,
    thisYear: Array.isArray(thisYearPaid) ? thisYearPaid.length * 35 : 0,
    thisMonthBookings: Array.isArray(thisMonthPaid) ? thisMonthPaid.length : 0,
    lastMonthBookings: Array.isArray(lastMonthPaid) ? lastMonthPaid.length : 0,
    thisYearBookings: Array.isArray(thisYearPaid) ? thisYearPaid.length : 0,
  };

  // Expiring memberships (end_date within 30 days)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const todayDate = now.toISOString().split("T")[0];
  const expiringMemberships = await dbSelect(
    "memberships",
    `select=*,customers(name,email)&active=eq.true&end_date=gte.${todayDate}&end_date=lte.${thirtyDaysFromNow}&order=end_date.asc`
  );

  // ── Analytics data ──
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const analyticsBookings = await dbSelect(
    "bookings",
    `select=start_time,location,payment_status,customer_id&start_time=gte.${fourteenDaysAgo}&status=neq.cancelled&status=neq.blocked`
  );

  // Bookings per day (last 14 days)
  const bookingsPerDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    bookingsPerDay[d.toISOString().split("T")[0]] = 0;
  }

  // Bookings by hour
  const bookingsByHour: Record<number, number> = {};
  for (let h = 6; h <= 23; h++) bookingsByHour[h] = 0;

  // Bookings by location
  const bookingsByLocation: Record<string, number> = { kaysville: 0, clearfield: 0 };

  // Bookings by payment type
  const bookingsByType: Record<string, number> = { paid: 0, membership: 0, comp: 0, other: 0 };

  // Unique customers
  const uniqueCustomerIds = new Set<string>();

  if (Array.isArray(analyticsBookings)) {
    for (const b of analyticsBookings) {
      const dateKey = new Date(b.start_time).toISOString().split("T")[0];
      if (dateKey in bookingsPerDay) bookingsPerDay[dateKey]++;

      const hour = new Date(b.start_time).getHours();
      if (hour >= 6 && hour <= 23) bookingsByHour[hour]++;

      const loc = (b.location || "").toLowerCase();
      if (loc in bookingsByLocation) bookingsByLocation[loc]++;

      const ps = b.payment_status || "";
      if (ps === "paid") bookingsByType.paid++;
      else if (ps === "membership") bookingsByType.membership++;
      else if (ps === "comp") bookingsByType.comp++;
      else bookingsByType.other++;

      if (b.customer_id) uniqueCustomerIds.add(b.customer_id);
    }
  }

  const analytics = {
    bookingsPerDay,
    bookingsByHour,
    bookingsByLocation,
    bookingsByType,
    uniqueCustomers: uniqueCustomerIds.size,
  };

  // ── Messages ──
  const messages = await dbSelect(
    "messages",
    "select=*&order=created_at.desc&limit=50"
  );

  return NextResponse.json({
    bookings: bookings || [],
    customers: customersWithMembership,
    locations: locations || [],
    upcomingBookings: upcomingBookings || [],
    expiringMemberships: expiringMemberships || [],
    revenue,
    stats: {
      bookingsToday: Array.isArray(todayBookingsCount) ? todayBookingsCount.length : 0,
      bookingsThisWeek: Array.isArray(weekBookings) ? weekBookings.length : 0,
      activeMembers: Array.isArray(activeMembers) ? activeMembers.length : 0,
    },
    analytics,
    messages: Array.isArray(messages) ? messages : [],
  });
}
