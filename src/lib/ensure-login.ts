import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { dbSelect } from "@/lib/supabase-rest";
import { EMAIL_LOGO_URL, EMAIL_SITE_URL } from "@/lib/email";

// Ensure a customer actually has a login account. Walk-in customers (and anyone
// added without going through signup) get a customer record but no auth user —
// so they can't log in and "forgot password" silently does nothing (Supabase
// won't reveal that no account exists). Whenever we grant someone a membership,
// make sure they can access it: create the auth account if it's missing and
// email a "set your password" link. No-ops if they already have a login.
export async function ensureMemberLogin(customerId: string) {
  try {
    const custArr = await dbSelect("customers", `id=eq.${customerId}&limit=1`);
    const cust = Array.isArray(custArr) && custArr.length > 0 ? custArr[0] : null;
    if (!cust?.email) return;

    const admin = getSupabaseAdmin();
    const { data: created, error } = await admin.auth.admin.createUser({
      email: cust.email,
      email_confirm: true,
      user_metadata: { name: cust.name, phone: cust.phone },
    });
    // An error here almost always means the account already exists — nothing to do.
    if (error || !created?.user) return;

    const { data: resetData } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: cust.email,
      options: { redirectTo: `${EMAIL_SITE_URL}/update-password` },
    });
    const resetLink = resetData?.properties?.action_link || "";
    if (!resetLink) return;

    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: "Gimme Golf <hello@gimmegolfsimulators.com>",
      to: cust.email,
      replyTo: "info@gimmegolfsimulators.com",
      subject: "Welcome to Gimme Golf — Set Up Your Account",
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
      <h2 style="color:#F0E8D2;font-size:22px;font-weight:700;margin:0 0 8px 0;">Welcome to Gimme Golf, ${cust.name}!</h2>
      <p style="color:#F0E8D2;opacity:0.6;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
        Your account and membership are all set up. Click below to set your password, then log in to book sessions at either location.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetLink}" style="display:inline-block;background-color:#2D6A47;color:#F0E8D2;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Set Your Password</a>
      </div>
      <p style="color:#F0E8D2;opacity:0.4;font-size:13px;line-height:1.6;margin:0 0 16px 0;">
        After setting your password, log in at gimmegolfsimulators.com to manage your bookings.
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
  } catch (err) {
    console.error("[ensureMemberLogin] failed:", err);
  }
}
