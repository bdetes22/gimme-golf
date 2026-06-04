"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Booking {
  id: string;
  customer_id: string;
  location: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: string;
  payment_status: string;
  stripe_payment_id: string;
  created_at: string;
  customers: { name: string; email: string; phone?: string } | null;
}

interface Membership {
  id: string;
  type: string;
  sessions_remaining: number | null;
  hours_used_this_month: number | null;
  hours_reset_date: string | null;
  active: boolean;
  end_date: string | null;
  customer_id: string;
  customers?: { name: string; email: string } | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  membership: Membership | null;
}

interface Location {
  id: string;
  name: string;
  address: string;
  keybox_code: string;
  youtube_url: string;
}

interface Revenue {
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  thisMonthBookings: number;
  lastMonthBookings: number;
  thisYearBookings: number;
}

interface Stats {
  bookingsToday: number;
  bookingsThisWeek: number;
  activeMembers: number;
}

interface Analytics {
  bookingsPerDay: Record<string, number>;
  bookingsByHour: Record<string, number>;
  bookingsByLocation: Record<string, number>;
  bookingsByType: Record<string, number>;
  uniqueCustomers: number;
}

interface Message {
  id: string;
  type: "contact" | "build_inquiry";
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

interface AdminData {
  bookings: Booking[];
  customers: Customer[];
  locations: Location[];
  upcomingBookings: Booking[];
  expiringMemberships: Membership[];
  revenue: Revenue;
  stats: Stats;
  analytics: Analytics;
  messages: Message[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create booking form state
  const [newBookingCustomerId, setNewBookingCustomerId] = useState("");
  const [newBookingLocation, setNewBookingLocation] = useState("kaysville");
  const [newBookingDate, setNewBookingDate] = useState("");
  const [newBookingHour, setNewBookingHour] = useState(9);

  // Membership modal state
  const [memModalCustomer, setMemModalCustomer] = useState<Customer | null>(null);
  const [memType, setMemType] = useState("monthly");
  const [memStartDate, setMemStartDate] = useState("");
  const [memEndDate, setMemEndDate] = useState("");
  const [memNoExpiry, setMemNoExpiry] = useState(false);
  const [memSessions, setMemSessions] = useState(10);

  // Create member modal state
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [cmName, setCmName] = useState("");
  const [cmEmail, setCmEmail] = useState("");
  const [cmPhone, setCmPhone] = useState("");
  const [cmType, setCmType] = useState("monthly");
  const [cmStartDate, setCmStartDate] = useState("");
  const [cmEndDate, setCmEndDate] = useState("");
  const [cmNoExpiry, setCmNoExpiry] = useState(false);
  const [cmHours, setCmHours] = useState(20);
  const [cmSessions, setCmSessions] = useState(10);
  const [cmNotes, setCmNotes] = useState("");

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  // Block slot form state
  const [showBlockSlot, setShowBlockSlot] = useState(false);
  const [blockLocation, setBlockLocation] = useState("kaysville");
  const [blockDate, setBlockDate] = useState("");
  const [blockHour, setBlockHour] = useState(9);

  // Comp session modal state
  const [compModalCustomer, setCompModalCustomer] = useState<Customer | null>(null);
  const [compLocation, setCompLocation] = useState("kaysville");
  const [compDate, setCompDate] = useState("");
  const [compHour, setCompHour] = useState(9);

  // Keybox editing state
  const [editingKeybox, setEditingKeybox] = useState<string | null>(null);
  const [keyboxValue, setKeyboxValue] = useState("");

  const [storedPassword, setStoredPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "messages" | "jobs" | "quotes">("dashboard");
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Quotes state
  const [quotes, setQuotes] = useState<Array<Record<string, unknown>>>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState<Array<Record<string, unknown>>>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showFromQuote, setShowFromQuote] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobClientName, setNewJobClientName] = useState("");
  const [newJobClientEmail, setNewJobClientEmail] = useState("");
  const [newJobClientPhone, setNewJobClientPhone] = useState("");
  const [newJobClientAddress, setNewJobClientAddress] = useState("");
  const [newJobQuotedAmount, setNewJobQuotedAmount] = useState("");
  const [newJobScheduledStart, setNewJobScheduledStart] = useState("");
  const [newJobScheduledEnd, setNewJobScheduledEnd] = useState("");

  const fetchQuotes = useCallback(async (pw: string) => {
    setQuotesLoading(true);
    try {
      const res = await fetch(`/api/quotes?password=${encodeURIComponent(pw)}`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setQuotesLoading(false);
  }, []);

  const fetchJobs = useCallback(async (pw: string) => {
    setJobsLoading(true);
    try {
      const res = await fetch(`/api/jobs?password=${encodeURIComponent(pw)}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setJobsLoading(false);
  }, []);

  // Auto-login: check Supabase auth first, then URL param, then sessionStorage
  useEffect(() => {
    async function autoLogin() {
      // 1. Check if logged in as admin user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const res = await fetch("/api/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: session.access_token }),
          });
          if (res.ok) {
            const { pw } = await res.json();
            setPassword(pw);
            setStoredPassword(pw);
            sessionStorage.setItem("admin_pw", pw);
            fetchData(pw);
            return;
          }
        } catch { /* fall through to other methods */ }
      }

      // 2. Check URL for password (bookmark-friendly: /admin?pw=xxx)
      const urlPw = new URLSearchParams(window.location.search).get("pw");
      if (urlPw) {
        setPassword(urlPw);
        setStoredPassword(urlPw);
        sessionStorage.setItem("admin_pw", urlPw);
        fetchData(urlPw);
        window.history.replaceState({}, "", "/admin");
        return;
      }

      // 3. Check sessionStorage
      const stored = sessionStorage.getItem("admin_pw");
      if (stored) {
        setPassword(stored);
        setStoredPassword(stored);
        fetchData(stored);
      }
    }
    autoLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = useCallback(
    async (pw: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin?password=${encodeURIComponent(pw)}`);
        if (res.status === 401) {
          setError("Invalid password");
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load data");
          setLoading(false);
          return;
        }
        setData(json);
        setAuthenticated(true);
      } catch {
        setError("Network error");
      }
      setLoading(false);
    },
    []
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoredPassword(password);
    sessionStorage.setItem("admin_pw", password);
    await fetchData(password);
  };

  const doAction = async (body: Record<string, unknown>) => {
    const actionKey = JSON.stringify(body);
    setActionLoading(actionKey);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, password: storedPassword }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Action failed");
      }
      await fetchData(storedPassword);
    } catch {
      alert("Network error");
    }
    setActionLoading(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm("Cancel this booking?")) return;
    doAction({ action: "cancel_booking", bookingId });
  };

