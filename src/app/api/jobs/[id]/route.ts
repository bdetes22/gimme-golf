import { NextRequest, NextResponse } from "next/server";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const password = req.nextUrl.searchParams.get("password");
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch job
  const jobArr = await dbSelect("jobs", `id=eq.${id}&limit=1`);
  if (!Array.isArray(jobArr) || jobArr.length === 0) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const job = jobArr[0];

  // Fetch expenses, photos, activity in parallel
  const [expenses, photos, activity] = await Promise.all([
    dbSelect("job_expenses", `job_id=eq.${id}&order=date.desc`),
    dbSelect("job_photos", `job_id=eq.${id}&order=created_at.desc`),
    dbSelect("job_activity", `job_id=eq.${id}&order=created_at.desc`),
  ]);

  const totalExpenses = Array.isArray(expenses)
    ? expenses.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.amount || 0), 0)
    : 0;

  return NextResponse.json({
    ...job,
    expenses: Array.isArray(expenses) ? expenses : [],
    photos: Array.isArray(photos) ? photos : [],
    activity: Array.isArray(activity) ? activity : [],
    total_expenses: totalExpenses,
  });
}
