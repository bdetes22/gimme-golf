import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json({ user: authData.user });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
