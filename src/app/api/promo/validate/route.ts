import { NextRequest, NextResponse } from "next/server";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" });
  }

  const promos = await dbSelect(
    "promo_codes",
    `code=eq.${encodeURIComponent(code.trim().toUpperCase())}&used=eq.false&limit=1`
  );

  if (!Array.isArray(promos) || promos.length === 0) {
    return NextResponse.json({ valid: false, error: "Invalid or already used code" });
  }

  const promo = promos[0];

  // Check expiry
  if (promo.expires_at && new Date(promo.expires_at as string) < new Date()) {
    return NextResponse.json({ valid: false, error: "This code has expired" });
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discount: Number(promo.discount_amount),
    type: promo.type,
  });
}
