import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbInsert, dbUpdate } from "@/lib/supabase-rest";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await dbSelect("quotes", "order=created_at.desc");
  return NextResponse.json(quotes || []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Request final payment
    if (body.action === "request_final") {
      const quotes = await dbSelect("quotes", `id=eq.${body.id}`);
      const quote = quotes?.[0];
      if (!quote || !quote.client_email) {
        return NextResponse.json({ error: "Quote or email not found" }, { status: 400 });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      const origin = req.nextUrl.origin;
      const finalAmount = Number(quote.deposit_amount);

      await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
        to: quote.client_email,
        subject: `Final Payment Due — Quote #${quote.quote_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #060A07; color: #F0E8D2; padding: 40px; border-radius: 8px;">
            <img src="${origin}/logos/logo-trimmed.png" alt="Gimme Golf" style="height: 40px; margin-bottom: 24px;" />
            <h1 style="color: #C8973A; font-size: 24px; margin: 0 0 16px;">Final Payment Due</h1>
            <p style="color: #F0E8D2; opacity: 0.8; line-height: 1.6;">
              Hi ${quote.client_name},<br><br>
              Your golf simulator installation is complete (or nearing completion)! The remaining balance of <strong style="color: #C8973A;">$${finalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> is now due.
            </p>
            <p style="margin: 24px 0;">
              <strong style="color: #F0E8D2;">Quote #${quote.quote_number}</strong><br/>
              <span style="color: #F0E8D2; opacity: 0.6;">Total: $${Number(quote.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span><br/>
              <span style="color: #F0E8D2; opacity: 0.6;">Remaining Balance: $${finalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </p>
            <p style="color: #F0E8D2; opacity: 0.7; line-height: 1.6; font-size: 14px;">
              <strong>Payment Options:</strong><br/>
              • ACH Bank Transfer or Card — <a href="${origin}/quote/${quote.id}" style="color: #2D6A47;">pay online</a><br/>
              • Check payable to: <strong>Deters Birrell Golf LLC</strong><br/>
              • Zelle or Venmo — contact us for details
            </p>
            <a href="${origin}/quote/${quote.id}" style="display: inline-block; background: #2D6A47; color: #F0E8D2; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Pay Online
            </a>
            <p style="color: #F0E8D2; opacity: 0.4; font-size: 13px; margin-top: 24px;">
              Payment is due within 14 days of project completion. Questions? Call or text (801) 513-3538.
            </p>
            <hr style="border: none; border-top: 1px solid rgba(240,232,210,0.1); margin: 24px 0;" />
            <p style="color: #F0E8D2; opacity: 0.3; font-size: 12px;">
              Gimme Golf | Deters Birrell Golf LLC<br/>
              140 N Main St, Kaysville, UT 84037
            </p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // Send action: update status and send email
    if (body.action === "send") {
      const now = new Date().toISOString();
      await dbUpdate("quotes", `id=eq.${body.id}`, {
        status: "sent",
        sent_at: now,
      });

      const quotes = await dbSelect("quotes", `id=eq.${body.id}`);
      const quote = quotes?.[0];
      if (quote && quote.client_email) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const origin = req.nextUrl.origin;
        const quoteUrl = `${origin}/quote/${quote.id}`;

        console.log("[QUOTES] Sending quote email to:", quote.client_email);
        const emailResult = await resend.emails.send({
          from: "Gimme Golf <onboarding@resend.dev>",
          to: quote.client_email,
          subject: `Your Quote #${quote.quote_number} from Gimme Golf`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #060A07; color: #F0E8D2; padding: 40px; border-radius: 8px;">
              <img src="${origin}/logos/logo-main.png" alt="Gimme Golf" style="height: 50px; margin-bottom: 24px;" />
              <h1 style="color: #C8973A; font-size: 24px; margin: 0 0 16px;">Your Quote is Ready</h1>
              <p style="color: #F0E8D2; opacity: 0.8; line-height: 1.6;">
                Hi ${quote.client_name},<br><br>
                Thank you for your interest in Gimme Golf! We've prepared a detailed quote for your golf simulator installation.
              </p>
              <p style="margin: 24px 0;">
                <strong style="color: #C8973A;">Quote #${quote.quote_number}</strong><br/>
                <span style="color: #F0E8D2; opacity: 0.6;">Total: $${Number(quote.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </p>
              <a href="${quoteUrl}" style="display: inline-block; background: #2D6A47; color: #F0E8D2; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
                View Your Quote
              </a>
              <p style="color: #F0E8D2; opacity: 0.5; font-size: 14px; margin-top: 32px;">
                This quote is valid for 14 days. If you have any questions, reply to this email or call us at (801) 513-3538.
              </p>
              <hr style="border: none; border-top: 1px solid rgba(240,232,210,0.1); margin: 24px 0;" />
              <p style="color: #F0E8D2; opacity: 0.3; font-size: 12px;">
                Gimme Golf | Deters Birrell Golf LLC<br/>
                140 N Main St, Kaysville, UT 84037
              </p>
            </div>
          `,
        });
        console.log("[QUOTES] Resend result:", JSON.stringify(emailResult));
      } else {
        console.log("[QUOTES] No client email found, skipping email send");
      }

      return NextResponse.json({ success: true });
    }

    // Update existing quote
    if (body.id) {
      const updateData: Record<string, unknown> = {};
      if (body.clientName !== undefined) updateData.client_name = body.clientName;
      if (body.clientEmail !== undefined) updateData.client_email = body.clientEmail;
      if (body.clientPhone !== undefined) updateData.client_phone = body.clientPhone;
      if (body.clientAddress !== undefined) updateData.client_address = body.clientAddress;
      if (body.lineItems !== undefined) updateData.line_items = body.lineItems;
      if (body.subtotal !== undefined) updateData.subtotal = body.subtotal;
      if (body.total !== undefined) updateData.total = body.total;
      if (body.depositAmount !== undefined) updateData.deposit_amount = body.depositAmount;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.payment_method !== undefined) updateData.payment_method = body.payment_method;
      if (body.paid_at !== undefined) updateData.paid_at = body.paid_at;
      await dbUpdate("quotes", `id=eq.${body.id}`, updateData);
      const updated = await dbSelect("quotes", `id=eq.${body.id}`);
      return NextResponse.json(updated?.[0] || {});
    }

    // Create new quote — auto-generate quote_number
    const existing = await dbSelect(
      "quotes",
      "select=quote_number&order=quote_number.desc&limit=1"
    );
    let nextNum = 18; // default continues from #0000017
    if (existing?.length > 0 && existing[0].quote_number) {
      const current = parseInt(existing[0].quote_number, 10);
      if (!isNaN(current)) nextNum = current + 1;
    }
    const quoteNumber = String(nextNum).padStart(7, "0");

    const result = await dbInsert("quotes", {
      quote_number: quoteNumber,
      client_name: body.clientName || body.client_name || "",
      client_email: body.clientEmail || body.client_email || "",
      client_phone: body.clientPhone || body.client_phone || "",
      client_address: body.clientAddress || body.client_address || "",
      line_items: body.lineItems || body.line_items || [],
      subtotal: body.subtotal || 0,
      total: body.total || 0,
      deposit_amount: body.depositAmount || body.deposit_amount || 0,
      notes: body.notes || "",
      status: body.status || "draft",
    });

    return NextResponse.json(result?.[0] || result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
