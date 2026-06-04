import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    // Verify the user's session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user?.email) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check if admin
    const customers = await dbSelect("customers", `email=eq.${encodeURIComponent(user.email)}&is_admin=eq.true&limit=1`);
    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    // Return the admin password so the client can use it for API calls
    return NextResponse.json({ pw: process.env.ADMIN_PASSWORD });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
