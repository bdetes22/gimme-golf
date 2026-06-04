import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";
import { dbDelete, dbInsert, dbSelect, dbUpdate } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function formatTime(hour: number) {
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function buildConfirmationEmail({
  customerName,
  customerEmail,
  locationName,
  address,
  dateDisplay,
  timeDisplay,
  keyboxCode,
  youtubeUrl,
}: {
  customerName: string;
  customerEmail: string;
  locationName: string;
  address: string;
  dateDisplay: string;
  timeDisplay: string;
  keyboxCode: string;
  youtubeUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#060A07;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://gimme-git-main-bridgn.vercel.app/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
    </div>
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">You're All Set, ${customerName}!</h2>
      <p style="color:#F0E8D2;opacity:0.4;font-size:12px;margin:0 0 16px 0;">${customerEmail}</p>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 28px 0;">
        Here's everything you need to get in and start playing.
      </p>
      <div style="background-color:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Location</td>
            <td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${locationName}</td>
          </tr>
          <tr>
            <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Address</td>
            <td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${address}</td>
          </tr>
          <tr>
            <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Date</td>
            <td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${dateDisplay}</td>
          </tr>
          <tr>
            <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;">Time</td>
            <td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${timeDisplay}</td>
          </tr>
        </table>
      </div>
      <div style="background-color:#2D6A47;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="color:#F0E8D2;opacity:0.8;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;font-weight:600;">Your Access Code</p>
        <p style="color:#F0E8D2;font-size:36px;font-weight:700;margin:0;letter-spacing:6px;">${keyboxCode}</p>
        <p style="color:#F0E8D2;opacity:0.6;font-size:12px;margin:8px 0 0 0;">Enter this code on the keybox at the front door</p>
      </div>
      ${youtubeUrl ? `
      <div style="text-align:center;margin-bottom:24px;">
        <p style="color:#F0E8D2;opacity:0.6;font-size:14px;margin:0 0 12px 0;">First time? Watch our quick walkthrough:</p>
        <a href="${youtubeUrl}" target="_blank" style="display:inline-block;background-color:#C8973A;color:#060A07;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Watch Instructions Video</a>
      </div>
      ` : ""}
    </div>
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#F0E8D2;font-size:14px;font-weight:600;margin:0 0 8px 0;">Need Help?</p>
      <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">(801) 513-3538 · info@gimmegolfsimulators.com</p>
    </div>
    <div style="text-align:center;padding:16px 0;">
      <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, action } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Send post-session follow-up emails ──
  if (action === "send_followups") {
    const now = new Date().toISOString();
    // Find bookings that ended, not cancelled, not followup_sent, with customer email
    const completedBookings = await dbSelect(
      "bookings",
      `select=*,customers(id,name,email)&end_time=lt.${now}&status=neq.cancelled&followup_sent=eq.false&order=end_time.desc&limit=50`
    );

    if (!Array.isArray(completedBookings) || completedBookings.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://gimme-git-main-bridgn.vercel.app";
    let sent = 0;

    // Group by customer to avoid sending multiple follow-ups
    const sentCustomers = new Set<string>();

    for (const booking of completedBookings) {
      const email = booking.customers?.email;
      const name = booking.customers?.name || "there";
      const custId = booking.customers?.id;

      if (!email || !custId || sentCustomers.has(custId)) {
        // Mark as sent even if skipped to avoid re-processing
        await dbUpdate("bookings", `id=eq.${booking.id}`, { followup_sent: true });
        continue;
      }
      sentCustomers.add(custId);

      // Check if this is their first ever booking
      const allBookings = await dbSelect(
        "bookings",
        `select=id&customer_id=eq.${custId}&status=neq.cancelled`
      );
      const isFirstTimer = Array.isArray(allBookings) && allBookings.length <= 1;

      try {
        if (isFirstTimer) {
          // Generate unique promo code
          const promoCode = `WELCOME-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
          await dbInsert("promo_codes", {
            code: promoCode,
            type: "welcome",
            discount_amount: 35,
            customer_id: custId,
            expires_at: expiresAt,
          });

          // First-time customer email — membership upsell with promo code
          await resend.emails.send({
            from: "Gimme Golf <onboarding@resend.dev>",
            to: email,
            subject: "Thanks for Trying Gimme Golf — Here's $35 Off",
            html: `
<div style="max-width:600px;margin:0 auto;padding:40px 24px;background:#060A07;font-family:-apple-system,sans-serif;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="${origin}/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
  </div>
  <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
    <h2 style="color:#F0E8D2;font-size:22px;margin:0 0 8px;">Thanks for Coming In, ${name}!</h2>
    <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We hope you had a great time! We'd love to see you back soon.
    </p>

    <div style="background:#2D6A47;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="color:#F0E8D2;opacity:0.8;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;font-weight:600;">Special First-Timer Offer</p>
      <p style="color:#F0E8D2;font-size:20px;font-weight:700;margin:0 0 8px;">Get Your $35 Back</p>
      <p style="color:#F0E8D2;opacity:0.8;font-size:14px;margin:0 0 16px;">
        Sign up for a Monthly or Annual membership and we'll credit your walk-in session back — $35 off your first payment.
      </p>
      <div style="background:#060A07;border-radius:6px;padding:12px;display:inline-block;">
        <p style="color:#F0E8D2;opacity:0.4;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Your Promo Code</p>
        <p style="color:#C8973A;font-size:24px;font-weight:800;letter-spacing:4px;margin:0;">${promoCode}</p>
      </div>
      <p style="color:#F0E8D2;opacity:0.5;font-size:11px;margin:8px 0 0;">Valid for 30 days · One-time use</p>
    </div>

    <p style="color:#F0E8D2;opacity:0.5;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Members get 20 hours per month, priority booking, and member discounts at both our Kaysville and Clearfield locations. 24/7 access.
    </p>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${origin}/memberships" style="display:inline-block;background:#C8973A;color:#060A07;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">View Membership Plans</a>
    </div>

    <div style="text-align:center;">
      <a href="${origin}/book" style="color:#2D6A47;font-size:13px;text-decoration:underline;">Or just book another walk-in session</a>
    </div>
  </div>
  <div style="text-align:center;padding:16px 0;">
    <p style="color:#F0E8D2;opacity:0.3;font-size:12px;margin:0 0 4px;">Text us anytime: (801) 513-3538</p>
    <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
  </div>
</div>`,
          });
        } else {
          // Returning customer follow-up — book again
          await resend.emails.send({
            from: "Gimme Golf <onboarding@resend.dev>",
            to: email,
            subject: "How Was Your Session?",
            html: `
<div style="max-width:600px;margin:0 auto;padding:40px 24px;background:#060A07;font-family:-apple-system,sans-serif;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="${origin}/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
  </div>
  <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
    <h2 style="color:#F0E8D2;font-size:22px;margin:0 0 8px;">How Was Your Session, ${name}?</h2>
    <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Thanks for playing at Gimme Golf! We hope you had a great time on the course.
    </p>
    <p style="color:#F0E8D2;opacity:0.5;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Ready for another round? Both our Kaysville and Clearfield locations are open 24/7 — book your next session anytime.
    </p>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${origin}/book" style="display:inline-block;background:#2D6A47;color:#F0E8D2;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Book Your Next Session</a>
    </div>
  </div>
  <div style="text-align:center;padding:16px 0;">
    <p style="color:#F0E8D2;opacity:0.3;font-size:12px;margin:0 0 4px;">Text us anytime: (801) 513-3538</p>
    <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
  </div>
</div>`,
          });
        }
        sent++;
      } catch (emailErr) {
        console.error("[ADMIN] Follow-up email failed for", email, emailErr);
      }

      // Mark all their bookings as followup_sent
      await dbUpdate("bookings", `customer_id=eq.${custId}&followup_sent=eq.false&end_time=lt.${now}`, { followup_sent: true });
    }

    return NextResponse.json({ success: true, sent });
  }

  // ── Resend confirmation email ──
  // ── Send membership welcome email ──
  if (action === "send_welcome_email") {
    const { customerId } = body;
    if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });

    const custArr = await dbSelect("customers", `id=eq.${customerId}&limit=1`);
    const cust = Array.isArray(custArr) && custArr.length > 0 ? custArr[0] : null;
    if (!cust) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const memArr = await dbSelect("memberships", `customer_id=eq.${customerId}&active=eq.true&limit=1`);
    const mem = Array.isArray(memArr) && memArr.length > 0 ? memArr[0] : null;

    const planLabels: Record<string, string> = { punchpass: "Punch Pass (10 Sessions)", monthly: "Monthly Membership", annual: "Annual Membership", staff: "Staff / Owner" };
    const planLabel = mem ? (planLabels[mem.type as string] || mem.type) : "Member";
    const endDate = mem?.end_date || null;
    const sessionsRemaining = mem?.sessions_remaining || null;

    const locArr = await dbSelect("locations", "select=name,address,keybox_code,youtube_url&order=name.asc");
    const allLocations = Array.isArray(locArr) ? locArr : [];

    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
        to: "info@gimmegolfsimulators.com",
        subject: `Welcome Email — ${cust.name} (${cust.email}) — ${planLabel}`,
        html: `
<div style="max-width:600px;margin:0 auto;padding:40px 24px;background:#060A07;font-family:-apple-system,sans-serif;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="https://www.gimmegolfsimulators.com/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
  </div>
  <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
    <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">Welcome to the Club, ${cust.name}!</h2>
    <p style="color:#F0E8D2;opacity:0.4;font-size:12px;margin:0 0 16px 0;">${cust.email}</p>
    <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px 0;">Your ${planLabel} is now active. Here's everything you need to get started.</p>
    <div style="background:#2D6A47;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="color:#F0E8D2;font-size:24px;font-weight:700;margin:0;">${planLabel}</p>
      ${sessionsRemaining ? `<p style="color:#F0E8D2;opacity:0.8;font-size:14px;margin:8px 0 0 0;">${sessionsRemaining} sessions ready to use</p>` : ""}
      ${endDate ? `<p style="color:#F0E8D2;opacity:0.8;font-size:14px;margin:8px 0 0 0;">Valid through ${endDate}</p>` : ""}
    </div>
    <div style="margin-bottom:24px;">
      <p style="color:#C8973A;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 12px 0;">Getting Started</p>
      <table style="width:100%;"><tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">1. Book your first session online</td></tr><tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">2. Use the keybox code below to enter the building</td></tr><tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">3. Watch the walkthrough video for your location</td></tr><tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">4. Turn on the simulator and play!</td></tr></table>
    </div>
    ${allLocations.map((loc: Record<string, string | null>) => `
    <div style="background:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;margin-bottom:12px;">
      <table style="width:100%;"><tr><td style="vertical-align:top;"><p style="color:#F0E8D2;font-size:16px;font-weight:700;margin:0 0 4px 0;">${loc.name}</p><p style="color:#F0E8D2;opacity:0.5;font-size:12px;margin:0 0 8px 0;">${loc.address}</p>${loc.youtube_url ? `<a href="${loc.youtube_url}" target="_blank" style="color:#C8973A;font-size:12px;text-decoration:underline;">Watch walkthrough video</a>` : ""}</td><td style="vertical-align:top;text-align:right;width:100px;">${loc.keybox_code ? `<p style="color:#F0E8D2;opacity:0.4;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Keybox Code</p><p style="color:#2D6A47;font-size:20px;font-weight:700;margin:0;letter-spacing:3px;">${loc.keybox_code}</p>` : ""}</td></tr></table>
    </div>`).join("")}
    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.gimmegolfsimulators.com/book" style="display:inline-block;background-color:#C8973A;color:#060A07;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Book Your First Session</a>
    </div>
    <div style="background:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;text-align:center;">
      <p style="color:#F0E8D2;font-size:13px;font-weight:600;margin:0 0 6px 0;">Need anything? Text us — it's the fastest way to reach us.</p>
      <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">(801) 513-3538 · info@gimmegolfsimulators.com</p>
    </div>
  </div>
</div>`,
      });
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("[ADMIN] Welcome email failed:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  }

  if (action === "resend_confirmation") {
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const bookingArr = await dbSelect(
      "bookings",
      `select=*,customers(name,email)&id=eq.${bookingId}&limit=1`
    );
    if (!Array.isArray(bookingArr) || bookingArr.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = bookingArr[0];
    const customerName = booking.customers?.name || "Guest";
    const customerEmail = booking.customers?.email;
    if (!customerEmail) {
      return NextResponse.json({ error: "No customer email found" }, { status: 400 });
    }

    // Fetch location data
    const locArr = await dbSelect(
      "locations",
      `select=name,address,keybox_code,youtube_url&name=ilike.${encodeURIComponent(booking.location)}&limit=1`
    );
    const loc = Array.isArray(locArr) && locArr.length > 0 ? locArr[0] : null;

    const startDate = new Date(booking.start_time);
    const hour = startDate.getHours();
    const dateDisplay = startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const timeDisplay = `${formatTime(hour)} - ${formatTime(hour + 1)}`;
    const locationName = loc?.name || booking.location;

    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
        to: customerEmail,
        subject: `Booking Confirmed — ${locationName} on ${dateDisplay}`,
        html: buildConfirmationEmail({
          customerName,
          customerEmail,
          locationName,
          address: loc?.address || "",
          dateDisplay,
          timeDisplay,
          keyboxCode: loc?.keybox_code || "N/A",
          youtubeUrl: loc?.youtube_url || "",
        }),
      });
      console.log("[ADMIN] Confirmation email resent to", customerEmail);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Email send failed";
      console.error("[ADMIN] Resend email failed:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Block time slot ──
  if (action === "block_slot") {
    const { location, dateISO, hour: blockHour } = body;
    if (!location || !dateISO || blockHour === undefined) {
      return NextResponse.json({ error: "location, dateISO, and hour are required" }, { status: 400 });
    }

    // Get or create system customer for blocked slots
    let systemCustomer = await dbSelect(
      "customers",
      `select=id&email=eq.system@gimmegolf.internal&limit=1`
    );
    let systemCustomerId: string;

    if (Array.isArray(systemCustomer) && systemCustomer.length > 0) {
      systemCustomerId = systemCustomer[0].id;
    } else {
      // Create system customer
      const created = await dbInsert("customers", {
        name: "SYSTEM (Blocked Slots)",
        email: "system@gimmegolf.internal",
        phone: null,
      });
      if (Array.isArray(created) && created.length > 0) {
        systemCustomerId = created[0].id;
      } else {
        return NextResponse.json({ error: "Failed to create system customer" }, { status: 500 });
      }
    }

    const startTime = new Date(`${dateISO}T${String(blockHour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    await dbInsert("bookings", {
      customer_id: systemCustomerId,
      location: location.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "blocked",
      payment_status: "blocked",
    });

    return NextResponse.json({ success: true });
  }

  // ── Unblock time slot ──
  if (action === "unblock_slot") {
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const result = await dbDelete("bookings", `id=eq.${bookingId}&status=eq.blocked`);
    if (!result.ok) {
      return NextResponse.json({ error: "Failed to unblock slot" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  // ── Send renewal reminder ──
  if (action === "send_renewal_reminder") {
    const { membershipId, customerEmail, customerName, endDate, membershipType } = body;
    if (!membershipId || !customerEmail || !customerName) {
      return NextResponse.json({ error: "membershipId, customerEmail, and customerName are required" }, { status: 400 });
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
        to: customerEmail,
        subject: "Your Gimme Golf Membership is Expiring Soon",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#060A07;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://gimme-git-main-bridgn.vercel.app/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
    </div>
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">Hey ${customerName},</h2>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        Your ${membershipType || "membership"} is set to expire on <strong style="color:#C8973A;">${endDate || "soon"}</strong>. Renew now to keep your access and booking privileges.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://gimme-git-main-bridgn.vercel.app/membership" style="display:inline-block;background-color:#2D6A47;color:#F0E8D2;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Renew Membership</a>
      </div>
      <div style="background-color:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;text-align:center;">
        <p style="color:#F0E8D2;font-size:13px;font-weight:600;margin:0 0 6px 0;">Questions? Text us!</p>
        <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">(801) 513-3538 · info@gimmegolfsimulators.com</p>
      </div>
    </div>
    <div style="text-align:center;padding:16px 0;">
      <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      });
      console.log("[ADMIN] Renewal reminder sent to", customerEmail);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Email send failed";
      console.error("[ADMIN] Renewal reminder failed:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Comp a booking ──
  if (action === "comp_booking") {
    const { customerId, location, dateISO, hour: compHour } = body;
    if (!customerId || !location || !dateISO || compHour === undefined) {
      return NextResponse.json({ error: "customerId, location, dateISO, and hour are required" }, { status: 400 });
    }

    const startTime = new Date(`${dateISO}T${String(compHour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    await dbInsert("bookings", {
      customer_id: customerId,
      location: location.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "confirmed",
      payment_status: "comp",
    });

    // Fetch customer and location info for confirmation email
    const custArr = await dbSelect("customers", `select=name,email&id=eq.${customerId}&limit=1`);
    const locArr = await dbSelect(
      "locations",
      `select=name,address,keybox_code,youtube_url&name=ilike.${encodeURIComponent(location)}&limit=1`
    );
    const cust = Array.isArray(custArr) && custArr.length > 0 ? custArr[0] : null;
    const loc = Array.isArray(locArr) && locArr.length > 0 ? locArr[0] : null;

    if (cust?.email && loc) {
      const dateDisplay = startTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      const timeDisplay = `${formatTime(compHour)} - ${formatTime(compHour + 1)}`;
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        await resend.emails.send({
          from: "Gimme Golf <onboarding@resend.dev>",
          to: cust.email,
          subject: `Booking Confirmed — ${loc.name} on ${dateDisplay}`,
          html: buildConfirmationEmail({
            customerName: cust.name || "Guest",
            customerEmail: cust.email || "",
            locationName: loc.name,
            address: loc.address || "",
            dateDisplay,
            timeDisplay,
            keyboxCode: loc.keybox_code || "N/A",
            youtubeUrl: loc.youtube_url || "",
          }),
        });
        console.log("[ADMIN] Comp confirmation email sent to", cust.email);
      } catch (emailErr) {
        console.error("[ADMIN] Comp email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  }

  // ── Update keybox code ──
  if (action === "update_keybox") {
    const { locationId, keyboxCode } = body;
    if (!locationId || !keyboxCode) {
      return NextResponse.json({ error: "locationId and keyboxCode are required" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const res = await fetch(`${apiUrl}/rest/v1/locations?id=eq.${locationId}`, {
      method: "PATCH",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ keybox_code: keyboxCode }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to update keybox code" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "create_member") {
    const { name, email, phone, membershipType, startDate, endDate, hoursRemaining, sessionsRemaining, notes } = body;
    if (!name || !email || !membershipType) {
      return NextResponse.json({ error: "Name, email, and membership type are required" }, { status: 400 });
    }

    const admin = adminClient();
    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const restHeaders = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    // Generate random temporary password
    const tempPassword = `GG-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

    // Create auth user
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name, phone },
    });

    if (authErr) {
      console.error("[ADMIN] Create auth user failed:", authErr);
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // Create customer record
    const custRes = await fetch(`${apiUrl}/rest/v1/customers`, {
      method: "POST",
      headers: restHeaders,
      body: JSON.stringify({
        id: authData.user.id,
        name,
        email,
        phone: phone || null,
        notes: notes || null,
      }),
    });

    if (!custRes.ok) {
      // Cleanup auth user
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 });
    }

    // Create membership (skip for walkin)
    if (membershipType !== "walkin") {
      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);

      await fetch(`${apiUrl}/rest/v1/memberships`, {
        method: "POST",
        headers: { ...restHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({
          customer_id: authData.user.id,
          type: membershipType,
          active: true,
          start_date: startDate || now.toISOString().split("T")[0],
          end_date: endDate || null,
          sessions_remaining: membershipType === "punchpass" ? (sessionsRemaining || 10) : null,
          hours_used_this_month: membershipType === "staff" ? 0 : (20 - (hoursRemaining || 20)),
          hours_reset_date: membershipType === "staff" ? null : nextReset.toISOString().split("T")[0],
        }),
      });
    }

    // Generate password reset link and send welcome email
    const { data: resetData } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    const resetLink = resetData?.properties?.action_link || "";

    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to Gimme Golf — Set Up Your Account",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#060A07;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://gimme-git-main-bridgn.vercel.app/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
    </div>
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">Welcome to Gimme Golf, ${name}!</h2>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        We've set up your account and you're ready to start booking. Click the button below to set your password and get started.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetLink}" style="display:inline-block;background-color:#2D6A47;color:#F0E8D2;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Set Your Password</a>
      </div>
      <p style="color:#F0E8D2;opacity:0.4;font-size:13px;line-height:1.6;margin:0 0 16px 0;">
        After setting your password, you can log in at gimmegolfsimulators.com and start booking sessions at either of our locations.
      </p>
      <div style="background-color:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;text-align:center;">
        <p style="color:#F0E8D2;font-size:13px;font-weight:600;margin:0 0 6px 0;">Need help? Text us — it's the fastest way to reach us.</p>
        <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">(801) 513-3538 · info@gimmegolfsimulators.com</p>
      </div>
    </div>
    <div style="text-align:center;padding:16px 0;">
      <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      });
      console.log("[ADMIN] Welcome email sent to", email);
    } catch (emailErr) {
      console.error("[ADMIN] Failed to send welcome email:", emailErr);
    }

    return NextResponse.json({ success: true });
  }

  if (action === "update_notes") {
    const { customerId, notes } = body;
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    await fetch(`${apiUrl}/rest/v1/customers?id=eq.${customerId}`, {
      method: "PATCH",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ notes: notes || null }),
    });

    return NextResponse.json({ success: true });
  }

  if (action === "refund_booking") {
    const { bookingId, stripePaymentId } = body;
    if (!bookingId || !stripePaymentId) {
      return NextResponse.json({ error: "bookingId and stripePaymentId are required" }, { status: 400 });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-04-22.dahlia",
      });

      // Issue refund via Stripe
      const refund = await stripe.refunds.create({
        payment_intent: stripePaymentId,
      });

      // Update booking status to cancelled + refunded
      const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      await fetch(`${apiUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: "PATCH",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status: "cancelled", payment_status: "refunded" }),
      });

      return NextResponse.json({ success: true, refundId: refund.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refund failed";
      console.error("[ADMIN] Refund failed:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (action === "cancel_booking") {
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    await fetch(`${url}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

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

    await dbInsert("bookings", {
      customer_id: customerId,
      location: location.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "confirmed",
      payment_status: "admin_created",
    });

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

    const existing = await dbSelect(
      "memberships",
      `customer_id=eq.${customerId}&type=eq.punchpass&active=eq.true&limit=1`
    );

    if (Array.isArray(existing) && existing.length > 0) {
      const mem = existing[0];
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      await fetch(`${url}/rest/v1/memberships?id=eq.${mem.id}`, {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          sessions_remaining: (mem.sessions_remaining || 0) + sessions,
        }),
      });
    } else {
      await dbInsert("memberships", {
        customer_id: customerId,
        type: "punchpass",
        sessions_remaining: sessions,
        active: true,
        start_date: new Date().toISOString().split("T")[0],
      });
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

    const existing = await dbSelect(
      "memberships",
      `customer_id=eq.${customerId}&type=eq.punchpass&active=eq.true&limit=1`
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: "No active punch pass found" }, { status: 404 });
    }

    const mem = existing[0];
    const newSessions = Math.max(0, (mem.sessions_remaining || 0) - sessions);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    await fetch(`${url}/rest/v1/memberships?id=eq.${mem.id}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ sessions_remaining: newSessions }),
    });

    return NextResponse.json({ success: true });
  }

  if (action === "set_membership") {
    const { customerId, type, startDate, endDate, sessionsRemaining } = body;
    if (!customerId || !type) {
      return NextResponse.json({ error: "customerId and type are required" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const headers = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    // Deactivate existing memberships
    await fetch(`${apiUrl}/rest/v1/memberships?customer_id=eq.${customerId}&active=eq.true`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: false }),
    });

    // Create new membership
    if (type !== "walkin") {
      const memData: Record<string, unknown> = {
        customer_id: customerId,
        type,
        active: true,
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate || null,
        sessions_remaining: type === "punchpass" ? (sessionsRemaining || 10) : null,
        hours_used_this_month: 0,
        hours_reset_date: type === "staff" ? null : (() => {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          return d.toISOString().split("T")[0];
        })(),
      };

      await fetch(`${apiUrl}/rest/v1/memberships`, {
        method: "POST",
        headers,
        body: JSON.stringify(memData),
      });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "delete_customer") {
    const { customerId } = body;
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    console.log("[ADMIN] Deleting customer:", customerId);

    // Direct REST API deletes - guaranteed to bypass RLS
    const r1 = await dbDelete("memberships", `customer_id=eq.${customerId}`);
    console.log("[ADMIN] Delete memberships:", r1.status);

    const r2 = await dbDelete("bookings", `customer_id=eq.${customerId}`);
    console.log("[ADMIN] Delete bookings:", r2.status);

    const r3 = await dbDelete("customers", `id=eq.${customerId}`);
    console.log("[ADMIN] Delete customer:", r3.status);

    // Delete auth user
    try {
      const admin = adminClient();
      await admin.auth.admin.deleteUser(customerId);
      console.log("[ADMIN] Auth user deleted");
    } catch {
      console.log("[ADMIN] No auth user found");
    }

    return NextResponse.json({ success: true });
  }

  // ── Mark message read ──
  if (action === "mark_read") {
    const { messageId } = body;
    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }
    await dbUpdate("messages", `id=eq.${messageId}`, { read: true });
    return NextResponse.json({ success: true });
  }

  // ── Mark message unread ──
  if (action === "mark_unread") {
    const { messageId } = body;
    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }
    await dbUpdate("messages", `id=eq.${messageId}`, { read: false });
    return NextResponse.json({ success: true });
  }

  // ── Delete message ──
  if (action === "delete_message") {
    const { messageId } = body;
    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }
    await dbDelete("messages", `id=eq.${messageId}`);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
