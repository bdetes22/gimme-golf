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
      created_at: c.created_at,
      membership: mem,
    };
  });

  // Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).toISOString();
  const weekEnd = new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const todayBookings = await dbSelect(
    "bookings",
    `select=id&start_time=gte.${todayStart}&start_time=lt.${todayEnd}&status=neq.cancelled`
  );
  const weekBookings = await dbSelect(
    "bookings",
    `select=id&start_time=gte.${weekStart}&start_time=lt.${weekEnd}&status=neq.cancelled`
  );
  const activeMembers = await dbSelect("memberships", "select=id&active=eq.true");

  return NextResponse.json({
    bookings: bookings || [],
    customers: customersWithMembership,
    stats: {
      bookingsToday: Array.isArray(todayBookings) ? todayBookings.length : 0,
      bookingsThisWeek: Array.isArray(weekBookings) ? weekBookings.length : 0,
      activeMembers: Array.isArray(activeMembers) ? activeMembers.length : 0,
    },
  });
}
