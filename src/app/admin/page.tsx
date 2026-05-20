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
  created_at: string;
  customers: { name: string; email: string } | null;
}

interface Membership {
  id: string;
  type: string;
  sessions_remaining: number | null;
  active: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8">
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
            <table className="w-full text-sm">
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
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={actionLoading !== null}
                          className="px-2 py-1 bg-red-900/40 text-red-300 rounded text-xs hover:bg-red-900/60 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
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
          <h2
            className="text-2xl font-bold text-[#F0E8D2] mb-4"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            CUSTOMERS
          </h2>
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Membership</th>
                  <th className="text-left p-3">Sessions</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02]"
                  >
                    <td className="p-3">{c.name}</td>
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
                      {c.membership?.sessions_remaining != null
                        ? c.membership.sessions_remaining
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
                  </tr>
                ))}
                {data.customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#F0E8D2]/40">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
