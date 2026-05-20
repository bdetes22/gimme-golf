import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, customerId } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("customer_id", customerId);

    if (error) {
      console.error("Failed to cancel booking:", error);
      return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
