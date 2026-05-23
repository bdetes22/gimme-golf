import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbInsert, dbUpdate, dbDelete } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if presets only
  const presetsOnly = req.nextUrl.searchParams.get("presetsOnly");
  if (presetsOnly) {
    const presets = await dbSelect("expense_presets", "order=created_at.asc");
    return NextResponse.json(Array.isArray(presets) ? presets : []);
  }

  // Fetch all jobs
  const jobs = await dbSelect("jobs", "order=created_at.desc");
  if (!Array.isArray(jobs)) {
    return NextResponse.json([]);
  }

  // Fetch all expenses to compute totals per job
  const expenses = await dbSelect("job_expenses", "select=job_id,amount");
  const expenseMap: Record<string, number> = {};
  if (Array.isArray(expenses)) {
    for (const e of expenses) {
      const jid = e.job_id as string;
      expenseMap[jid] = (expenseMap[jid] || 0) + Number(e.amount || 0);
    }
  }

  const enriched = jobs.map((j: Record<string, unknown>) => ({
    ...j,
    total_expenses: expenseMap[j.id as string] || 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, action } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Create job ──
  if (action === "create_job") {
    const {
      quote_id,
      client_name,
      client_email,
      client_phone,
      client_address,
      title,
      status,
      quoted_amount,
      scheduled_start,
      scheduled_end,
      notes,
      internal_notes,
    } = body;

    let jobData: Record<string, unknown> = {
      title: title || "Untitled Job",
      client_name: client_name || "",
      client_email: client_email || null,
      client_phone: client_phone || null,
      client_address: client_address || null,
      status: status || "lead",
      quoted_amount: quoted_amount ? Number(quoted_amount) : null,
      scheduled_start: scheduled_start || null,
      scheduled_end: scheduled_end || null,
      notes: notes || null,
      internal_notes: internal_notes || null,
      quote_id: quote_id || null,
    };

    // If quote_id provided, pull client info from quote
    if (quote_id) {
      const quoteArr = await dbSelect("quotes", `id=eq.${quote_id}&limit=1`);
      if (Array.isArray(quoteArr) && quoteArr.length > 0) {
        const q = quoteArr[0];
        jobData = {
          ...jobData,
          client_name: jobData.client_name || q.client_name || "",
          client_email: jobData.client_email || q.client_email || null,
          client_phone: jobData.client_phone || q.client_phone || null,
          client_address: jobData.client_address || q.client_address || null,
          quoted_amount: jobData.quoted_amount ?? (q.total ? Number(q.total) : null),
        };
      }
    }

    const result = await dbInsert("jobs", jobData);
    if (Array.isArray(result) && result.length > 0) {
      // Log activity
      await dbInsert("job_activity", {
        job_id: result[0].id,
        action: "Job created",
        details: quote_id ? `Created from quote ${quote_id}` : null,
      });
    }
    return NextResponse.json(result);
  }

  // ── Update job ──
  if (action === "update_job") {
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Remove non-field keys
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "client_name", "client_email", "client_phone", "client_address",
      "status", "quoted_amount", "scheduled_start", "scheduled_end",
      "actual_start", "actual_end", "notes", "internal_notes", "quote_id",
    ];
    for (const key of allowedFields) {
      if (key in fields) {
        updateData[key] = fields[key];
      }
    }
    updateData.updated_at = new Date().toISOString();

    const result = await dbUpdate("jobs", `id=eq.${id}`, updateData);

    // Log status change
    if (fields.status) {
      await dbInsert("job_activity", {
        job_id: id,
        action: "Status changed",
        details: `Status set to ${fields.status}`,
      });
    }

    return NextResponse.json(result);
  }

  // ── Delete job ──
  if (action === "delete_job") {
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Delete related records first
    await dbDelete("job_expenses", `job_id=eq.${id}`);
    await dbDelete("job_photos", `job_id=eq.${id}`);
    await dbDelete("job_activity", `job_id=eq.${id}`);
    await dbDelete("jobs", `id=eq.${id}`);

    return NextResponse.json({ success: true });
  }

  // ── Add expense ──
  if (action === "add_expense") {
    const { job_id, description, category, amount, receipt_url, vendor, date, notes: expNotes } = body;
    if (!job_id || !description || amount === undefined) {
      return NextResponse.json({ error: "job_id, description, and amount are required" }, { status: 400 });
    }

    const result = await dbInsert("job_expenses", {
      job_id,
      description,
      category: category || "other",
      amount: Number(amount),
      receipt_url: receipt_url || null,
      vendor: vendor || null,
      date: date || new Date().toISOString().split("T")[0],
      notes: expNotes || null,
    });

    // Log activity
    await dbInsert("job_activity", {
      job_id,
      action: "Expense added",
      details: `${description}: $${Number(amount).toFixed(2)}`,
    });

    return NextResponse.json(result);
  }

  // ── Update expense ──
  if (action === "update_expense") {
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ["description", "category", "amount", "receipt_url", "vendor", "date", "notes"];
    for (const key of allowedFields) {
      if (key in fields) {
        updateData[key] = fields[key];
      }
    }

    const result = await dbUpdate("job_expenses", `id=eq.${id}`, updateData);
    return NextResponse.json(result);
  }

  // ── Delete expense ──
  if (action === "delete_expense") {
    const { id, job_id } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await dbDelete("job_expenses", `id=eq.${id}`);

    if (job_id) {
      await dbInsert("job_activity", {
        job_id,
        action: "Expense deleted",
        details: null,
      });
    }

    return NextResponse.json({ success: true });
  }

  // ── Add activity ──
  if (action === "add_activity") {
    const { job_id, action: actAction, details } = body;
    if (!job_id || !actAction) {
      return NextResponse.json({ error: "job_id and action are required" }, { status: 400 });
    }

    const result = await dbInsert("job_activity", {
      job_id,
      action: actAction,
      details: details || null,
    });

    return NextResponse.json(result);
  }

  // ── Create from quote ──
  if (action === "create_from_quote") {
    const { quote_id } = body;
    if (!quote_id) {
      return NextResponse.json({ error: "quote_id is required" }, { status: 400 });
    }

    const quoteArr = await dbSelect("quotes", `id=eq.${quote_id}&limit=1`);
    if (!Array.isArray(quoteArr) || quoteArr.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const q = quoteArr[0];
    const jobResult = await dbInsert("jobs", {
      quote_id: q.id,
      client_name: q.client_name || "",
      client_email: q.client_email || null,
      client_phone: q.client_phone || null,
      client_address: q.client_address || null,
      title: `Build — ${q.client_name || "Client"}`,
      status: "scheduled",
      quoted_amount: q.total ? Number(q.total) : null,
    });

    if (Array.isArray(jobResult) && jobResult.length > 0) {
      await dbInsert("job_activity", {
        job_id: jobResult[0].id,
        action: "Job created from quote",
        details: `Quote #${q.quote_number || q.id}`,
      });
    }

    return NextResponse.json(jobResult);
  }

  // ── Expense Presets ──
  if (action === "add_preset") {
    const result = await dbInsert("expense_presets", {
      description: body.description,
      category: body.category || "materials",
      amount: body.amount || 0,
      vendor: body.vendor || null,
      link: body.link || null,
    });
    return NextResponse.json(result?.[0] || { success: true });
  }

  if (action === "delete_preset") {
    await dbDelete("expense_presets", `id=eq.${body.id}`);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
