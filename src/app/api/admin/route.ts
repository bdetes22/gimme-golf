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
    "select=*,customers(name,email)&order=start_time.desc&limit=100"
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
  });
}
