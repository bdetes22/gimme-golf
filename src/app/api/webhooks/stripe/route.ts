import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const supabaseAdmin = getSupabaseAdmin();
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    const locationName = meta.location || "";
    const dateISO = meta.dateISO || "";
    const hour = parseInt(meta.hour || "0", 10);
    const customerName = meta.customerName || "";
    const customerEmail = meta.customerEmail || "";
    const customerPhone = meta.customerPhone || "";

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
      // Update name/phone if provided
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
      console.error("Failed to create booking:", bookErr);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    console.log(`Booking saved: ${locationName} on ${dateISO} at ${hour}:00`);
  }

  return NextResponse.json({ received: true });
}
