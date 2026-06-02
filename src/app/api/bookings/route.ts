import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const location = req.nextUrl.searchParams.get("location");
  const date = req.nextUrl.searchParams.get("date"); // ISO date string YYYY-MM-DD

  if (!location || !date) {
    return NextResponse.json({ error: "location and date are required" }, { status: 400 });
  }

  // Use Mountain Time offset for the day boundaries
  const dayStart = `${date}T00:00:00-06:00`;
  const dayEnd = `${date}T23:59:59-06:00`;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("start_time")
    .eq("location", location.toLowerCase())
    .neq("status", "cancelled")
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd);

  if (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  // Convert UTC times back to Mountain Time hours
  const bookedHours = (data || []).map((b) => {
    const utcDate = new Date(b.start_time);
    // Convert to Mountain Time (UTC-6)
    const mtHour = (utcDate.getUTCHours() - 6 + 24) % 24;
    return mtHour;
  });

  return NextResponse.json({ bookedHours });
}
