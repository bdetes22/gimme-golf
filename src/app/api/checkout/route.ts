import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { location, date, time, customerName, customerEmail, amount } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Golf Simulator — ${location}`,
              description: `${date} at ${time} (1 hour)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        location,
        date,
        time,
        customerName,
        customerEmail,
      },
      success_url: `${req.nextUrl.origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/book`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