  const handleRefundBooking = (bookingId: string, stripePaymentId: string) => {
    if (!confirm("Issue a full refund for this booking? This will refund the payment via Stripe and cancel the booking.")) return;
    doAction({ action: "refund_booking", bookingId, stripePaymentId });
  };

  const handleResendConfirmation = (bookingId: string) => {
    if (!confirm("Resend confirmation email for this booking?")) return;
    doAction({ action: "resend_confirmation", bookingId });
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    await doAction({
      action: "create_booking",
      customerId: newBookingCustomerId,
      location: newBookingLocation,
      dateISO: newBookingDate,
      hour: newBookingHour,
    });
    setShowCreateBooking(false);
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await doAction({
      action: "block_slot",
      location: blockLocation,
      dateISO: blockDate,
      hour: blockHour,
    });
    setShowBlockSlot(false);
  };

  const handleUnblockSlot = (bookingId: string) => {
    if (!confirm("Unblock this time slot?")) return;
    doAction({ action: "unblock_slot", bookingId });
  };

  const handleCompBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compModalCustomer) return;
    await doAction({
      action: "comp_booking",
      customerId: compModalCustomer.id,
      location: compLocation,
      dateISO: compDate,
      hour: compHour,
    });
    setCompModalCustomer(null);
  };

  const handleUpdateKeybox = async (locationId: string) => {
    await doAction({
      action: "update_keybox",
      locationId,
      keyboxCode: keyboxValue,
    });
    setEditingKeybox(null);
  };

  const handleSendRenewalReminder = (mem: Membership) => {
    if (!confirm(`Send renewal reminder to ${mem.customers?.name}?`)) return;
    doAction({
      action: "send_renewal_reminder",
      membershipId: mem.id,
      customerEmail: mem.customers?.email,
      customerName: mem.customers?.name,
      endDate: mem.end_date,
      membershipType: mem.type,
    });
  };

  const handleAddSessions = (customerId: string, sessions: number) => {
    doAction({ action: "add_sessions", customerId, sessions });
  };

  const handleRemoveSessions = (customerId: string, sessions: number) => {
    doAction({ action: "remove_sessions", customerId, sessions });
  };

  const openCreateMember = () => {
    setShowCreateMember(true);
    setCmName("");
    setCmEmail("");
    setCmPhone("");
    setCmType("monthly");
    setCmStartDate(new Date().toISOString().split("T")[0]);
    setCmEndDate("");
    setCmNoExpiry(false);
    setCmHours(20);
    setCmSessions(10);
    setCmNotes("");
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await doAction({
      action: "create_member",
      name: cmName,
      email: cmEmail,
      phone: cmPhone,
      membershipType: cmType,
      startDate: cmStartDate,
      endDate: cmNoExpiry ? null : cmEndDate || null,
      hoursRemaining: cmHours,
      sessionsRemaining: cmType === "punchpass" ? cmSessions : null,
      notes: cmNotes,
    });
    setShowCreateMember(false);
  };

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    if (!confirm(`Delete ${customerName}? This will remove all their bookings, memberships, and auth account.`)) return;
    doAction({ action: "delete_customer", customerId });
  };

  const startEditNotes = (customer: Customer) => {
    setEditingNotesId(customer.id);
    setNotesText(customer.notes || "");
  };

  const saveNotes = async (customerId: string) => {
    await doAction({ action: "update_notes", customerId, notes: notesText });
    setEditingNotesId(null);
  };

  const openMemModal = (customer: Customer) => {
    setMemModalCustomer(customer);
    setMemType(customer.membership?.type || "monthly");
    setMemStartDate(new Date().toISOString().split("T")[0]);
    setMemEndDate("");
    setMemNoExpiry(false);
    setMemSessions(10);
  };

  const handleSetMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memModalCustomer) return;
    await doAction({
      action: "set_membership",
      customerId: memModalCustomer.id,
      type: memType,
      startDate: memStartDate,
      endDate: memNoExpiry ? null : memEndDate || null,
      sessionsRemaining: memType === "punchpass" ? memSessions : null,
    });
    setMemModalCustomer(null);
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8"
        >
          <h1
            className="text-2xl font-bold text-[#F0E8D2] text-center"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            ADMIN DASHBOARD
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] placeholder-[#F0E8D2]/40 focus:outline-none focus:border-[#C8973A]"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  if (!data) return null;

  // Group upcoming bookings by date then location
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const todayUpcoming = data.upcomingBookings.filter(b => b.start_time.startsWith(todayStr));
  const tomorrowUpcoming = data.upcomingBookings.filter(b => b.start_time.startsWith(tomorrowStr));

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-bold text-[#C8973A]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            ADMIN
          </h1>
          <button
            onClick={() => { fetchData(storedPassword); if (activeTab === "quotes") fetchQuotes(storedPassword); if (activeTab === "jobs") fetchJobs(storedPassword); }}

            disabled={loading}
            className="px-3 py-1.5 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded text-xs hover:text-[#F0E8D2] hover:border-[#F0E8D2]/40 disabled:opacity-50 transition-colors"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#F0E8D2]/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "dashboard"
                ? "text-[#C8973A] border-b-2 border-[#C8973A]"
                : "text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "analytics"
                ? "text-[#C8973A] border-b-2 border-[#C8973A]"
                : "text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`relative px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "messages"
                ? "text-[#C8973A] border-b-2 border-[#C8973A]"
                : "text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60"
            }`}
          >
            Messages
            {data && data.messages.filter(m => !m.read).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A47] text-[10px] font-bold text-[#F0E8D2]">
                {data.messages.filter(m => !m.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab("jobs"); fetchJobs(storedPassword); }}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "jobs"
                ? "text-[#C8973A] border-b-2 border-[#C8973A]"
                : "text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60"
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => { setActiveTab("quotes"); fetchQuotes(storedPassword); }}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "quotes"
                ? "text-[#C8973A] border-b-2 border-[#C8973A]"
                : "text-[#F0E8D2]/40 hover:text-[#F0E8D2]/60"
            }`}
          >
            Quotes
          </button>
        </div>

        {/* ── Jobs Tab ── */}
        {activeTab === "jobs" && (() => {
          const statusOrder = ["lead", "quoted", "scheduled", "in_progress", "complete", "cancelled"] as const;
          const statusLabels: Record<string, string> = { lead: "Lead", quoted: "Quoted", scheduled: "Scheduled", in_progress: "In Progress", complete: "Complete", cancelled: "Cancelled" };
          const statusColors: Record<string, string> = {
            lead: "bg-gray-600/40 text-gray-300",
            quoted: "bg-blue-900/40 text-blue-300",
            scheduled: "bg-[#C8973A]/30 text-[#C8973A]",
            in_progress: "bg-purple-900/40 text-purple-300",
            complete: "bg-[#2D6A47]/40 text-green-300",
            cancelled: "bg-red-900/40 text-red-300",
          };
          const statusCounts: Record<string, number> = {};
          for (const s of statusOrder) statusCounts[s] = 0;
          for (const j of jobs) {
            const s = j.status as string;
            if (s in statusCounts) statusCounts[s]++;
          }
          const eligibleQuotes = quotes.filter(
            (q) => q.status === "accepted" || q.status === "deposit-paid"
          );
          const handleCreateJob = async (e: React.FormEvent) => {
            e.preventDefault();
            setActionLoading("create_job");
            try {
              const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  password: storedPassword,
                  action: "create_job",
                  title: newJobTitle,
                  client_name: newJobClientName,
                  client_email: newJobClientEmail || null,
                  client_phone: newJobClientPhone || null,
                  client_address: newJobClientAddress || null,
                  quoted_amount: newJobQuotedAmount ? Number(newJobQuotedAmount) : null,
                  scheduled_start: newJobScheduledStart || null,
                  scheduled_end: newJobScheduledEnd || null,
                }),
              });
              if (!res.ok) {
                const json = await res.json();
                alert(json.error || "Failed to create job");
              } else {
                setShowNewJob(false);
                setNewJobTitle("");
                setNewJobClientName("");
                setNewJobClientEmail("");
                setNewJobClientPhone("");
                setNewJobClientAddress("");
                setNewJobQuotedAmount("");
                setNewJobScheduledStart("");
                setNewJobScheduledEnd("");
                await fetchJobs(storedPassword);
              }
            } catch { alert("Network error"); }
            setActionLoading(null);
          };
          const handleCreateFromQuote = async (quoteId: string) => {
            setActionLoading("create_from_quote");
            try {
              const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  password: storedPassword,
                  action: "create_from_quote",
                  quote_id: quoteId,
                }),
              });
              if (!res.ok) {
                const json = await res.json();
                alert(json.error || "Failed to create job from quote");
              } else {
                setShowFromQuote(false);
                await fetchJobs(storedPassword);
              }
            } catch { alert("Network error"); }
            setActionLoading(null);
          };

          return (
            <div className="space-y-6">
              {/* Pipeline Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {statusOrder.map((s) => (
                  <div key={s} className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[#F0E8D2]/40">{statusLabels[s]}</p>
                    <p className="text-3xl font-bold text-[#C8973A] mt-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{statusCounts[s]}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => { setShowNewJob(!showNewJob); setShowFromQuote(false); }}
                  className="px-4 py-2 bg-[#2D6A47] text-[#F0E8D2] rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#2D6A47]/90 transition-colors"
                >
                  {showNewJob ? "Cancel" : "New Job"}
                </button>
                <button
                  onClick={() => { setShowFromQuote(!showFromQuote); setShowNewJob(false); if (!showFromQuote) fetchQuotes(storedPassword); }}
                  className="px-4 py-2 border border-[#C8973A]/30 text-[#C8973A] rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#C8973A]/10 transition-colors"
                >
                  {showFromQuote ? "Cancel" : "Create from Quote"}
                </button>
              </div>

              {/* New Job Form */}
              {showNewJob && (
                <form onSubmit={handleCreateJob} className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60" style={{ fontFamily: "var(--font-barlow-condensed)" }}>NEW JOB</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Title *</label>
                      <input type="text" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} required className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Client Name *</label>
                      <input type="text" value={newJobClientName} onChange={(e) => setNewJobClientName(e.target.value)} required className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Email</label>
                      <input type="email" value={newJobClientEmail} onChange={(e) => setNewJobClientEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Phone</label>
                      <input type="tel" value={newJobClientPhone} onChange={(e) => setNewJobClientPhone(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Address</label>
                      <input type="text" value={newJobClientAddress} onChange={(e) => setNewJobClientAddress(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Quoted Amount ($)</label>
                      <input type="number" step="0.01" value={newJobQuotedAmount} onChange={(e) => setNewJobQuotedAmount(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">Start Date</label>
                        <input type="date" value={newJobScheduledStart} onChange={(e) => setNewJobScheduledStart(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#F0E8D2]/50 mb-1 uppercase">End Date</label>
                        <input type="date" value={newJobScheduledEnd} onChange={(e) => setNewJobScheduledEnd(e.target.value)} className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={actionLoading !== null} className="px-6 py-2 bg-[#C8973A] text-[#060A07] rounded font-semibold text-sm hover:bg-[#C8973A]/90 disabled:opacity-50 transition-colors">
                    Create Job
                  </button>
                </form>
              )}

              {/* Create from Quote Dropdown */}
              {showFromQuote && (
                <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60" style={{ fontFamily: "var(--font-barlow-condensed)" }}>SELECT A QUOTE</h3>
                  {quotesLoading ? (
                    <p className="text-sm text-[#F0E8D2]/40">Loading quotes...</p>
                  ) : eligibleQuotes.length === 0 ? (
                    <p className="text-sm text-[#F0E8D2]/40">No accepted or deposit-paid quotes available.</p>
                  ) : (
                    <div className="space-y-2">
                      {eligibleQuotes.map((q) => (
                        <div key={q.id as string} className="flex items-center justify-between bg-[#060A07] border border-[#F0E8D2]/10 rounded p-3">
                          <div>
                            <span className="text-sm font-semibold">{q.client_name as string}</span>
                            <span className="text-[#F0E8D2]/40 text-sm ml-2">#{q.quote_number as string}</span>
                            <span className="text-[#C8973A] text-sm ml-3">${Number(q.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                            <span className={`ml-3 inline-block px-2 py-0.5 rounded text-[10px] font-medium ${q.status === "deposit-paid" ? "bg-[#C8973A]/30 text-[#C8973A]" : "bg-[#2D6A47]/40 text-green-300"}`}>
                              {q.status as string}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCreateFromQuote(q.id as string)}
                            disabled={actionLoading !== null}
                            className="px-3 py-1.5 bg-[#2D6A47] text-[#F0E8D2] rounded text-xs font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
                          >
                            Create Job
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Job Cards */}
              {jobsLoading ? (
                <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8 text-center text-[#F0E8D2]/40">
                  Loading...
                </div>
              ) : jobs.length === 0 ? (
                <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8 text-center text-[#F0E8D2]/40">
                  No jobs yet. Create your first job or create one from a quote.
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.map((j) => {
                    const quoted = Number(j.quoted_amount || 0);
                    const expenses = Number(j.total_expenses || 0);
                    const margin = quoted - expenses;
                    return (
                      <div
                        key={j.id as string}
                        className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4 hover:bg-[#F0E8D2]/[0.05] cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/admin/jobs/${j.id}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold">{j.title as string}</span>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[j.status as string] || statusColors.lead}`}>
                                {statusLabels[j.status as string] || (j.status as string)}
                              </span>
                            </div>
                            <p className="text-xs text-[#F0E8D2]/40 mt-0.5">{j.client_name as string}</p>
                            {Boolean(j.scheduled_start || j.scheduled_end) && (
                              <p className="text-xs text-[#F0E8D2]/30 mt-0.5">
                                {j.scheduled_start ? new Date(j.scheduled_start as string).toLocaleDateString() : ""}
                                {j.scheduled_start && j.scheduled_end ? " - " : ""}
                                {j.scheduled_end ? new Date(j.scheduled_end as string).toLocaleDateString() : ""}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {quoted > 0 && (
                              <p className="text-sm text-[#C8973A] font-bold">${quoted.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                            )}
                            {expenses > 0 && (
                              <p className="text-[10px] text-[#F0E8D2]/30">
                                expenses: ${expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </p>
                            )}
                            {quoted > 0 && (
                              <p className={`text-[10px] font-medium ${margin >= 0 ? "text-green-400/60" : "text-red-400/60"}`}>
                                margin: ${margin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Quotes Tab ── */}
        {activeTab === "quotes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>ALL QUOTES</h2>
              <Link href="/admin/quotes/new" className="rounded bg-[#2D6A47] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90">
                New Quote
              </Link>
            </div>
            <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase">
                    <th className="text-left p-3">Quote #</th>
                    <th className="text-left p-3">Client</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quotesLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-[#F0E8D2]/40">Loading...</td></tr>
                  ) : quotes.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-[#F0E8D2]/40">No quotes yet. Create your first quote.</td></tr>
                  ) : (
                    quotes.map((q) => (
                      <tr key={q.id as string} className="border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02] cursor-pointer" onClick={() => window.location.href = `/admin/quotes/${q.id}`}>
                        <td className="p-3 font-mono text-[#C8973A]">#{q.quote_number as string}</td>
                        <td className="p-3">{q.client_name as string}</td>
                        <td className="p-3 text-[#F0E8D2]/60">{q.created_at ? new Date(q.created_at as string).toLocaleDateString() : ""}</td>
                        <td className="p-3">${Number(q.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            q.status === "paid" ? "bg-[#2D6A47]/60 text-green-200"
                            : q.status === "deposit-paid" ? "bg-[#C8973A]/30 text-[#C8973A]"
                            : q.status === "accepted" ? "bg-[#2D6A47]/40 text-green-300"
                            : q.status === "sent" ? "bg-blue-900/40 text-blue-300"
                            : "bg-[#F0E8D2]/10 text-[#F0E8D2]/60"
                          }`}>
                            {q.status as string}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && data.analytics && (() => {
          const { bookingsPerDay, bookingsByHour, bookingsByLocation, bookingsByType, uniqueCustomers } = data.analytics;
          const dayEntries = Object.entries(bookingsPerDay);
          const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);
          const hourEntries = Object.entries(bookingsByHour).map(([h, v]) => [Number(h), v] as [number, number]);
          const maxHour = Math.max(...hourEntries.map(([, v]) => v), 1);
          const totalLocation = (bookingsByLocation.kaysville || 0) + (bookingsByLocation.clearfield || 0);
          const totalType = (bookingsByType.paid || 0) + (bookingsByType.membership || 0) + (bookingsByType.comp || 0) + (bookingsByType.other || 0);

          return (
            <div className="space-y-8">
              {/* Bookings Last 14 Days */}
              <section className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#F0E8D2] mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  BOOKINGS — LAST 14 DAYS
                </h3>
                <div className="flex items-end gap-1.5" style={{ height: 180 }}>
                  {dayEntries.map(([date, count]) => {
                    const d = new Date(date + "T12:00:00");
                    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const heightPct = count > 0 ? Math.max((count / maxDay) * 100, 4) : 0;
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[10px] text-[#C8973A] font-bold mb-1">{count > 0 ? count : ""}</span>
                        <div
                          className="w-full rounded-t bg-[#2D6A47] min-w-[8px] transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[9px] text-[#F0E8D2]/40 mt-1.5 whitespace-nowrap">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Busiest Hours */}
              <section className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#F0E8D2] mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  BUSIEST HOURS
                </h3>
                <div className="space-y-1.5">
                  {hourEntries.map(([hour, count]) => {
                    const label = hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`;
                    const widthPct = count > 0 ? Math.max((count / maxHour) * 100, 2) : 0;
                    return (
                      <div key={hour} className="flex items-center gap-3">
                        <span className="text-xs text-[#F0E8D2]/50 w-12 text-right font-mono">{label}</span>
                        <div className="flex-1 h-5 bg-[#F0E8D2]/5 rounded overflow-hidden">
                          <div
                            className="h-full bg-[#2D6A47] rounded transition-all"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#C8973A] font-bold w-8">{count > 0 ? count : ""}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Location Split + Booking Type + Unique Customers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location Split */}
                <section className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#F0E8D2] mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    LOCATION SPLIT
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(["kaysville", "clearfield"] as const).map((loc) => {
                      const count = bookingsByLocation[loc] || 0;
                      const pct = totalLocation > 0 ? Math.round((count / totalLocation) * 100) : 0;
                      return (
                        <div key={loc} className="bg-[#060A07] border border-[#F0E8D2]/10 rounded-lg p-4 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-[#F0E8D2]/40 capitalize">{loc}</p>
                          <p className="text-3xl font-bold text-[#C8973A] mt-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{count}</p>
                          <p className="text-xs text-[#F0E8D2]/30 mt-0.5">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Booking Type Breakdown */}
                <section className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#F0E8D2] mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    BOOKING TYPE
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Walk-In", key: "paid", color: "text-green-300" },
                      { label: "Member", key: "membership", color: "text-blue-300" },
                      { label: "Comp", key: "comp", color: "text-[#C8973A]" },
                      { label: "Total", key: "_total", color: "text-[#F0E8D2]" },
                    ].map(({ label, key, color }) => (
                      <div key={key} className="bg-[#060A07] border border-[#F0E8D2]/10 rounded-lg p-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-[#F0E8D2]/40">{label}</p>
                        <p className={`text-2xl font-bold mt-1 ${color}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                          {key === "_total" ? totalType : (bookingsByType[key] || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Unique Customers */}
              <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#F0E8D2]/40">Unique Customers (Last 14 Days)</p>
                <p className="text-4xl font-bold text-[#C8973A] mt-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {uniqueCustomers}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── Messages Tab ── */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              MESSAGES ({data.messages.length})
            </h2>
            {data.messages.length === 0 ? (
              <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8 text-center text-[#F0E8D2]/40">
                No messages yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.messages.map((msg) => {
                  const isExpanded = expandedMessage === msg.id;
                  const meta = msg.metadata as Record<string, unknown> | null;
                  return (
                    <div
                      key={msg.id}
                      className={`border rounded-lg overflow-hidden transition-colors ${
                        !msg.read
                          ? "border-l-4 border-l-[#2D6A47] border-t-[#F0E8D2]/10 border-r-[#F0E8D2]/10 border-b-[#F0E8D2]/10 bg-[#F0E8D2]/[0.05]"
                          : "border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03]"
                      }`}
                    >
                      {/* Header - clickable */}
                      <button
                        onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                        className="w-full text-left p-4 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              msg.type === "build_inquiry"
                                ? "bg-[#C8973A]/20 text-[#C8973A]"
                                : "bg-[#2D6A47]/30 text-green-300"
                            }`}>
                              {msg.type === "build_inquiry" ? "Build Inquiry" : "Contact"}
                            </span>
                            {!msg.read && (
                              <span className="inline-block w-2 h-2 rounded-full bg-[#2D6A47]" />
                            )}
                            <span className="text-xs text-[#F0E8D2]/30 ml-auto">
                              {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {" "}
                              {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#F0E8D2] mt-1.5">{msg.name}</p>
                          <p className="text-xs text-[#F0E8D2]/50">{msg.email}</p>
                          {msg.subject && (
                            <p className="text-xs text-[#C8973A]/70 mt-1">{msg.subject}</p>
                          )}
                          {!isExpanded && msg.message && (
                            <p className="text-xs text-[#F0E8D2]/30 mt-1 truncate">{msg.message}</p>
                          )}
                        </div>
                        <span className="text-[#F0E8D2]/20 text-lg mt-1">{isExpanded ? "\u25B2" : "\u25BC"}</span>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          {msg.phone && (
                            <p className="text-xs text-[#F0E8D2]/50">Phone: <span className="text-[#F0E8D2]/80">{msg.phone}</span></p>
                          )}
                          {msg.message && (
                            <div className="bg-[#060A07] border border-[#F0E8D2]/10 rounded p-3">
                              <p className="text-xs text-[#F0E8D2]/40 mb-1 uppercase tracking-wider">Message</p>
                              <p className="text-sm text-[#F0E8D2]/80 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          )}
                          {msg.type === "build_inquiry" && meta && (
                            <div className="bg-[#060A07] border border-[#F0E8D2]/10 rounded p-3">
                              <p className="text-xs text-[#F0E8D2]/40 mb-2 uppercase tracking-wider">Build Details</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                {Boolean(meta.width && meta.length && meta.height) && (
                                  <div>
                                    <span className="text-[#F0E8D2]/40">Room Size: </span>
                                    <span className="text-[#F0E8D2]/80">{String(meta.width)}&apos; W x {String(meta.length)}&apos; L x {String(meta.height)}&apos; H</span>
                                  </div>
                                )}
                                {Boolean(meta.budget) && (
                                  <div>
                                    <span className="text-[#F0E8D2]/40">Budget: </span>
                                    <span className="text-[#F0E8D2]/80">{String(meta.budget)}</span>
                                  </div>
                                )}
                                {Boolean(meta.timeline) && (
                                  <div>
                                    <span className="text-[#F0E8D2]/40">Timeline: </span>
                                    <span className="text-[#F0E8D2]/80">{String(meta.timeline)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => doAction({ action: msg.read ? "mark_unread" : "mark_read", messageId: msg.id })}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-[#2D6A47]/30 text-green-300 rounded text-xs hover:bg-[#2D6A47]/50 disabled:opacity-50 transition-colors"
                            >
                              {msg.read ? "Mark Unread" : "Mark Read"}
                            </button>
                            <button
                              onClick={() => {
                                if (!confirm("Delete this message?")) return;
                                doAction({ action: "delete_message", messageId: msg.id });
                                setExpandedMessage(null);
                              }}
                              disabled={actionLoading !== null}
                              className="px-3 py-1.5 bg-red-900/30 text-red-300 rounded text-xs hover:bg-red-900/50 disabled:opacity-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Dashboard Tab ── */}
        {activeTab === "dashboard" && <>

        {/* ── Quick Actions ── */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              if (!confirm("Send follow-up emails to customers whose sessions have ended?")) return;
              const res = await fetch("/api/admin/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: storedPassword, action: "send_followups" }),
              });
              const data = await res.json();
              alert(`Done! ${data.sent || 0} follow-up email(s) sent.`);
            }}
            className="rounded border border-[#C8973A]/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8973A]/70 transition-colors hover:bg-[#C8973A]/10 hover:text-[#C8973A]"
          >
            Send Follow-up Emails
          </button>
        </div>

        {/* ── Keybox Codes ── */}
        {data.locations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.locations.map((loc) => (
              <div key={loc.id} className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">{loc.name}</p>
                  <p className="text-xs text-[#F0E8D2]/40">{loc.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  {editingKeybox === loc.id ? (
                    <>
                      <input
                        type="text"
                        value={keyboxValue}
                        onChange={(e) => setKeyboxValue(e.target.value)}
                        className="w-24 px-2 py-1 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#C8973A] text-center text-lg font-bold tracking-widest"
                      />
                      <button
                        onClick={() => handleUpdateKeybox(loc.id)}
                        disabled={actionLoading !== null}
                        className="px-2 py-1 bg-[#2D6A47]/40 text-green-300 rounded text-xs hover:bg-[#2D6A47]/60 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKeybox(null)}
                        className="px-2 py-1 text-[#F0E8D2]/40 text-xs hover:text-[#F0E8D2]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[#F0E8D2]/40">Keybox</p>
                        <p className="text-xl font-bold text-[#C8973A] tracking-widest">{loc.keybox_code || "N/A"}</p>
                      </div>
                      <button
                        onClick={() => { setEditingKeybox(loc.id); setKeyboxValue(loc.keybox_code || ""); }}
                        className="px-2 py-1 border border-[#F0E8D2]/10 text-[#F0E8D2]/30 rounded text-[10px] hover:text-[#F0E8D2]/60 hover:border-[#F0E8D2]/20"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Stats & Revenue Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Bookings Today", value: data.stats.bookingsToday },
            { label: "Bookings This Week", value: data.stats.bookingsThisWeek },
            { label: "Active Members", value: data.stats.activeMembers },
            { label: "Revenue This Month", value: `$${data.revenue.thisMonth.toLocaleString()}`, sub: `${data.revenue.thisMonthBookings} bookings` },
            { label: "Revenue Last Month", value: `$${data.revenue.lastMonth.toLocaleString()}`, sub: `${data.revenue.lastMonthBookings} bookings` },
            { label: "Revenue This Year", value: `$${data.revenue.thisYear.toLocaleString()}`, sub: `${data.revenue.thisYearBookings} bookings` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4 text-center"
            >
              <p className="text-[#F0E8D2]/60 text-[10px] uppercase tracking-wider">
                {stat.label}
              </p>
              <p
                className="text-2xl font-bold text-[#C8973A] mt-1"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {typeof stat.value === "number" ? stat.value : stat.value}
              </p>
              {"sub" in stat && stat.sub && (
                <p className="text-[10px] text-[#F0E8D2]/30 mt-0.5">{stat.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── Expiring Memberships ── */}
        {Array.isArray(data.expiringMemberships) && data.expiringMemberships.length > 0 && (
          <section className="border border-[#C8973A]/30 bg-[#C8973A]/5 rounded-lg p-4">
            <h2
              className="text-lg font-bold text-[#C8973A] mb-3"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              MEMBERSHIPS EXPIRING SOON
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.expiringMemberships.map((mem) => (
                <div key={mem.id} className="flex items-center justify-between bg-[#060A07] border border-[#F0E8D2]/10 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-semibold">{mem.customers?.name || "Unknown"}</p>
                    <p className="text-xs text-[#F0E8D2]/40">{mem.customers?.email}</p>
                    <p className="text-xs text-[#C8973A] mt-0.5">
                      {mem.type} - expires {mem.end_date}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendRenewalReminder(mem)}
                    disabled={actionLoading !== null}
                    className="shrink-0 ml-2 px-3 py-1.5 bg-[#C8973A]/20 text-[#C8973A] rounded text-xs font-medium hover:bg-[#C8973A]/30 disabled:opacity-50 transition-colors"
                  >
                    Remind
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming Bookings (Today & Tomorrow) ── */}
        {(todayUpcoming.length > 0 || tomorrowUpcoming.length > 0) && (
          <section>
            <h2
              className="text-2xl font-bold text-[#F0E8D2] mb-4"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              TODAY &amp; TOMORROW
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { label: "Today", bookings: todayUpcoming },
                { label: "Tomorrow", bookings: tomorrowUpcoming },
              ].map(({ label, bookings: bks }) => (
                <div key={label} className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-4">
                  <h3
                    className="text-sm font-bold uppercase tracking-wider text-[#F0E8D2]/60 mb-3"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {label} ({bks.length})
                  </h3>
                  {bks.length === 0 ? (
                    <p className="text-xs text-[#F0E8D2]/30">No bookings</p>
                  ) : (
                    <div className="space-y-2">
                      {bks.map((b) => (
                        <div key={b.id} className="flex items-center justify-between bg-[#060A07] border border-[#F0E8D2]/5 rounded p-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#C8973A] w-16">{formatTime(b.start_time)}</span>
                            <span className="text-sm">{b.customers?.name || "Unknown"}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
                              b.status === "blocked"
                                ? "bg-red-900/30 text-red-400"
                                : "bg-[#2D6A47]/20 text-green-400"
                            }`}>
                              {b.status === "blocked" ? "blocked" : b.payment_status}
                            </span>
                          </div>
                          <span className="text-xs text-[#F0E8D2]/40 capitalize">{b.location}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Bookings Section ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl font-bold text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              BOOKINGS
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockSlot(!showBlockSlot)}
                className="px-4 py-2 border border-red-500/30 text-red-400/70 rounded font-semibold hover:bg-red-900/20 hover:text-red-400 transition-colors text-sm"
              >
                {showBlockSlot ? "Cancel" : "Block Slot"}
              </button>
              <button
                onClick={() => setShowCreateBooking(!showCreateBooking)}
                className="px-4 py-2 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors text-sm"
              >
                {showCreateBooking ? "Cancel" : "Create Booking"}
              </button>
            </div>
          </div>

          {/* Block Slot Form */}
          {showBlockSlot && (
            <form
              onSubmit={handleBlockSlot}
              className="border border-red-500/20 bg-red-900/5 rounded-lg p-6 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
            >
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">Location</label>
                <select
                  value={blockLocation}
                  onChange={(e) => setBlockLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                >
                  <option value="kaysville">Kaysville</option>
                  <option value="clearfield">Clearfield</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">Date</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">Hour</label>
                <select
                  value={blockHour}
                  onChange={(e) => setBlockHour(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                    <option key={h} value={h}>
                      {h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-red-900/40 text-red-300 rounded font-semibold hover:bg-red-900/60 disabled:opacity-50 transition-colors text-sm"
              >
                Block Slot
              </button>
            </form>
          )}

          {/* Create Booking Form */}
          {showCreateBooking && (
            <form
              onSubmit={handleCreateBooking}
              className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
            >
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                  Customer
                </label>
                <select
                  value={newBookingCustomerId}
                  onChange={(e) => setNewBookingCustomerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                >
                  <option value="">Select customer</option>
                  {data.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                  Location
                </label>
                <select
                  value={newBookingLocation}
                  onChange={(e) => setNewBookingLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                >
                  <option value="kaysville">Kaysville</option>
                  <option value="clearfield">Clearfield</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  value={newBookingDate}
                  onChange={(e) => setNewBookingDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                  Hour
                </label>
                <select
                  value={newBookingHour}
                  onChange={(e) => setNewBookingHour(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                    <option key={h} value={h}>
                      {h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-[#C8973A] text-[#060A07] rounded font-semibold hover:bg-[#C8973A]/80 disabled:opacity-50 transition-colors text-sm"
              >
                Create
              </button>
            </form>
          )}

          {/* Bookings Table */}
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase">
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Payment</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((b) => (
                  <tr
                    key={b.id}
                    className={`border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02] ${
                      b.status === "blocked" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="p-3">{b.status === "blocked" ? "BLOCKED" : (b.customers?.name || "Unknown")}</td>
                    <td className="p-3 text-[#F0E8D2]/60">
                      {b.status === "blocked" ? "-" : (b.customers?.email || "-")}
                    </td>
                    <td className="p-3 capitalize">{b.location}</td>
                    <td className="p-3">{formatDateTime(b.start_time)}</td>
                    <td className="p-3">{formatTime(b.start_time)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          b.status === "cancelled"
                            ? "bg-red-900/40 text-red-300"
                            : b.status === "blocked"
                            ? "bg-red-900/30 text-red-400"
                            : b.status === "confirmed"
                            ? "bg-[#2D6A47]/40 text-green-300"
                            : "bg-[#C8973A]/20 text-[#C8973A]"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-[#F0E8D2]/60">{b.payment_status}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {b.status === "blocked" ? (
                          <button
                            onClick={() => handleUnblockSlot(b.id)}
                            disabled={actionLoading !== null}
                            className="px-2 py-1 bg-[#2D6A47]/40 text-green-300 rounded text-xs hover:bg-[#2D6A47]/60 disabled:opacity-50 transition-colors"
                          >
                            Unblock
                          </button>
                        ) : (
                          <>
                            {b.status === "confirmed" && (
                              <button
                                onClick={() => handleResendConfirmation(b.id)}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-[#2D6A47]/20 text-green-300/70 rounded text-xs hover:bg-[#2D6A47]/40 hover:text-green-300 disabled:opacity-50 transition-colors"
                              >
                                Resend Email
                              </button>
                            )}
                            {b.status !== "cancelled" && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-red-900/40 text-red-300 rounded text-xs hover:bg-red-900/60 disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {b.stripe_payment_id && b.payment_status !== "refunded" && (
                              <button
                                onClick={() => handleRefundBooking(b.id, b.stripe_payment_id)}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 border border-[#C8973A]/30 text-[#C8973A]/70 rounded text-xs hover:bg-[#C8973A]/10 hover:text-[#C8973A] disabled:opacity-50 transition-colors"
                              >
                                Refund
                              </button>
                            )}
                            {b.payment_status === "refunded" && (
                              <span className="text-[10px] uppercase tracking-wider text-green-400/50">Refunded</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-[#F0E8D2]/40">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Customers Section ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl font-bold text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              CUSTOMERS
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const rows = [["Name", "Email", "Phone", "Membership", "Notes"]];
                  data.customers.forEach((c) => {
                    rows.push([
                      c.name,
                      c.email,
                      c.phone || "",
                      c.membership?.type || "none",
                      (c.notes || "").replace(/,/g, ";"),
                    ]);
                  });
                  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `gimme-golf-customers-${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded border border-[#F0E8D2]/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F0E8D2]/60 transition-colors hover:border-[#F0E8D2]/40 hover:text-[#F0E8D2]"
              >
                Export CSV
              </button>
              <button
                onClick={openCreateMember}
                className="rounded bg-[#C8973A] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#060A07] transition-colors hover:bg-[#C8973A]/90"
              >
                Create Member
              </button>
            </div>
          </div>
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Membership</th>
                  <th className="text-left p-3">Remaining</th>
                  <th className="text-left p-3">Actions</th>
                  <th className="text-left p-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02]"
                  >
                    <td className="p-3">
                      <div>
                        <span>{c.name}</span>
                        {editingNotesId === c.id ? (
                          <div className="mt-2 flex flex-col gap-1">
                            <textarea
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              rows={2}
                              className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-2 py-1 text-xs text-[#F0E8D2] outline-none focus:border-[#2D6A47] resize-none"
                              placeholder="Add notes..."
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => saveNotes(c.id)}
                                disabled={actionLoading !== null}
                                className="px-2 py-0.5 bg-[#2D6A47]/40 text-green-300 rounded text-xs hover:bg-[#2D6A47]/60 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-2 py-0.5 text-[#F0E8D2]/40 rounded text-xs hover:text-[#F0E8D2]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-0.5 flex items-start gap-1">
                            {c.notes ? (
                              <p className="text-[10px] leading-tight text-[#C8973A]/70 italic">{c.notes}</p>
                            ) : null}
                            <button
                              onClick={() => startEditNotes(c)}
                              className="shrink-0 text-[10px] text-[#F0E8D2]/20 hover:text-[#F0E8D2]/50"
                            >
                              {c.notes ? "edit" : "+ note"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-[#F0E8D2]/60">{c.email}</td>
                    <td className="p-3 text-[#F0E8D2]/60">{c.phone || "-"}</td>
                    <td className="p-3">
                      {c.membership ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#2D6A47]/40 text-green-300">
                          {c.membership.type}
                        </span>
                      ) : (
                        <span className="text-[#F0E8D2]/30 text-xs">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      {c.membership?.type === "staff"
                        ? <span className="text-[#C8973A] font-medium">Unlimited</span>
                        : c.membership?.type === "punchpass" && c.membership.sessions_remaining != null
                          ? `${c.membership.sessions_remaining} sessions`
                          : (c.membership?.type === "monthly" || c.membership?.type === "annual")
                            ? `${20 - (c.membership.hours_used_this_month || 0)}/20 hrs`
                            : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {[1, 5, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => handleAddSessions(c.id, n)}
                            disabled={actionLoading !== null}
                            className="px-2 py-1 bg-[#2D6A47]/40 text-green-300 rounded text-xs hover:bg-[#2D6A47]/60 disabled:opacity-50 transition-colors"
                          >
                            +{n}
                          </button>
                        ))}
                        <button
                          onClick={() => handleRemoveSessions(c.id, 1)}
                          disabled={actionLoading !== null}
                          className="px-2 py-1 bg-red-900/40 text-red-300 rounded text-xs hover:bg-red-900/60 disabled:opacity-50 transition-colors"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => {
                            setCompModalCustomer(c);
                            setCompLocation("kaysville");
                            setCompDate(new Date().toISOString().split("T")[0]);
                            setCompHour(9);
                          }}
                          disabled={actionLoading !== null}
                          className="px-2 py-1 bg-[#C8973A]/20 text-[#C8973A] rounded text-xs hover:bg-[#C8973A]/30 disabled:opacity-50 transition-colors"
                        >
                          Comp
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openMemModal(c)}
                          disabled={actionLoading !== null}
                          className="px-2 py-1 border border-[#C8973A]/30 text-[#C8973A]/70 rounded text-xs hover:bg-[#C8973A]/10 hover:text-[#C8973A] disabled:opacity-50 transition-colors"
                        >
                          Membership
                        </button>
                        {c.membership && (
                          <button
                            onClick={() => { if (confirm(`Send welcome email for ${c.name}?`)) doAction({ action: "send_welcome_email", customerId: c.id }); }}
                            disabled={actionLoading !== null}
                            className="px-2 py-1 border border-[#2D6A47]/30 text-[#2D6A47]/70 rounded text-xs hover:bg-[#2D6A47]/10 hover:text-[#2D6A47] disabled:opacity-50 transition-colors"
                          >
                            Welcome Email
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          disabled={actionLoading !== null}
                          className="px-2 py-1 border border-red-500/30 text-red-400/60 rounded text-xs hover:bg-red-900/30 hover:text-red-400 disabled:opacity-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#F0E8D2]/40">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        </>}
      </div>

      {/* ── Comp Session Modal ── */}
      {compModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#F0E8D2]/10 bg-[#060A07] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-lg font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Comp Session — {compModalCustomer.name}
              </h3>
              <button onClick={() => setCompModalCustomer(null)} className="text-[#F0E8D2]/40 hover:text-[#F0E8D2]">&times;</button>
            </div>
            <form onSubmit={handleCompBooking} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Location</label>
                <select
                  value={compLocation}
                  onChange={(e) => setCompLocation(e.target.value)}
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                >
                  <option value="kaysville">Kaysville</option>
                  <option value="clearfield">Clearfield</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Date</label>
                <input
                  type="date"
                  value={compDate}
                  onChange={(e) => setCompDate(e.target.value)}
                  required
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Hour</label>
                <select
                  value={compHour}
                  onChange={(e) => setCompHour(Number(e.target.value))}
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                    <option key={h} value={h}>
                      {h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-[#F0E8D2]/30">This will create a confirmed booking with payment status &quot;comp&quot; and send a confirmation email to the customer.</p>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="flex-1 rounded bg-[#C8973A] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#060A07] transition-colors hover:bg-[#C8973A]/90 disabled:opacity-50"
                >
                  Comp Session
                </button>
                <button
                  type="button"
                  onClick={() => setCompModalCustomer(null)}
                  className="rounded border border-[#F0E8D2]/20 px-4 py-2.5 text-sm text-[#F0E8D2]/50 hover:text-[#F0E8D2]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Member Modal ── */}
      {showCreateMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-[#F0E8D2]/10 bg-[#060A07] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-lg font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Create Member
              </h3>
              <button onClick={() => setShowCreateMember(false)} className="text-[#F0E8D2]/40 hover:text-[#F0E8D2]">&times;</button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Name *</label>
                  <input type="text" value={cmName} onChange={(e) => setCmName(e.target.value)} required className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Email *</label>
                  <input type="email" value={cmEmail} onChange={(e) => setCmEmail(e.target.value)} required className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Phone</label>
                <input type="tel" value={cmPhone} onChange={(e) => setCmPhone(e.target.value)} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Membership Type</label>
                <select value={cmType} onChange={(e) => setCmType(e.target.value)} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]">
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="punchpass">Punch Pass</option>
                  <option value="staff">Staff / Owner</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Start Date</label>
                  <input type="date" value={cmStartDate} onChange={(e) => setCmStartDate(e.target.value)} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-2">
                    <input type="checkbox" checked={cmNoExpiry} onChange={(e) => setCmNoExpiry(e.target.checked)} className="accent-[#2D6A47]" />
                    <span className="text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">No Expiry</span>
                  </label>
                  {!cmNoExpiry && (
                    <input type="date" value={cmEndDate} onChange={(e) => setCmEndDate(e.target.value)} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
                  )}
                </div>
              </div>
              {(cmType === "monthly" || cmType === "annual") && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Hours Remaining This Month</label>
                  <input type="number" value={cmHours} onChange={(e) => setCmHours(Number(e.target.value))} min={0} max={20} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
                </div>
              )}
              {cmType === "punchpass" && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Sessions Remaining</label>
                  <input type="number" value={cmSessions} onChange={(e) => setCmSessions(Number(e.target.value))} min={0} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Notes</label>
                <textarea value={cmNotes} onChange={(e) => setCmNotes(e.target.value)} rows={2} className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47] resize-none" placeholder="e.g. Migrated from Wix, paid cash" />
              </div>
              <p className="text-[10px] text-[#F0E8D2]/30">A temporary password will be created. The member will receive a welcome email with a link to set their own password.</p>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={actionLoading !== null} className="flex-1 rounded bg-[#2D6A47] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50">
                  Create Member
                </button>
                <button type="button" onClick={() => setShowCreateMember(false)} className="rounded border border-[#F0E8D2]/20 px-4 py-2.5 text-sm text-[#F0E8D2]/50 hover:text-[#F0E8D2]">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Membership Modal ── */}
      {memModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#F0E8D2]/10 bg-[#060A07] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-lg font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Set Membership — {memModalCustomer.name}
              </h3>
              <button
                onClick={() => setMemModalCustomer(null)}
                className="text-[#F0E8D2]/40 hover:text-[#F0E8D2]"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSetMembership} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Type</label>
                <select
                  value={memType}
                  onChange={(e) => setMemType(e.target.value)}
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                >
                  <option value="walkin">Walk-In</option>
                  <option value="punchpass">Punch Pass</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="staff">Staff / Owner (Unlimited)</option>
                </select>
              </div>

              {memType === "punchpass" && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Sessions Remaining</label>
                  <input
                    type="number"
                    value={memSessions}
                    onChange={(e) => setMemSessions(Number(e.target.value))}
                    min={1}
                    className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Start Date</label>
                <input
                  type="date"
                  value={memStartDate}
                  onChange={(e) => setMemStartDate(e.target.value)}
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                />
              </div>

              {memType !== "staff" && (
                <div>
                  <label className="mb-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={memNoExpiry}
                      onChange={(e) => setMemNoExpiry(e.target.checked)}
                      className="accent-[#2D6A47]"
                    />
                    <span className="text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">No Expiry</span>
                  </label>
                  {!memNoExpiry && (
                    <input
                      type="date"
                      value={memEndDate}
                      onChange={(e) => setMemEndDate(e.target.value)}
                      className="mt-1 w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] outline-none focus:border-[#2D6A47]"
                      placeholder="End date"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="flex-1 rounded bg-[#2D6A47] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50"
                >
                  Save Membership
                </button>
                <button
                  type="button"
                  onClick={() => setMemModalCustomer(null)}
                  className="rounded border border-[#F0E8D2]/20 px-4 py-2.5 text-sm text-[#F0E8D2]/50 hover:text-[#F0E8D2]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
