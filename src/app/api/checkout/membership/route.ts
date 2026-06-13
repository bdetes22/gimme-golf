import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { dbSelect, dbInsert, dbUpdate } from "@/lib/supabase-rest";
import { getSupabaseAdmin } from "@/lib/supabase-server";

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

    const { plan, promoCode } = await req.json();

    const planInfo = PLANS[plan];
    if (!planInfo) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Require a real logged-in account. Validate the caller's Supabase session
    // token instead of trusting client-supplied identity — a plan can't be
    // purchased without an account, and identity comes from the verified user.
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Please log in or create an account to purchase a plan." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user?.email) {
      return NextResponse.json({ error: "Your session has expired. Please log in again." }, { status: 401 });
    }

    const customerEmail = user.email;
    const customerName = (user.user_metadata?.name as string) || customerEmail;

    // Guarantee a customer record exists for this account (matched by email),
    // so the purchaser always has a login paired with their membership.
    let customerId: string;
    const existing = await dbSelect(
      "customers",
      `email=eq.${encodeURIComponent(customerEmail)}&select=id&limit=1`
    );
    if (Array.isArray(existing) && existing.length > 0) {
      customerId = existing[0].id;
    } else {
      await dbInsert("customers", {
        id: user.id,
        email: customerEmail,
        name: customerName,
      });
      customerId = user.id;
    }

    // Validate and apply promo code
    let discountCents = 0;
    if (promoCode) {
      const promos = await dbSelect(
        "promo_codes",
        `code=eq.${encodeURIComponent(promoCode)}&used=eq.false&limit=1`
      );
      if (Array.isArray(promos) && promos.length > 0) {
        const promo = promos[0];
        if (!promo.expires_at || new Date(promo.expires_at as string) >= new Date()) {
          discountCents = Math.round(Number(promo.discount_amount) * 100);
          // Mark as used
          await dbUpdate("promo_codes", `id=eq.${promo.id}`, {
            used: true,
            used_at: new Date().toISOString(),
            used_by_email: customerEmail,
          });
        }
      }
    }

    const finalAmount = Math.max(planInfo.amount - discountCents, 0);

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
              unit_amount: finalAmount,
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
              unit_amount: finalAmount,
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
