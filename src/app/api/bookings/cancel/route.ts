import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, customerId, customerEmail, bookingDetails, startTime } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    // Enforce 15-minute cancellation window
    if (startTime) {
      const bookingStart = new Date(startTime);
      const now = new Date();
      const diffMs = bookingStart.getTime() - now.getTime();
      const diffMin = diffMs / (1000 * 60);
      if (diffMin < 15) {
        return NextResponse.json(
          { error: "Bookings can only be cancelled up to 15 minutes before the start time." },
          { status: 400 }
        );
      }
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("customer_id", customerId);

    if (error) {
      console.error("Failed to cancel booking:", error);
      return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }

    // Send cancellation confirmation email
    if (customerEmail && bookingDetails) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        await resend.emails.send({
          from: "Gimme Golf <hello@gimmegolfsimulators.com>",
          to: customerEmail ? [customerEmail, "info@gimmegolfsimulators.com"] : "info@gimmegolfsimulators.com",
          subject: `❌ Booking Cancelled — ${bookingDetails.location} on ${bookingDetails.date} at ${bookingDetails.time}`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #2D6A47;">Booking Cancelled</h2>
              <p>Your booking at <strong>${bookingDetails.location}</strong> on <strong>${bookingDetails.date}</strong> at <strong>${bookingDetails.time}</strong> has been cancelled.</p>
              <p>If you didn&rsquo;t request this cancellation, please contact us at <a href="mailto:info@gimmegolfsimulators.com">info@gimmegolfsimulators.com</a> or call (801) 513-3538.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #888; font-size: 12px;">Gimme Golf Simulators</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send cancellation email:", emailErr);
        // Don't fail the cancellation if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
