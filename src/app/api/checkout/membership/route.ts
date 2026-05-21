import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

interface PlanConfig {
  name: string;
  amount: number;
  type: string;
  mode: "payment" | "subscription";
  interval?: "month";
}

const PLANS: Record<string, PlanConfig> = {
  punchpass: {
    name: "Punch Pass — 10 Sessions",
    amount: 29900,
    type: "punchpass",
    mode: "payment",
  },
  monthly: {
    name: "Monthly Membership",
    amount: 17900,
    type: "monthly",
    mode: "subscription",
    interval: "month",
  },
  annual: {
    name: "Annual Membership",
    amount: 120000,
    type: "annual",
    mode: "payment",
  },
};

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });

    const { plan, customerId, customerEmail, customerName } = await req.json();

    const planInfo = PLANS[plan];
    if (!planInfo) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!customerId || !customerEmail) {
      return NextResponse.json({ error: "Must be logged in to purchase a membership" }, { status: 400 });
    }

    if (planInfo.mode === "subscription") {
      // Recurring subscription for monthly
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: planInfo.name },
              unit_amount: planInfo.amount,
              recurring: { interval: planInfo.interval! },
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "membership",
          plan: planInfo.type,
          customerId,
          customerEmail,
          customerName: customerName || "",
        },
        subscription_data: {
          metadata: {
            type: "membership",
            plan: planInfo.type,
            customerId,
            customerEmail,
            customerName: customerName || "",
          },
        },
        success_url: `${req.nextUrl.origin}/memberships/success?plan=${plan}`,
        cancel_url: `${req.nextUrl.origin}/memberships`,
      });

      return NextResponse.json({ url: session.url });
    } else {
      // One-time payment for punch pass and annual
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: planInfo.name },
              unit_amount: planInfo.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "membership",
          plan: planInfo.type,
          customerId,
          customerEmail,
          customerName: customerName || "",
        },
        success_url: `${req.nextUrl.origin}/memberships/success?plan=${plan}`,
        cancel_url: `${req.nextUrl.origin}/memberships`,
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
