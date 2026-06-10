import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { EMAIL_LOGO_URL } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone },
      });

    if (authError) {
      console.error("Auth user creation failed:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create customer record
    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .upsert(
        {
          id: authData.user.id,
          name,
          email,
          phone: phone || null,
        },
        { onConflict: "email" }
      );

    if (customerError) {
      console.error("Customer record creation failed:", customerError);
      // Clean up the auth user if customer creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create customer record" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    // Welcome email to customer
    try {
      await resend.emails.send({
        from: "Gimme Golf <hello@gimmegolfsimulators.com>",
        to: email,
        subject: "Welcome to Gimme Golf!",
        html: `
<div style="max-width:600px;margin:0 auto;padding:40px 24px;background:#060A07;font-family:-apple-system,sans-serif;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="${EMAIL_LOGO_URL}" alt="Gimme Golf" width="200" style="display:block;margin:0 auto" />
  </div>
  <div style="background:#0f1610;border:1px solid #1a2a1f;border-radius:12px;padding:32px;">
    <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome, ${name}!</h2>
    <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your Gimme Golf account is all set up. You're ready to book sessions at our 24/7 simulator locations in Kaysville and Clearfield.
    </p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://www.gimmegolfsimulators.com/book" style="display:inline-block;background:#2D6A47;color:#F0E8D2;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Book Your First Session</a>
    </div>
    <p style="color:#F0E8D2;opacity:0.5;font-size:13px;line-height:1.6;margin:0 0 16px;">
      Want unlimited access? Check out our <a href="https://www.gimmegolfsimulators.com/memberships" style="color:#C8973A;text-decoration:underline;">membership plans</a> starting at $179/mo with 20 hours per month.
    </p>
    <div style="background:#060A07;border:1px solid #1a2a1f;border-radius:8px;padding:16px;text-align:center;">
      <p style="color:#F0E8D2;font-size:13px;font-weight:600;margin:0 0 6px;">Questions? Text us — it's the fastest way to reach us.</p>
      <p style="color:#F0E8D2;opacity:0.5;font-size:13px;margin:0;">(801) 513-3538 · info@gimmegolfsimulators.com</p>
    </div>
  </div>
  <div style="text-align:center;padding:16px 0;">
    <p style="color:#F0E8D2;opacity:0.2;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Gimme Golf. All rights reserved.</p>
  </div>
</div>`,
      });
    } catch { /* non-blocking */ }

    // Admin notification — new account created
    try {
      await resend.emails.send({
        from: "Gimme Golf <hello@gimmegolfsimulators.com>",
        to: "info@gimmegolfsimulators.com",
        subject: `👤 New Account — ${name} (${email})`,
        html: `<div style="font-family:sans-serif;padding:24px;max-width:500px;">
          <h2 style="color:#2D6A47;margin:0 0 16px;">New Account Created</h2>
          <table style="width:100%;font-size:14px;">
            <tr><td style="padding:6px 0;color:#888;">Name</td><td style="padding:6px 0;"><strong>${name}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${phone || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</td></tr>
          </table>
        </div>`,
      });
    } catch { /* non-blocking */ }

    return NextResponse.json({ user: authData.user });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
