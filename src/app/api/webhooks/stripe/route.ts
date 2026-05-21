import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function formatTime(hour: number) {
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function buildConfirmationEmail({
  customerName,
  locationName,
  address,
  dateDisplay,
  timeDisplay,
  keyboxCode,
  youtubeUrl,
}: {
  customerName: string;
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

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://gimme-git-main-bridgn.vercel.app/logos/logo-trimmed.png" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
    </div>

    <!-- Main Card -->
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;margin-bottom:24px;">

      <!-- Greeting -->
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">You're All Set, ${customerName}!</h2>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 28px 0;">
        Here's everything you need to get in and start playing. See you on the course!
      </p>

      <!-- Booking Details -->
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
            <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;border-bottom:1px solid #1a2a1f;">Time</td>
            <td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #1a2a1f;">${timeDisplay}</td>
          </tr>
          <tr>
            <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:8px 0;">Duration</td>
            <td style="color:#F0E8D2;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">1 hour</td>
          </tr>
        </table>
      </div>

      <!-- Keybox Code -->
      <div style="background-color:#2D6A47;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="color:#F0E8D2;opacity:0.8;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;font-weight:600;">Your Access Code</p>
        <p style="color:#F0E8D2;font-size:36px;font-weight:700;margin:0;letter-spacing:6px;">${keyboxCode}</p>
        <p style="color:#F0E8D2;opacity:0.6;font-size:12px;margin:8px 0 0 0;">Enter this code on the keybox at the front door</p>
      </div>

      <!-- YouTube Button -->
      ${youtubeUrl ? `
      <div style="text-align:center;margin-bottom:24px;">
        <p style="color:#F0E8D2;opacity:0.6;font-size:14px;margin:0 0 12px 0;">First time? Watch our quick walkthrough:</p>
        <a href="${youtubeUrl}" target="_blank" style="display:inline-block;background-color:#C8973A;color:#060A07;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Watch Instructions Video</a>
      </div>
      ` : ""}

    </div>

    <!-- Contact -->
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#F0E8D2;font-size:14px;font-weight:600;margin:0 0 8px 0;">Need Help? We're Here for You</p>
      <p style="color:#F0E8D2;opacity:0.6;font-size:13px;line-height:1.6;margin:0 0 12px 0;">
        Text or call us anytime — texting is the fastest way to reach us.
      </p>
      <a href="sms:+18015133538" style="display:inline-block;background-color:#2D6A47;color:#F0E8D2;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-right:8px;">Text Us</a>
      <a href="tel:+18015133538" style="display:inline-block;background-color:transparent;color:#F0E8D2;opacity:0.5;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:600;border:1px solid rgba(240,232,210,0.2);">Call (801) 513-3538</a>
      <p style="color:#F0E8D2;opacity:0.35;font-size:12px;margin:12px 0 0 0;">
        info@gimmegolfsimulators.com
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;">
      <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const supabaseAdmin = getSupabaseAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log("[WEBHOOK] Event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    console.log("[WEBHOOK] Metadata:", JSON.stringify(meta));

    // ── Membership purchase ──
    if (meta.type === "membership") {
      const plan = meta.plan || "";
      const customerId = meta.customerId || "";
      const customerEmail = meta.customerEmail || "";
      const customerName = meta.customerName || "";

      console.log("[WEBHOOK] Membership purchase:", plan, customerId);

      // Deactivate any existing memberships
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const restHeaders = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      };

      await fetch(`${url}/rest/v1/memberships?customer_id=eq.${customerId}&active=eq.true`, {
        method: "PATCH",
        headers: restHeaders,
        body: JSON.stringify({ active: false }),
      });

      // Calculate dates and sessions
      const now = new Date();
      const startDate = now.toISOString().split("T")[0];
      let endDate: string | null = null;
      let sessionsRemaining: number | null = null;

      if (plan === "punchpass") {
        sessionsRemaining = 10;
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 1);
        endDate = end.toISOString().split("T")[0];
      } else if (plan === "monthly") {
        const end = new Date(now);
        end.setMonth(end.getMonth() + 1);
        endDate = end.toISOString().split("T")[0];
      } else if (plan === "annual") {
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 1);
        endDate = end.toISOString().split("T")[0];
      }

      // Create membership
      await fetch(`${url}/rest/v1/memberships`, {
        method: "POST",
        headers: restHeaders,
        body: JSON.stringify({
          customer_id: customerId,
          type: plan,
          sessions_remaining: sessionsRemaining,
          start_date: startDate,
          end_date: endDate,
          active: true,
        }),
      });

      // Fetch both locations for the welcome email
      const locUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const locKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const locRes = await fetch(`${locUrl}/rest/v1/locations?select=name,address,keybox_code,youtube_url&order=name.asc`, {
        headers: { apikey: locKey, Authorization: `Bearer ${locKey}` },
        cache: "no-store",
      });
      const allLocations = await locRes.json();

      // Send welcome email
      const planLabels: Record<string, string> = {
        punchpass: "Punch Pass (10 Sessions)",
        monthly: "Monthly Membership",
        annual: "Annual Membership",
      };
      const planLabel = planLabels[plan] || plan;

      try {
        await resend.emails.send({
          from: "Gimme Golf <onboarding@resend.dev>",
          to: customerEmail,
          subject: `Welcome to Gimme Golf — ${planLabel}`,
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
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">Welcome to the Club, ${customerName}!</h2>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        Your ${planLabel} is now active. Here's everything you need to get started.
      </p>

      <!-- Membership Info -->
      <div style="background-color:#2D6A47;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="color:#F0E8D2;font-size:24px;font-weight:700;margin:0;">${planLabel}</p>
        ${sessionsRemaining ? `<p style="color:#F0E8D2;opacity:0.8;font-size:14px;margin:8px 0 0 0;">${sessionsRemaining} sessions ready to use</p>` : ""}
        ${endDate ? `<p style="color:#F0E8D2;opacity:0.8;font-size:14px;margin:8px 0 0 0;">Valid through ${endDate}</p>` : ""}
      </div>

      <!-- Getting Started -->
      <div style="margin-bottom:24px;">
        <p style="color:#C8973A;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 12px 0;">Getting Started</p>
        <table style="width:100%;">
          <tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">1. Book your first session online</td></tr>
          <tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">2. Use the keybox code below to enter the building</td></tr>
          <tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">3. Watch the walkthrough video for your location</td></tr>
          <tr><td style="color:#F0E8D2;opacity:0.7;font-size:13px;padding:6px 0;">4. Turn on the simulator and play!</td></tr>
        </table>
      </div>

      <!-- Locations -->
      ${Array.isArray(allLocations) ? allLocations.map((loc: Record<string, string | null>) => `
      <div style="background-color:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;margin-bottom:12px;">
        <table style="width:100%;">
          <tr>
            <td style="vertical-align:top;">
              <p style="color:#F0E8D2;font-size:16px;font-weight:700;margin:0 0 4px 0;">${loc.name}</p>
              <p style="color:#F0E8D2;opacity:0.5;font-size:12px;margin:0 0 8px 0;">${loc.address}</p>
              ${loc.youtube_url ? `<a href="${loc.youtube_url}" target="_blank" style="color:#C8973A;font-size:12px;text-decoration:underline;">Watch walkthrough video</a>` : ""}
            </td>
            <td style="vertical-align:top;text-align:right;width:100px;">
              ${loc.keybox_code ? `
              <p style="color:#F0E8D2;opacity:0.4;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Keybox Code</p>
              <p style="color:#2D6A47;font-size:20px;font-weight:700;margin:0;letter-spacing:3px;">${loc.keybox_code}</p>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
      `).join("") : ""}

      <!-- Book Button -->
      <div style="text-align:center;margin:24px 0;">
        <a href="https://gimme-git-main-bridgn.vercel.app/book" style="display:inline-block;background-color:#C8973A;color:#060A07;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Book Your First Session</a>
      </div>

      <!-- Contact -->
      <div style="background-color:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;text-align:center;">
        <p style="color:#F0E8D2;font-size:13px;font-weight:600;margin:0 0 6px 0;">Need anything? Text us — it's the fastest way to reach us.</p>
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
        console.log("[WEBHOOK] Membership welcome email sent to", customerEmail);
      } catch (emailErr) {
        console.error("[WEBHOOK] Failed to send membership email:", emailErr);
      }

      return NextResponse.json({ received: true });
    }

    // ── Booking purchase ──
    const locationName = meta.location || "";
    const dateISO = meta.dateISO || "";
    const hour = parseInt(meta.hour || "0", 10);
    const dur = parseInt(meta.duration || "1", 10);
    const customerName = meta.customerName || "";
    const customerEmail = meta.customerEmail || "";
    const customerPhone = meta.customerPhone || "";
    const dateDisplay = meta.date || dateISO;
    const timeDisplay = meta.time || `${formatTime(hour)} – ${formatTime(hour + dur)}`;

    // Build start/end timestamps for the full duration
    const startTime = new Date(`${dateISO}T${String(hour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + dur * 60 * 60 * 1000);

    // Upsert customer
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .single();

    let customerId: string;
    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabaseAdmin
        .from("customers")
        .update({ name: customerName, phone: customerPhone || null })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: custErr } = await supabaseAdmin
        .from("customers")
        .insert({
          name: customerName,
          email: customerEmail,
          phone: customerPhone || null,
        })
        .select("id")
        .single();

      if (custErr || !newCustomer) {
        console.error("Failed to create customer:", custErr);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    console.log("[WEBHOOK] Customer ID:", customerId);

    // Create booking(s) — one per hour slot to prevent double-booking
    const bookingRows = Array.from({ length: dur }, (_, i) => {
      const slotStart = new Date(`${dateISO}T${String(hour + i).padStart(2, "0")}:00:00`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
      return {
        customer_id: customerId,
        location: locationName.toLowerCase(),
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
        duration_hours: 1,
        status: "confirmed",
        payment_status: "paid",
        stripe_payment_id: session.payment_intent as string,
      };
    });

    const { error: bookErr } = await supabaseAdmin.from("bookings").insert(bookingRows);

    if (bookErr) {
      console.error("[WEBHOOK] Failed to create booking:", bookErr);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
    console.log("[WEBHOOK] Booking saved successfully");

    // Fetch location details for keybox code and YouTube URL
    const { data: locationData, error: locErr } = await supabaseAdmin
      .from("locations")
      .select("address, keybox_code, youtube_url")
      .eq("name", locationName)
      .single();

    console.log("[WEBHOOK] Location lookup:", { locationData, locErr });

    const keyboxCode = locationData?.keybox_code || "N/A";
    const youtubeUrl = locationData?.youtube_url || "";
    const address = locationData?.address || "";

    console.log("[WEBHOOK] Sending email to:", customerEmail, "| keybox:", keyboxCode, "| youtube:", youtubeUrl);

    // Send confirmation email
    try {
      const emailResult = await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
        to: customerEmail,
        subject: `Booking Confirmed — ${locationName} on ${dateDisplay}`,
        html: buildConfirmationEmail({
          customerName,
          locationName,
          address,
          dateDisplay,
          timeDisplay,
          keyboxCode,
          youtubeUrl,
        }),
      });
      console.log("[WEBHOOK] Resend response:", JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error("[WEBHOOK] Resend error:", emailErr);
    }

    console.log(`[WEBHOOK] Complete: ${locationName} on ${dateISO} at ${hour}:00`);
  }

  return NextResponse.json({ received: true });
}
