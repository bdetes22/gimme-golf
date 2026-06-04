import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";

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

    // Admin notification — new account created
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: "Gimme Golf <onboarding@resend.dev>",
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
