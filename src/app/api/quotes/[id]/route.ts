import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quotes = await dbSelect("quotes", `id=eq.${id}`);
  if (!quotes?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(quotes[0]);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await dbUpdate("quotes", `id=eq.${id}`, body);
    const updated = await dbSelect("quotes", `id=eq.${id}`);
    return NextResponse.json(updated?.[0] || {});
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
