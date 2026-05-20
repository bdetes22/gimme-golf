import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, action } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (action === "cancel_booking") {
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      console.error("Failed to cancel booking:", error);
      return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "create_booking") {
    const { customerId, location, dateISO, hour } = body;
    if (!customerId || !location || !dateISO || hour === undefined) {
      return NextResponse.json(
        { error: "customerId, location, dateISO, and hour are required" },
        { status: 400 }
      );
    }

    const startTime = new Date(`${dateISO}T${String(hour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const { error } = await supabase.from("bookings").insert({
      customer_id: customerId,
      location: location.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "confirmed",
      payment_status: "admin_created",
    });

    if (error) {
      console.error("Failed to create booking:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "add_sessions") {
    const { customerId, sessions } = body;
    if (!customerId || !sessions) {
      return NextResponse.json(
        { error: "customerId and sessions are required" },
        { status: 400 }
      );
    }

    // Find active punch pass membership
    const { data: existing } = await supabase
      .from("memberships")
      .select("*")
      .eq("customer_id", customerId)
      .eq("type", "punchpass")
      .eq("active", true)
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("memberships")
        .update({ sessions_remaining: (existing.sessions_remaining || 0) + sessions })
        .eq("id", existing.id);

      if (error) {
        console.error("Failed to add sessions:", error);
        return NextResponse.json({ error: "Failed to add sessions" }, { status: 500 });
      }
    } else {
      // Create new punch pass
      const { error } = await supabase.from("memberships").insert({
        customer_id: customerId,
        type: "punchpass",
        sessions_remaining: sessions,
        active: true,
        start_date: new Date().toISOString(),
      });

      if (error) {
        console.error("Failed to create punch pass:", error);
        return NextResponse.json({ error: "Failed to create punch pass" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  if (action === "remove_sessions") {
    const { customerId, sessions } = body;
    if (!customerId || !sessions) {
      return NextResponse.json(
        { error: "customerId and sessions are required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("memberships")
      .select("*")
      .eq("customer_id", customerId)
      .eq("type", "punchpass")
      .eq("active", true)
      .limit(1)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "No active punch pass found" }, { status: 404 });
    }

    const newSessions = Math.max(0, (existing.sessions_remaining || 0) - sessions);

    const { error } = await supabase
      .from("memberships")
      .update({ sessions_remaining: newSessions })
      .eq("id", existing.id);

    if (error) {
      console.error("Failed to remove sessions:", error);
      return NextResponse.json({ error: "Failed to remove sessions" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
