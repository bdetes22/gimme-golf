import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { EMAIL_LOGO_URL, EMAIL_SITE_URL } from "@/lib/email";

export const dynamic = "force-dynamic";

// Password reset, delivered via Resend (our reliable, branded email) instead of
// Supabase's built-in mailer — so customers actually receive it and recognize
// the sender. We always return success regardless of whether the account
// exists, so this can't be used to probe which emails have accounts.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // generateLink produces the same recovery link Supabase would email, but
    // lets us send it ourselves. It errors if no account exists for the email.
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${EMAIL_SITE_URL}/update-password` },
    });

    const resetLink = data?.properties?.action_link || "";

    // No account (or other error): stay silent so we don't reveal account
    // existence. The user sees the same "check your email" message either way.
    if (error || !resetLink) {
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: "Gimme Golf <hello@gimmegolfsimulators.com>",
      to: email,
      replyTo: "info@gimmegolfsimulators.com",
      subject: "Reset Your Gimme Golf Password",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#060A07;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${EMAIL_LOGO_URL}" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
    </div>
    <div style="background-color:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">Reset Your Password</h2>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        We got a request to reset the password for your Gimme Golf account. Click below to choose a new one.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetLink}" style="display:inline-block;background-color:#2D6A47;color:#F0E8D2;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Reset Password</a>
      </div>
      <p style="color:#F0E8D2;opacity:0.4;font-size:13px;line-height:1.6;margin:0 0 16px 0;">
        Didn't request this? You can safely ignore this email — your password won't change.
      </p>
      <div style="background-color:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;text-align:center;">
        <p style="color:#F0E8D2;font-size:13px;font-weight:600;margin:0 0 6px 0;">Need help? Text us — it's the fastest way to reach us.</p>
        <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">(801) 513-3538 · info@gimmegolfsimulators.com</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password reset error:", err);
    // Still return success so the UI doesn't leak details or look broken.
    return NextResponse.json({ success: true });
  }
}
