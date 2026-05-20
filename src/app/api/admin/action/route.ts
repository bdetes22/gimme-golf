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

  if (action === "delete_customer") {
    const { customerId } = body;
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    console.log("[ADMIN] Deleting customer:", customerId);

    // Delete memberships
    const { error: memErr } = await supabase.from("memberships").delete().eq("customer_id", customerId);
    if (memErr) console.error("[ADMIN] Failed to delete memberships:", memErr);

    // Delete bookings
    const { error: bookErr } = await supabase.from("bookings").delete().eq("customer_id", customerId);
    if (bookErr) console.error("[ADMIN] Failed to delete bookings:", bookErr);

    // Try to delete auth user (may not exist if created via webhook)
    try {
      const { error: authErr } = await supabase.auth.admin.deleteUser(customerId);
      if (authErr) console.log("[ADMIN] Auth user delete skipped (may not exist):", authErr.message);
    } catch {
      console.log("[ADMIN] No auth user found for this customer ID");
    }

    // Delete customer record
    const { error } = await supabase.from("customers").delete().eq("id", customerId);
    if (error) {
      console.error("[ADMIN] Failed to delete customer:", error);
      return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
    }

    console.log("[ADMIN] Customer deleted successfully:", customerId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
