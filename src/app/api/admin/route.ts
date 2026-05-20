import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch bookings with customer info
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*, customers(name, email)")
    .order("start_time", { ascending: false })
    .limit(100);

  if (bookingsError) {
    console.error("Failed to fetch bookings:", bookingsError);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  // Fetch customers with active membership
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("*, memberships(*)")
    .order("created_at", { ascending: false });

  if (customersError) {
    console.error("Failed to fetch customers:", customersError);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }

  // Map customers to include their active membership
  const customersWithMembership = (customers || []).map((c) => {
    const memberships = Array.isArray(c.memberships) ? c.memberships : [];
    const activeMembership = memberships.find((m: { active: boolean }) => m.active) || null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      created_at: c.created_at,
      membership: activeMembership,
    };
  });

  // Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const dayOfWeek = now.getDay();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { count: bookingsTodayCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("start_time", todayStart)
    .lt("start_time", todayEnd)
    .neq("status", "cancelled");

  const { count: bookingsWeekCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("start_time", weekStart.toISOString())
    .lt("start_time", weekEnd.toISOString())
    .neq("status", "cancelled");

  const { count: activeMembersCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("active", true);

  return NextResponse.json({
    bookings: bookings || [],
    customers: customersWithMembership,
    stats: {
      bookingsToday: bookingsTodayCount || 0,
      bookingsThisWeek: bookingsWeekCount || 0,
      activeMembers: activeMembersCount || 0,
    },
  });
}
