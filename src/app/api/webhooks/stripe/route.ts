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

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;">
      <p style="color:#F0E8D2;opacity:0.3;font-size:12px;margin:0 0 4px 0;">Questions? Email us at info@gimmegolfsimulators.com</p>
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

    const locationName = meta.location || "";
    const dateISO = meta.dateISO || "";
    const hour = parseInt(meta.hour || "0", 10);
    const customerName = meta.customerName || "";
    const customerEmail = meta.customerEmail || "";
    const customerPhone = meta.customerPhone || "";
    const dateDisplay = meta.date || dateISO;
    const timeDisplay = meta.time || `${formatTime(hour)} – ${formatTime(hour + 1)}`;

    // Build start/end timestamps
    const startTime = new Date(`${dateISO}T${String(hour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

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

    // Create booking
    const { error: bookErr } = await supabaseAdmin.from("bookings").insert({
      customer_id: customerId,
      location: locationName.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "confirmed",
      payment_status: "paid",
      stripe_payment_id: session.payment_intent as string,
    });

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
