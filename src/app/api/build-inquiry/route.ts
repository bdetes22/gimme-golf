import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { dbInsert } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, width, length, height, budget, timeline, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: "Gimme Golf <hello@gimmegolfsimulators.com>",
      to: "info@gimmegolfsimulators.com",
      replyTo: email,
      subject: `New Build Inquiry from ${name}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#060A07;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
      <h1 style="color:#C8973A;font-size:22px;margin:0 0 4px 0;">New Build Inquiry</h1>
      <p style="color:#F0E8D2;opacity:0.5;font-size:14px;margin:0 0 24px 0;">Submitted from gimmegolfsimulators.com</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:10px 0;border-bottom:1px solid #1a2a1f;width:140px;">Name</td>
          <td style="color:#F0E8D2;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid #1a2a1f;">${name}</td>
        </tr>
        <tr>
          <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:10px 0;border-bottom:1px solid #1a2a1f;">Email</td>
          <td style="color:#F0E8D2;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid #1a2a1f;"><a href="mailto:${email}" style="color:#2D6A47;">${email}</a></td>
        </tr>
        <tr>
          <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:10px 0;border-bottom:1px solid #1a2a1f;">Phone</td>
          <td style="color:#F0E8D2;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid #1a2a1f;">${phone || "Not provided"}</td>
        </tr>
        <tr>
          <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:10px 0;border-bottom:1px solid #1a2a1f;">Room Size</td>
          <td style="color:#F0E8D2;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid #1a2a1f;">${width && length && height ? `${width}' W × ${length}' L × ${height}' H` : "Not provided"}</td>
        </tr>
        <tr>
          <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:10px 0;border-bottom:1px solid #1a2a1f;">Budget</td>
          <td style="color:#F0E8D2;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid #1a2a1f;">${budget || "Not specified"}</td>
        </tr>
        <tr>
          <td style="color:#F0E8D2;opacity:0.5;font-size:13px;padding:10px 0;border-bottom:1px solid #1a2a1f;">Timeline</td>
          <td style="color:#F0E8D2;font-size:14px;font-weight:600;padding:10px 0;border-bottom:1px solid #1a2a1f;">${timeline || "Not specified"}</td>
        </tr>
        ${message ? `
        <tr>
          <td colspan="2" style="padding:16px 0 0 0;">
            <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0 0 6px 0;">Message</p>
            <p style="color:#F0E8D2;font-size:14px;line-height:1.6;margin:0;background:#060A07;border-radius:8px;padding:12px;">${message}</p>
          </td>
        </tr>
        ` : ""}
      </table>
    </div>
  </div>
</body>
</html>`,
    });

    // Save to messages table
    try {
      await dbInsert("messages", {
        type: "build_inquiry",
        name,
        email,
        phone: phone || null,
        message: message || null,
        metadata: { width, length, height, budget, timeline },
      });
    } catch (dbErr) {
      console.error("Failed to save build inquiry to DB:", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Build inquiry error:", err);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
