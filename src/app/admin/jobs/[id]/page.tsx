"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  vendor: string | null;
  date: string;
  receipt_url: string | null;
  notes: string | null;
}

interface Activity {
  id: string;
  action: string;
  details: string | null;
  created_at: string;
}

interface JobDetail {
  id: string;
  title: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  status: string;
  quoted_amount: number;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  notes: string | null;
  internal_notes: string | null;
  quote_id: string | null;
  created_at: string;
  expenses: Expense[];
  activity: Activity[];
  total_expenses: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  materials: "bg-blue-900/40 text-blue-300",
  labor: "bg-[#2D6A47]/40 text-green-300",
  equipment: "bg-purple-900/40 text-purple-300",
  food: "bg-amber-900/40 text-amber-300",
  travel: "bg-cyan-900/40 text-cyan-300",
  other: "bg-[#F0E8D2]/10 text-[#F0E8D2]/60",
};

const inputClass = "w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = params.id;
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Inline edit fields
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [actualStart, setActualStart] = useState("");
  const [actualEnd, setActualEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [status, setStatus] = useState("lead");

  // Add expense
  const [expDesc, setExpDesc] = useState("");
  const [expCategory, setExpCategory] = useState("materials");
  const [expAmount, setExpAmount] = useState("");
  const [expVendor, setExpVendor] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expReceiptUrl, setExpReceiptUrl] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Copy from job
  const [allJobs, setAllJobs] = useState<Array<{ id: string; title: string; client_name: string }>>([]);
  const [showCopyFrom, setShowCopyFrom] = useState(false);
  const [copying, setCopying] = useState(false);

  // Expense presets from database
  const [presets, setPresets] = useState<Array<{ id: string; description: string; category: string; amount: number; vendor: string | null; link: string | null }>>([]);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetDesc, setNewPresetDesc] = useState("");
  const [newPresetCategory, setNewPresetCategory] = useState("materials");
  const [newPresetAmount, setNewPresetAmount] = useState("");
  const [newPresetVendor, setNewPresetVendor] = useState("");
  const [newPresetLink, setNewPresetLink] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) { setPassword(stored); setAuthenticated(true); }
  }, []);

  const fetchJob = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}?password=${encodeURIComponent(pw)}`);
      if (res.status === 401) { setError("Invalid password"); setLoading(false); return; }
      const data = await res.json();
      setJob(data);
      setTitle(data.title || "");
      setClientName(data.client_name || "");
      setClientEmail(data.client_email || "");
      setClientPhone(data.client_phone || "");
      setClientAddress(data.client_address || "");
      setQuotedAmount(String(data.quoted_amount || 0));
      setScheduledStart(data.scheduled_start || "");
      setScheduledEnd(data.scheduled_end || "");
      setActualStart(data.actual_start || "");
      setActualEnd(data.actual_end || "");
      setNotes(data.notes || "");
      setInternalNotes(data.internal_notes || "");
      setStatus(data.status || "lead");
      setAuthenticated(true);
      sessionStorage.setItem("admin_pw", pw);
    } catch { setError("Failed to load"); }
    setLoading(false);
  }, [jobId]);

  useEffect(() => { if (authenticated && password) fetchJob(password); }, [authenticated, password, fetchJob]);

  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); await fetchJob(password); };

  const saveJob = async () => {
    setSaving(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password, action: "update_job", id: jobId,
        title, client_name: clientName, client_email: clientEmail,
        client_phone: clientPhone, client_address: clientAddress,
        quoted_amount: Number(quotedAmount), status,
        scheduled_start: scheduledStart || null, scheduled_end: scheduledEnd || null,
        actual_start: actualStart || null, actual_end: actualEnd || null,
        notes, internal_notes: internalNotes,
      }),
    });
    await fetchJob(password);
    setSaving(false);
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    setSaving(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password, action: "add_expense", job_id: jobId,
        description: expDesc, category: expCategory,
        amount: Number(expAmount), vendor: expVendor || null,
        date: expDate, receipt_url: expReceiptUrl || null, notes: expNotes || null,
      }),
    });
    setExpDesc(""); setExpAmount(""); setExpVendor(""); setExpReceiptUrl(""); setExpNotes("");
    setShowAddExpense(false);
    await fetchJob(password);
    setSaving(false);
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "delete_expense", id, job_id: jobId }),
    });
    await fetchJob(password);
  };

  const fetchPresets = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs?password=${encodeURIComponent(password)}&presetsOnly=true`);
      const data = await res.json();
      if (Array.isArray(data)) setPresets(data);
    } catch { /* ignore */ }
  }, [password]);

  useEffect(() => { if (authenticated && password) fetchPresets(); }, [authenticated, password, fetchPresets]);

  const addPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetDesc || !newPresetAmount) return;
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password, action: "add_preset",
        description: newPresetDesc, category: newPresetCategory,
        amount: Number(newPresetAmount), vendor: newPresetVendor || null,
        link: newPresetLink || null,
      }),
    });
    setNewPresetDesc(""); setNewPresetAmount(""); setNewPresetVendor(""); setNewPresetLink("");
    setShowAddPreset(false);
    await fetchPresets();
  };

  const deletePreset = async (id: string) => {
    if (!confirm("Delete this preset?")) return;
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "delete_preset", id }),
    });
    await fetchPresets();
  };

  const fetchAllJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllJobs(data.filter((j: Record<string, unknown>) => j.id !== jobId).map((j: Record<string, unknown>) => ({
          id: j.id as string,
          title: j.title as string,
          client_name: j.client_name as string,
        })));
      }
    } catch { /* ignore */ }
  };

  const copyExpensesFrom = async (sourceJobId: string) => {
    setCopying(true);
    try {
      const res = await fetch(`/api/jobs/${sourceJobId}?password=${encodeURIComponent(password)}`);
      const sourceJob = await res.json();
      if (sourceJob.expenses && Array.isArray(sourceJob.expenses)) {
        const today = new Date().toISOString().split("T")[0];
        for (const exp of sourceJob.expenses) {
          await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              password, action: "add_expense", job_id: jobId,
              description: exp.description, category: exp.category,
              amount: Number(exp.amount), vendor: exp.vendor || null,
              date: today, receipt_url: null, notes: `Copied from ${sourceJob.title || "another job"}`,
            }),
          });
        }
        await fetchJob(password);
      }
    } catch { alert("Failed to copy expenses"); }
    setCopying(false);
    setShowCopyFrom(false);
  };

  const addPresetExpense = async (preset: { description: string; category: string; amount: number; vendor: string | null; link: string | null }) => {
    setSaving(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password, action: "add_expense", job_id: jobId,
        description: preset.description, category: preset.category,
        amount: preset.amount, vendor: preset.vendor || null,
        date: new Date().toISOString().split("T")[0],
      }),
    });
    await fetchJob(password);
    setSaving(false);
  };

  const deleteJob = async () => {
    if (!confirm("Delete this entire job? This cannot be undone.")) return;
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "delete_job", id: jobId }),
    });
    window.location.href = "/admin";
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8">
          <h1 className="text-2xl font-bold text-[#F0E8D2] text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>JOB DETAILS</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className={inputClass} />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80">Sign In</button>
        </form>
      </div>
    );
  }

  if (loading || !job) {
    return <div className="min-h-screen bg-[#060A07] flex items-center justify-center"><p className="text-[#F0E8D2]/40">Loading...</p></div>;
  }

  const totalExpenses = Number(job.total_expenses || 0);
  const quoted = Number(quotedAmount || 0);
  const profit = quoted - totalExpenses;
  const marginPct = quoted > 0 ? Math.round((profit / quoted) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/admin" className="text-sm text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60">&larr; Back to Admin</Link>

        {/* Header + Save */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent text-3xl font-bold text-[#C8973A] outline-none w-full border-b border-transparent focus:border-[#C8973A]/30" style={{ fontFamily: "var(--font-barlow-condensed)" }} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveJob} disabled={saving} className="px-4 py-2 bg-[#2D6A47] text-[#F0E8D2] rounded text-sm font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button onClick={deleteJob} className="px-3 py-2 border border-red-500/20 text-red-400/50 rounded text-sm hover:text-red-400 hover:border-red-500/40">Delete</button>
          </div>
        </div>

        {/* Status + Financials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4">
            <label className="block text-[10px] uppercase tracking-wider text-[#F0E8D2]/40 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#060A07] border border-[#F0E8D2]/20 rounded px-2 py-1.5 text-sm text-[#F0E8D2] focus:outline-none focus:border-[#C8973A]">
              <option value="lead">Lead</option>
              <option value="quoted">Quoted</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4">
            <label className="block text-[10px] uppercase tracking-wider text-[#F0E8D2]/40 mb-1">Quoted</label>
            <div className="flex items-center gap-1">
              <span className="text-[#F0E8D2]/40">$</span>
              <input type="number" step="0.01" value={quotedAmount} onChange={(e) => setQuotedAmount(e.target.value)} className="bg-transparent text-xl font-bold text-[#F0E8D2] outline-none w-full" style={{ fontFamily: "var(--font-barlow-condensed)" }} />
            </div>
          </div>
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4">
            <label className="block text-[10px] uppercase tracking-wider text-[#F0E8D2]/40 mb-1">Expenses</label>
            <p className="text-xl font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`border rounded-lg p-4 ${profit >= 0 ? "border-[#2D6A47]/30 bg-[#2D6A47]/[0.06]" : "border-red-500/30 bg-red-500/[0.06]"}`}>
            <label className="block text-[10px] uppercase tracking-wider text-[#F0E8D2]/40 mb-1">Profit</label>
            <p className={`text-xl font-bold ${profit >= 0 ? "text-[#2D6A47]" : "text-red-400"}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              ${profit.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-sm">({marginPct}%)</span>
            </p>
          </div>
        </div>

        {/* Client + Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60">Client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Name</label><input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Email</label><input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Phone</label><input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Address</label><input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} /></div>
            </div>
            {job.quote_id && <a href={`/admin/quotes/${job.quote_id}`} className="inline-block text-xs text-[#C8973A] hover:underline">View linked quote &rarr;</a>}
          </div>
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60">Schedule</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Start Date</label><input type="date" value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">End Date</label><input type="date" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Actual Start</label><input type="date" value={actualStart} onChange={(e) => setActualStart(e.target.value)} className={inputClass} /></div>
              <div><label className="block text-[10px] uppercase text-[#F0E8D2]/30 mb-0.5">Actual End</label><input type="date" value={actualEnd} onChange={(e) => setActualEnd(e.target.value)} className={inputClass} /></div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60 mb-2">Notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="General notes..." className={`${inputClass} resize-none`} />
          </div>
          <div className="border border-[#C8973A]/15 bg-[#C8973A]/[0.03] rounded-lg p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8973A]/60 mb-2">Private Notes</h3>
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} placeholder="Internal only..." className={`${inputClass} resize-none border-[#C8973A]/20 focus:border-[#C8973A]`} />
          </div>
        </div>

        {/* Expenses */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60">Expenses</h3>
            <div className="flex gap-2">
              <button onClick={() => { setShowCopyFrom(!showCopyFrom); if (!showCopyFrom) fetchAllJobs(); }} className="px-2 py-1 text-xs border border-[#F0E8D2]/15 text-[#F0E8D2]/40 rounded hover:text-[#F0E8D2]/60 hover:border-[#F0E8D2]/30">
                {showCopyFrom ? "Cancel" : "Copy from Job"}
              </button>
              <button onClick={() => setShowAddExpense(!showAddExpense)} className="px-2 py-1 text-xs text-[#2D6A47] border border-[#2D6A47]/30 rounded hover:bg-[#2D6A47]/10">
                {showAddExpense ? "Cancel" : "+ Add Expense"}
              </button>
            </div>
          </div>

          {/* Copy from another job */}
          {showCopyFrom && (
            <div className="mb-4 p-4 border border-[#F0E8D2]/10 rounded-lg">
              <p className="text-xs text-[#F0E8D2]/50 mb-3">Select a job to copy all its expenses into this one:</p>
              {allJobs.length === 0 ? (
                <p className="text-xs text-[#F0E8D2]/30">No other jobs found</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {allJobs.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => copyExpensesFrom(j.id)}
                      disabled={copying}
                      className="flex items-center justify-between px-3 py-2 border border-[#F0E8D2]/10 rounded text-left hover:border-[#2D6A47]/30 hover:bg-[#2D6A47]/[0.04] transition-colors disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm text-[#F0E8D2]">{j.title}</p>
                        <p className="text-[10px] text-[#F0E8D2]/40">{j.client_name}</p>
                      </div>
                      <span className="text-xs text-[#2D6A47]">{copying ? "Copying..." : "Copy →"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick-add presets */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-[#F0E8D2]/30">Quick Add</p>
              <button onClick={() => setShowAddPreset(!showAddPreset)} className="text-[10px] text-[#C8973A]/50 hover:text-[#C8973A]">
                {showAddPreset ? "Cancel" : "+ New Preset"}
              </button>
            </div>

            {showAddPreset && (
              <form onSubmit={addPreset} className="mb-3 p-3 border border-[#C8973A]/15 rounded-lg space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input type="text" value={newPresetDesc} onChange={(e) => setNewPresetDesc(e.target.value)} required placeholder="Description" className={`${inputClass} text-xs`} />
                  <input type="number" step="0.01" value={newPresetAmount} onChange={(e) => setNewPresetAmount(e.target.value)} required placeholder="Price" className={`${inputClass} text-xs`} />
                  <input type="text" value={newPresetVendor} onChange={(e) => setNewPresetVendor(e.target.value)} placeholder="Vendor" className={`${inputClass} text-xs`} />
                  <select value={newPresetCategory} onChange={(e) => setNewPresetCategory(e.target.value)} className={`${inputClass} text-xs`}>
                    <option value="materials">Materials</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="food">Food</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input type="url" value={newPresetLink} onChange={(e) => setNewPresetLink(e.target.value)} placeholder="Product link (optional)" className={`${inputClass} text-xs flex-1`} />
                  <button type="submit" className="px-3 py-1 bg-[#C8973A] text-[#060A07] rounded text-xs font-semibold">Save Preset</button>
                </div>
              </form>
            )}

            {presets.length === 0 ? (
              <p className="text-[10px] text-[#F0E8D2]/20">No presets yet. Click &quot;+ New Preset&quot; to create your first one.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <div key={preset.id} className="group relative">
                    <button
                      onClick={() => addPresetExpense(preset)}
                      disabled={saving}
                      className="px-2.5 py-1.5 text-[11px] border border-[#F0E8D2]/10 text-[#F0E8D2]/50 rounded hover:border-[#F0E8D2]/20 hover:text-[#F0E8D2]/70 disabled:opacity-30 transition-colors"
                    >
                      {preset.description} <span className="text-[#C8973A]/60">${Number(preset.amount).toLocaleString()}</span>
                      {preset.link && <span className="text-[#2D6A47]/50 ml-1">🔗</span>}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80 text-[8px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddExpense && (
            <form onSubmit={addExpense} className="mb-4 p-4 border border-[#F0E8D2]/10 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2"><input type="text" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required placeholder="Description" className={inputClass} /></div>
                <div><input type="number" step="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required placeholder="Amount" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className={inputClass}>
                  <option value="materials">Materials</option>
                  <option value="labor">Labor</option>
                  <option value="equipment">Equipment</option>
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
                <input type="text" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} placeholder="Vendor" className={inputClass} />
                <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className={inputClass} />
                <input type="url" value={expReceiptUrl} onChange={(e) => setExpReceiptUrl(e.target.value)} placeholder="Receipt link" className={inputClass} />
              </div>
              <div className="flex gap-2">
                <input type="text" value={expNotes} onChange={(e) => setExpNotes(e.target.value)} placeholder="Notes (optional)" className={`${inputClass} flex-1`} />
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#2D6A47] text-[#F0E8D2] rounded text-sm font-semibold disabled:opacity-50">Add</button>
              </div>
            </form>
          )}

          {job.expenses.length === 0 ? (
            <p className="text-sm text-[#F0E8D2]/30 text-center py-4">No expenses yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0E8D2]/10 text-[10px] uppercase text-[#F0E8D2]/40">
                    <th className="text-left py-2 pr-2">Description</th>
                    <th className="text-left py-2 pr-2">Category</th>
                    <th className="text-left py-2 pr-2">Vendor</th>
                    <th className="text-right py-2 pr-2">Amount</th>
                    <th className="text-left py-2 pr-2">Date</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {job.expenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-[#F0E8D2]/5">
                      <td className="py-2 pr-2">
                        {exp.description}
                        {exp.notes && <span className="block text-[10px] text-[#F0E8D2]/30">{exp.notes}</span>}
                      </td>
                      <td className="py-2 pr-2"><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.other}`}>{exp.category}</span></td>
                      <td className="py-2 pr-2 text-[#F0E8D2]/50">{exp.vendor || "-"}</td>
                      <td className="py-2 pr-2 text-right font-medium">${Number(exp.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 pr-2 text-[#F0E8D2]/40 text-xs">{exp.date}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          {exp.receipt_url && <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs border border-[#C8973A]/30 text-[#C8973A] rounded hover:bg-[#C8973A]/10">Receipt</a>}
                          <button onClick={() => deleteExpense(exp.id)} className="px-2 py-1 text-xs border border-red-500/20 text-red-400/50 rounded hover:bg-red-900/20 hover:text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#F0E8D2]/20">
                    <td colSpan={3} className="py-2 text-right font-semibold text-sm">Total</td>
                    <td className="py-2 text-right font-bold text-[#C8973A]">${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Log */}
        {job.activity.length > 0 && (
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60 mb-3">Activity</h3>
            <div className="space-y-2">
              {job.activity.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F0E8D2]/20 shrink-0" />
                  <div>
                    <span className="text-[#F0E8D2]/50">{a.action}</span>
                    {a.details && <span className="text-[#F0E8D2]/30"> — {a.details}</span>}
                    <span className="text-[#F0E8D2]/20 ml-2">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
