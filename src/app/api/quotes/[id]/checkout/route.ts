import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { method } = await req.json();

    const quotes = await dbSelect("quotes", `id=eq.${id}`);
    if (!quotes?.length) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const quote = quotes[0];
    const depositAmount = Number(quote.deposit_amount);

    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid deposit amount" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });

    const origin = req.nextUrl.origin;
    const isACH = method === "ach";
    const amountCents = isACH
      ? Math.round(depositAmount * 100)
      : Math.round(depositAmount * 1.03 * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: isACH ? ["us_bank_account"] : ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Gimme Golf — Quote #${quote.quote_number} Deposit`,
              description: isACH
                ? "50% deposit via ACH bank transfer"
                : "50% deposit via card (includes 3% processing fee)",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "quote_deposit",
        quoteId: id,
      },
      success_url: `${origin}/quote/${id}?paid=true`,
      cancel_url: `${origin}/quote/${id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
