import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { customerId, location, dateISO, hour } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    if (!customerId || !location || !dateISO || hour === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the customer has an active membership or punch pass with sessions
    const { data: membership } = await supabaseAdmin
      .from("memberships")
      .select("*")
      .eq("customer_id", customerId)
      .eq("active", true)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No active membership found" }, { status: 403 });
    }

    const startTime = new Date(`${dateISO}T${String(hour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Create the booking
    const { error: bookErr } = await supabaseAdmin.from("bookings").insert({
      customer_id: customerId,
      location: location.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "confirmed",
      payment_status: "membership",
      stripe_payment_id: null,
    });

    if (bookErr) {
      console.error("Failed to create member booking:", bookErr);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // If punch pass, decrement sessions remaining
    if (membership.type === "punchpass" && membership.sessions_remaining !== null) {
      const newSessions = membership.sessions_remaining - 1;
      await supabaseAdmin
        .from("memberships")
        .update({
          sessions_remaining: newSessions,
          active: newSessions > 0,
        })
        .eq("id", membership.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Member booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
