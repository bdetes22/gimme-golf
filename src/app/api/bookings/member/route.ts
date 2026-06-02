import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

function restHeaders() {
  return {
    apikey: key(),
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}


export async function POST(req: NextRequest) {
  try {
    const { customerId, location, dateISO, hours } = await req.json();
    // hours is an array of hour numbers, e.g. [14] for 1hr or [14, 15] for 2hr

    const slotCount = Array.isArray(hours) ? hours.length : 1;
    const hourList: number[] = Array.isArray(hours) ? hours : [hours];

    if (!customerId || !location || !dateISO || hourList.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate consecutive slots if multi-hour
    if (slotCount > 1) {
      const sorted = [...hourList].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          return NextResponse.json({ error: "Multi-hour bookings must be consecutive time slots" }, { status: 400 });
        }
      }
    }

    // Fetch active membership
    const memberships = await dbSelect(
      "memberships",
      `customer_id=eq.${customerId}&active=eq.true&limit=1`
    );

    if (!Array.isArray(memberships) || memberships.length === 0) {
      return NextResponse.json({ error: "No active membership found" }, { status: 403 });
    }

    const membership = memberships[0];
    const today = new Date().toISOString().split("T")[0];

    // ── Staff/Owner — no limits ──
    // Skip all limit checks for staff type

    // ── Daily 3-hour limit for all non-staff members ──
    if (membership.type !== "staff") {
      // Check how many hours already booked today for this date
      const existingToday = await dbSelect(
        "bookings",
        `customer_id=eq.${customerId}&status=neq.cancelled&start_time=gte.${dateISO}T00:00:00&start_time=lte.${dateISO}T23:59:59`
      );
      const hoursBookedToday = Array.isArray(existingToday) ? existingToday.length : 0;
      if (hoursBookedToday + slotCount > 3) {
        const remaining = 3 - hoursBookedToday;
        return NextResponse.json({
          error: `Members can book up to 3 hours per day. You've already booked ${hoursBookedToday} hour${hoursBookedToday === 1 ? "" : "s"} today.${remaining > 0 ? ` You can book ${remaining} more hour${remaining === 1 ? "" : "s"}.` : ""}`,
        }, { status: 400 });
      }
    }

    // ── Punch Pass limits ──
    if (membership.type !== "staff" && membership.type === "punchpass") {
      // Check expiry
      if (membership.end_date && today > membership.end_date) {
        await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
          method: "PATCH",
          headers: restHeaders(),
          body: JSON.stringify({ active: false }),
        });
        return NextResponse.json({
          error: "Your punch pass has expired. Please purchase a new one.",
          expired: true,
        }, { status: 403 });
      }

      const remaining = membership.sessions_remaining || 0;
      if (remaining < slotCount) {
        return NextResponse.json({
          error: `Not enough sessions. You have ${remaining} session${remaining === 1 ? "" : "s"} remaining but this booking requires ${slotCount}.`,
        }, { status: 400 });
      }
    }

    // ── Monthly / Annual limits (20 hours per month) ──
    if (membership.type !== "staff" && (membership.type === "monthly" || membership.type === "annual")) {
      // Check expiry
      if (membership.end_date && today > membership.end_date) {
        await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
          method: "PATCH",
          headers: restHeaders(),
          body: JSON.stringify({ active: false }),
        });
        return NextResponse.json({
          error: `Your ${membership.type} membership has expired. Please renew to continue booking as a member.`,
          expired: true,
        }, { status: 403 });
      }

      // Reset monthly hours if past reset date
      let hoursUsed = membership.hours_used_this_month || 0;
      const resetDate = membership.hours_reset_date;
      if (resetDate && today >= resetDate) {
        hoursUsed = 0;
        // Set next reset date (1 month from current reset date)
        const nextReset = new Date(resetDate);
        nextReset.setMonth(nextReset.getMonth() + 1);
        await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
          method: "PATCH",
          headers: restHeaders(),
          body: JSON.stringify({
            hours_used_this_month: 0,
            hours_reset_date: nextReset.toISOString().split("T")[0],
          }),
        });
      }

      // Check monthly hours limit (20 hours)
      const hoursRemaining = 20 - hoursUsed;
      if (slotCount > hoursRemaining) {
        const resetDisplay = membership.hours_reset_date || "your next billing date";
        return NextResponse.json({
          error: `You have ${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"} left this month. Your hours reset on ${resetDisplay}. You can pay the walk-in rate or purchase a punch pass for additional sessions.`,
          hoursRemaining,
          resetDate: membership.hours_reset_date,
        }, { status: 400 });
      }
    }

    // ── Create booking(s) ──
    // Store times as-is (hour number maps directly to the display time)
    const bookings = hourList.map((hour) => {
      const h = String(hour).padStart(2, "0");
      const nextH = String((hour + 1) % 24).padStart(2, "0");
      const startISO = `${dateISO}T${h}:00:00+00:00`;
      const endISO = `${dateISO}T${nextH}:00:00+00:00`;
      return {
        customer_id: customerId,
        location: location.toLowerCase(),
        start_time: startISO,
        end_time: endISO,
        duration_hours: 1,
        status: "confirmed",
        payment_status: "membership",
      };
    });

    // Insert all bookings
    for (const booking of bookings) {
      const res = await fetch(`${url()}/rest/v1/bookings`, {
        method: "POST",
        headers: restHeaders(),
        body: JSON.stringify(booking),
      });
      if (!res.ok) {
        console.error("Failed to create booking:", await res.text());
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      }
    }

    // ── Update membership tracking (skip for staff) ──
    if (membership.type === "staff") {
      return NextResponse.json({ success: true, slotsBooked: slotCount });
    }

    const updateData: Record<string, unknown> = {
      last_booking_date: dateISO,
    };

    if (membership.type === "punchpass") {
      const newRemaining = (membership.sessions_remaining || 0) - slotCount;
      updateData.sessions_remaining = newRemaining;
      if (newRemaining <= 0) {
        updateData.active = false;
      }
    }

    if (membership.type === "monthly" || membership.type === "annual") {
      const resetDate = membership.hours_reset_date;
      const currentUsed = (resetDate && today >= resetDate) ? 0 : (membership.hours_used_this_month || 0);
      updateData.hours_used_this_month = currentUsed + slotCount;
      if (!resetDate) {
        // Set initial reset date to 1 month from now
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);
        updateData.hours_reset_date = nextReset.toISOString().split("T")[0];
      }
    }

    await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
      method: "PATCH",
      headers: restHeaders(),
      body: JSON.stringify(updateData),
    });

    // Fetch customer and location data for emails
    const custData = await dbSelect("customers", `id=eq.${customerId}&limit=1`);
    const cust = Array.isArray(custData) && custData.length > 0 ? custData[0] : null;
    const locData = await dbSelect("locations", `name=ilike.${encodeURIComponent(location)}&limit=1`);
    const loc = Array.isArray(locData) && locData.length > 0 ? locData[0] : null;

    const customerName = (cust?.name as string) || "Guest";
    const customerEmail = (cust?.email as string) || "";
    const locationName = (loc?.name as string) || location;
    const address = (loc?.address as string) || "";
    const keyboxCode = (loc?.keybox_code as string) || "N/A";
    const youtubeUrl = (loc?.youtube_url as string) || "";

    const startHour = hourList[0];
    const endHour = (hourList[hourList.length - 1] + 1) % 24;
    const fmtHour = (h: number) => h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
    const timeDisplay = `${fmtHour(startHour)} – ${fmtHour(endHour)}`;
    const dateDisplay = new Date(dateISO + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    const resend = new Resend(process.env.RESEND_API_KEY!);

    // Send confirmation email
    console.log("[MEMBER BOOKING] Sending email to info@gimmegolfsimulators.com for", customerName, customerEmail);
    try {
      const emailResult = await resend.emails.send({
          from: "Gimme Golf <onboarding@resend.dev>",
          to: "info@gimmegolfsimulators.com",
          subject: `Booking Confirmed — ${locationName} on ${dateDisplay}`,
          html: `
<div style="max-width:600px;margin:0 auto;padding:40px 24px;background:#060A07;font-family:-apple-system,sans-serif;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="https://gimme-git-main-bridgn.vercel.app/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
  </div>
  <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
    <h2 style="color:#F0E8D2;font-size:22px;margin:0 0 8px;">You're All Set, ${customerName}!</h2>
    <p style="color:#F0E8D2;opacity:0.4;font-size:12px;margin:0 0 16px;">${customerEmail}</p>
    <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px;">Here's everything you need to get in and start playing.</p>
    <div style="background:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Location</td><td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${locationName}</td></tr>
        <tr><td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Address</td><td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${address}</td></tr>
        <tr><td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Date</td><td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${dateDisplay}</td></tr>
        <tr><td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;">Time</td><td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${timeDisplay}</td></tr>
      </table>
    </div>
    <div style="background:#2D6A47;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="color:#F0E8D2;opacity:0.8;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;font-weight:600;">Your Access Code</p>
      <p style="color:#F0E8D2;font-size:36px;font-weight:700;margin:0;letter-spacing:6px;">${keyboxCode}</p>
      <p style="color:#F0E8D2;opacity:0.6;font-size:12px;margin:8px 0 0 0;">Enter this code on the keybox at the front door</p>
    </div>
    <div style="background:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="color:#C8973A;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 8px;">Don't Forget</p>
      <p style="color:#F0E8D2;opacity:0.6;font-size:13px;line-height:1.8;margin:0;">• Bring your own clubs — we do not provide clubs<br>• Wear comfortable shoes (no hard soles)<br>• Use the balls we provide — clean balls only if using your own<br>• Clean your clubs before hitting to protect the screen</p>
    </div>
    ${youtubeUrl ? `<div style="text-align:center;margin-bottom:24px;"><a href="${youtubeUrl}" target="_blank" style="display:inline-block;background:#C8973A;color:#060A07;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Watch Instructions Video</a></div>` : ""}
    <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:8px;padding:20px;text-align:center;">
      <p style="color:#F0E8D2;font-size:14px;font-weight:600;margin:0 0 8px;">Need Help?</p>
      <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">Text us: (801) 513-3538 · info@gimmegolfsimulators.com</p>
    </div>
  </div>
</div>`,
        });
        console.log("[MEMBER BOOKING] Email result:", JSON.stringify(emailResult));
      } catch (emailErr) {
        console.error("[MEMBER BOOKING] Email send failed:", JSON.stringify(emailErr));
      }

    return NextResponse.json({ success: true, slotsBooked: slotCount });
  } catch (err) {
    console.error("Member booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
