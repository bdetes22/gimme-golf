"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Expense {
  id: string;
  job_id: string;
  description: string;
  category: string;
  amount: number;
  receipt_url: string | null;
  vendor: string | null;
  date: string;
  notes: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  job_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

interface JobDetail {
  id: string;
  quote_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  title: string;
  status: string;
  quoted_amount: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string | null;
  expenses: Expense[];
  photos: { id: string; url: string; caption: string | null; phase: string; created_at: string }[];
  activity: Activity[];
  total_expenses: number;
}

const STATUS_ORDER = ["lead", "quoted", "scheduled", "in_progress", "complete"] as const;
const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  quoted: "Quoted",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  complete: "Complete",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-gray-600/40 text-gray-300",
  quoted: "bg-blue-900/40 text-blue-300",
  scheduled: "bg-[#C8973A]/30 text-[#C8973A]",
  in_progress: "bg-purple-900/40 text-purple-300",
  complete: "bg-[#2D6A47]/40 text-green-300",
  cancelled: "bg-red-900/40 text-red-300",
};

const CATEGORY_COLORS: Record<string, string> = {
  materials: "bg-blue-900/40 text-blue-300",
  labor: "bg-[#2D6A47]/40 text-green-300",
  equipment: "bg-purple-900/40 text-purple-300",
  food: "bg-amber-900/40 text-amber-300",
  travel: "bg-cyan-900/40 text-cyan-300",
  other: "bg-gray-700/40 text-gray-300",
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [jobId, setJobId] = useState<string>(params.id);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editClientAddress, setEditClientAddress] = useState("");
  const [editQuotedAmount, setEditQuotedAmount] = useState("");
  const [editScheduledStart, setEditScheduledStart] = useState("");
  const [editScheduledEnd, setEditScheduledEnd] = useState("");
  const [editActualStart, setEditActualStart] = useState("");
  const [editActualEnd, setEditActualEnd] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editInternalNotes, setEditInternalNotes] = useState("");

  // Add expense form
  const [expDesc, setExpDesc] = useState("");
  const [expCategory, setExpCategory] = useState("materials");
  const [expAmount, setExpAmount] = useState("");
  const [expVendor, setExpVendor] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expReceiptUrl, setExpReceiptUrl] = useState("");
  const [expNotes, setExpNotes] = useState("");

  useEffect(() => {
    setJobId(params.id);
  }, [params]);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      setPassword(stored);
      setAuthenticated(true);
    }
  }, []);

  const fetchJob = useCallback(
    async (pw: string) => {
      if (!jobId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/jobs/${jobId}?password=${encodeURIComponent(pw)}`);
        if (res.status === 401) {
          setError("Invalid password");
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Failed to load job");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setJob(data);
        setAuthenticated(true);
      } catch {
        setError("Network error");
      }
      setLoading(false);
    },
    [jobId]
  );

  useEffect(() => {
    if (authenticated && jobId) fetchJob(password);
  }, [authenticated, jobId, fetchJob, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("admin_pw", password);
    setAuthenticated(true);
  };

  const doJobAction = async (body: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, password }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Action failed");
      }
      await fetchJob(password);
    } catch {
      alert("Network error");
    }
    setActionLoading(false);
  };

  const startEditing = () => {
    if (!job) return;
    setEditing(true);
    setEditTitle(job.title || "");
    setEditClientName(job.client_name || "");
    setEditClientEmail(job.client_email || "");
    setEditClientPhone(job.client_phone || "");
    setEditClientAddress(job.client_address || "");
    setEditQuotedAmount(job.quoted_amount != null ? String(job.quoted_amount) : "");
    setEditScheduledStart(job.scheduled_start ? job.scheduled_start.split("T")[0] : "");
    setEditScheduledEnd(job.scheduled_end ? job.scheduled_end.split("T")[0] : "");
    setEditActualStart(job.actual_start ? job.actual_start.split("T")[0] : "");
    setEditActualEnd(job.actual_end ? job.actual_end.split("T")[0] : "");
    setEditNotes(job.notes || "");
    setEditInternalNotes(job.internal_notes || "");
  };

  const saveEdits = async () => {
    await doJobAction({
      action: "update_job",
      id: jobId,
      title: editTitle,
      client_name: editClientName,
      client_email: editClientEmail || null,
      client_phone: editClientPhone || null,
      client_address: editClientAddress || null,
      quoted_amount: editQuotedAmount ? Number(editQuotedAmount) : null,
      scheduled_start: editScheduledStart || null,
      scheduled_end: editScheduledEnd || null,
      actual_start: editActualStart || null,
      actual_end: editActualEnd || null,
      notes: editNotes || null,
      internal_notes: editInternalNotes || null,
    });
    setEditing(false);
  };

  const changeStatus = async (newStatus: string) => {
    await doJobAction({ action: "update_job", id: jobId, status: newStatus });
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await doJobAction({
      action: "add_expense",
      job_id: jobId,
      description: expDesc,
      category: expCategory,
      amount: Number(expAmount),
      vendor: expVendor || null,
      date: expDate,
      receipt_url: expReceiptUrl || null,
      notes: expNotes || null,
    });
    setExpDesc("");
    setExpAmount("");
    setExpVendor("");
    setExpReceiptUrl("");
    setExpNotes("");
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;
    await doJobAction({ action: "delete_expense", id: expenseId, job_id: jobId });
  };

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8">
          <h1 className="text-2xl font-bold text-[#F0E8D2] text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            JOB DETAILS
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] placeholder-[#F0E8D2]/40 focus:outline-none focus:border-[#C8973A]"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center">
        <p className="text-[#F0E8D2]/40">{loading ? "Loading..." : error || "Loading..."}</p>
      </div>
    );
  }

  const quotedAmount = Number(job.quoted_amount || 0);
  const totalExpenses = Number(job.total_expenses || 0);
  const profit = quotedAmount - totalExpenses;
  const marginPct = quotedAmount > 0 ? Math.round((profit / quotedAmount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back link */}
        <Link href="/admin" className="text-sm text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60 transition-colors">
          &larr; Back to Admin
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-[#C8973A]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              {job.title}
            </h1>
            <p className="text-[#F0E8D2]/60 mt-1">{job.client_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[job.status] || STATUS_COLORS.lead}`}>
              {STATUS_LABELS[job.status] || job.status}
            </span>
            <button
              onClick={editing ? saveEdits : startEditing}
              disabled={actionLoading}
              className="px-4 py-2 border border-[#C8973A]/30 text-[#C8973A] rounded text-sm font-semibold hover:bg-[#C8973A]/10 disabled:opacity-50 transition-colors"
            >
              {editing ? "Save" : "Edit"}
            </button>
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-[#F0E8D2]/20 text-[#F0E8D2]/50 rounded text-sm hover:text-[#F0E8D2] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {STATUS_ORDER.map((s, i) => {
              const isActive = job.status === s;
              const isPast = STATUS_ORDER.indexOf(job.status as typeof STATUS_ORDER[number]) > i;
              return (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => changeStatus(s)}
                    disabled={actionLoading}
                    className={`flex-1 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors rounded-sm disabled:opacity-50 ${
                      isActive
                        ? "bg-[#2D6A47] text-[#F0E8D2]"
                        : isPast
                        ? "bg-[#2D6A47]/20 text-green-400/70"
                        : "bg-[#F0E8D2]/5 text-[#F0E8D2]/30 hover:bg-[#F0E8D2]/10 hover:text-[#F0E8D2]/50"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`w-4 h-0.5 shrink-0 ${isPast ? "bg-[#2D6A47]/40" : "bg-[#F0E8D2]/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {job.status !== "cancelled" && (
            <div className="mt-3 text-right">
              <button
                onClick={() => { if (confirm("Cancel this job?")) changeStatus("cancelled"); }}
                disabled={actionLoading}
                className="text-xs text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Cancel Job
              </button>
            </div>
          )}
        </div>

        {/* Edit form or display */}
        {editing ? (
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>EDIT JOB</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Client Name</label>
                <input type="text" value={editClientName} onChange={(e) => setEditClientName(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Email</label>
                <input type="email" value={editClientEmail} onChange={(e) => setEditClientEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Phone</label>
                <input type="tel" value={editClientPhone} onChange={(e) => setEditClientPhone(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Address</label>
                <input type="text" value={editClientAddress} onChange={(e) => setEditClientAddress(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Quoted Amount ($)</label>
                <input type="number" step="0.01" value={editQuotedAmount} onChange={(e) => setEditQuotedAmount(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Scheduled Start</label>
                <input type="date" value={editScheduledStart} onChange={(e) => setEditScheduledStart(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Scheduled End</label>
                <input type="date" value={editScheduledEnd} onChange={(e) => setEditScheduledEnd(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Actual Start</label>
                <input type="date" value={editActualStart} onChange={(e) => setEditActualStart(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Actual End</label>
                <input type="date" value={editActualEnd} onChange={(e) => setEditActualEnd(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Client Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A] resize-none" />
            </div>
            <div>
              <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Internal Notes</label>
              <textarea value={editInternalNotes} onChange={(e) => setEditInternalNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A] resize-none" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Client Info */}
            <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60" style={{ fontFamily: "var(--font-barlow-condensed)" }}>CLIENT</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#F0E8D2]/40">Name:</span> {job.client_name || "-"}</p>
                {job.client_email && <p><span className="text-[#F0E8D2]/40">Email:</span> <a href={`mailto:${job.client_email}`} className="text-[#C8973A] hover:underline">{job.client_email}</a></p>}
                {job.client_phone && <p><span className="text-[#F0E8D2]/40">Phone:</span> <a href={`tel:${job.client_phone}`} className="text-[#C8973A] hover:underline">{job.client_phone}</a></p>}
                {job.client_address && <p><span className="text-[#F0E8D2]/40">Address:</span> {job.client_address}</p>}
                {job.quote_id && (
                  <p>
                    <span className="text-[#F0E8D2]/40">Quote:</span>{" "}
                    <Link href={`/admin/quotes/${job.quote_id}`} className="text-[#C8973A] hover:underline">View Quote</Link>
                  </p>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60" style={{ fontFamily: "var(--font-barlow-condensed)" }}>SCHEDULE</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#F0E8D2]/40">Scheduled Start:</span> {job.scheduled_start ? new Date(job.scheduled_start).toLocaleDateString() : "-"}</p>
                <p><span className="text-[#F0E8D2]/40">Scheduled End:</span> {job.scheduled_end ? new Date(job.scheduled_end).toLocaleDateString() : "-"}</p>
                <p><span className="text-[#F0E8D2]/40">Actual Start:</span> {job.actual_start ? new Date(job.actual_start).toLocaleDateString() : "-"}</p>
                <p><span className="text-[#F0E8D2]/40">Actual End:</span> {job.actual_end ? new Date(job.actual_end).toLocaleDateString() : "-"}</p>
              </div>
            </div>

            {/* Financials */}
            <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60" style={{ fontFamily: "var(--font-barlow-condensed)" }}>FINANCIALS</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#F0E8D2]/40">Quoted</span>
                  <span className="text-[#C8973A] font-bold">${quotedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#F0E8D2]/40">Expenses</span>
                  <span className="text-red-300">${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-[#F0E8D2]/10 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-[#F0E8D2]/60">Profit</span>
                  <span className={profit >= 0 ? "text-green-300" : "text-red-300"}>
                    ${profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    {quotedAmount > 0 && <span className="text-xs font-normal ml-1">({marginPct}%)</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes (when not editing) */}
        {!editing && (job.notes || job.internal_notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.notes && (
              <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60 mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>CLIENT NOTES</h3>
                <p className="text-sm text-[#F0E8D2]/80 whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}
            {job.internal_notes && (
              <div className="border border-[#C8973A]/20 bg-[#C8973A]/5 rounded-lg p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8973A]/60 mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>INTERNAL NOTES</h3>
                <p className="text-sm text-[#F0E8D2]/80 whitespace-pre-wrap">{job.internal_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Expenses */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              EXPENSES
            </h3>
            <span className="text-sm text-[#C8973A] font-bold">
              Total: ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {job.expenses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/50 text-xs uppercase">
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Receipt</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {job.expenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02]">
                      <td className="p-2">
                        {exp.description}
                        {exp.notes && <p className="text-[10px] text-[#F0E8D2]/30 mt-0.5">{exp.notes}</p>}
                      </td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.other}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-2 text-[#F0E8D2]/60">{exp.vendor || "-"}</td>
                      <td className="p-2 text-[#F0E8D2]/60">{exp.date ? new Date(exp.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}</td>
                      <td className="p-2 text-right font-mono text-[#C8973A]">${Number(exp.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="p-2">
                        {exp.receipt_url ? (
                          <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[#C8973A] hover:underline text-xs">View</a>
                        ) : (
                          <span className="text-[#F0E8D2]/20 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          disabled={actionLoading}
                          className="text-red-400/40 hover:text-red-400 text-xs disabled:opacity-50 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Expense Form */}
          <form onSubmit={addExpense} className="border-t border-[#F0E8D2]/10 pt-4">
            <p className="text-xs text-[#F0E8D2]/40 uppercase tracking-wider mb-3 font-semibold">Add Expense</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
              <div className="col-span-2 md:col-span-2">
                <label className="block text-[10px] text-[#F0E8D2]/40 mb-1 uppercase">Description *</label>
                <input type="text" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required className="w-full px-2 py-1.5 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-xs focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-[10px] text-[#F0E8D2]/40 mb-1 uppercase">Category</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="w-full px-2 py-1.5 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-xs focus:outline-none focus:border-[#C8973A]">
                  <option value="materials">Materials</option>
                  <option value="labor">Labor</option>
                  <option value="equipment">Equipment</option>
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#F0E8D2]/40 mb-1 uppercase">Amount *</label>
                <input type="number" step="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required className="w-full px-2 py-1.5 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-xs focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-[10px] text-[#F0E8D2]/40 mb-1 uppercase">Vendor</label>
                <input type="text" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} className="w-full px-2 py-1.5 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-xs focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <label className="block text-[10px] text-[#F0E8D2]/40 mb-1 uppercase">Date</label>
                <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="w-full px-2 py-1.5 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-xs focus:outline-none focus:border-[#C8973A]" />
              </div>
              <div>
                <button type="submit" disabled={actionLoading} className="w-full px-3 py-1.5 bg-[#2D6A47] text-[#F0E8D2] rounded text-xs font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Activity Log */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-3">
          <h3 className="text-lg font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>ACTIVITY</h3>
          {job.activity.length === 0 ? (
            <p className="text-sm text-[#F0E8D2]/30">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {job.activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#2D6A47] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{a.action}</span>
                    {a.details && <span className="text-[#F0E8D2]/40 ml-2">{a.details}</span>}
                  </div>
                  <span className="text-[10px] text-[#F0E8D2]/30 shrink-0">
                    {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" "}
                    {new Date(a.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
