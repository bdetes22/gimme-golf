import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { dbInsert } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: "Gimme Golf <hello@gimmegolfsimulators.com>",
      to: "info@gimmegolfsimulators.com",
      replyTo: email,
      subject: `Contact Form: ${subject || "General Inquiry"} — from ${name}`,
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f1610;border-radius:12px;">
  <h2 style="color:#C8973A;margin:0 0 16px;">New Contact Form Submission</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="color:#F0E8D2;opacity:0.5;padding:8px 0;font-size:13px;border-bottom:1px solid #1a2a1f;">Name</td><td style="color:#F0E8D2;padding:8px 0;font-size:14px;font-weight:600;border-bottom:1px solid #1a2a1f;">${name}</td></tr>
    <tr><td style="color:#F0E8D2;opacity:0.5;padding:8px 0;font-size:13px;border-bottom:1px solid #1a2a1f;">Email</td><td style="color:#F0E8D2;padding:8px 0;font-size:14px;border-bottom:1px solid #1a2a1f;"><a href="mailto:${email}" style="color:#2D6A47;">${email}</a></td></tr>
    <tr><td style="color:#F0E8D2;opacity:0.5;padding:8px 0;font-size:13px;border-bottom:1px solid #1a2a1f;">Subject</td><td style="color:#F0E8D2;padding:8px 0;font-size:14px;border-bottom:1px solid #1a2a1f;">${subject || "General Inquiry"}</td></tr>
  </table>
  <div style="margin-top:16px;padding:12px;background:#060A07;border-radius:8px;">
    <p style="color:#F0E8D2;opacity:0.5;font-size:12px;margin:0 0 6px;">Message</p>
    <p style="color:#F0E8D2;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
  </div>
</div>`,
    });

    // Save to messages table
    try {
      await dbInsert("messages", {
        type: "contact",
        name,
        email,
        subject: subject || null,
        message,
      });
    } catch (dbErr) {
      console.error("Failed to save contact message to DB:", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
