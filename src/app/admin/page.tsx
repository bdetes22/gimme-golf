"use client";

import { useState, useCallback } from "react";

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
  customers: { name: string; email: string } | null;
}

interface Membership {
  id: string;
  type: string;
  sessions_remaining: number | null;
  hours_used_this_month: number | null;
  hours_reset_date: string | null;
  active: boolean;
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

interface Stats {
  bookingsToday: number;
  bookingsThisWeek: number;
  activeMembers: number;
}

interface AdminData {
  bookings: Booking[];
  customers: Customer[];
  stats: Stats;
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

  const [storedPassword, setStoredPassword] = useState("");

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

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <h1
          className="text-3xl font-bold text-[#C8973A]"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          ADMIN DASHBOARD
        </h1>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Bookings Today", value: data.stats.bookingsToday },
            { label: "Bookings This Week", value: data.stats.bookingsThisWeek },
            { label: "Active Members", value: data.stats.activeMembers },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 text-center"
            >
              <p className="text-[#F0E8D2]/60 text-sm uppercase tracking-wider">
                {stat.label}
              </p>
              <p
                className="text-4xl font-bold text-[#C8973A] mt-2"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bookings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl font-bold text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              BOOKINGS
            </h2>
            <button
              onClick={() => setShowCreateBooking(!showCreateBooking)}
              className="px-4 py-2 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors text-sm"
            >
              {showCreateBooking ? "Cancel" : "Create Booking"}
            </button>
          </div>

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
                    className="border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02]"
                  >
                    <td className="p-3">{b.customers?.name || "Unknown"}</td>
                    <td className="p-3 text-[#F0E8D2]/60">
                      {b.customers?.email || "-"}
                    </td>
                    <td className="p-3 capitalize">{b.location}</td>
                    <td className="p-3">{formatDateTime(b.start_time)}</td>
                    <td className="p-3">{formatTime(b.start_time)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          b.status === "cancelled"
                            ? "bg-red-900/40 text-red-300"
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

        {/* Customers Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl font-bold text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              CUSTOMERS
            </h2>
            <button
              onClick={openCreateMember}
              className="rounded bg-[#C8973A] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#060A07] transition-colors hover:bg-[#C8973A]/90"
            >
              Create Member
            </button>
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
      </div>

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
