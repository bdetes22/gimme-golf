"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── helpers ──
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function fmt(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const LOCATIONS = [
  {
    id: "kaysville",
    name: "Kaysville",
    address: "140 N Main Street, Kaysville, UT 84037",
  },
  {
    id: "clearfield",
    name: "Clearfield",
    address: "293 State St, Clearfield, UT 84015",
  },
];

const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = i;
  const label = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
  const endH = (h + 1) % 24;
  const endLabel = endH === 0 ? "12 AM" : endH < 12 ? `${endH} AM` : endH === 12 ? "12 PM" : `${endH - 12} PM`;
  return { hour: h, label, endLabel };
});

const STEPS = ["Location", "Date", "Time", "Info", "Review"];

interface MembershipInfo {
  type: string;
  sessions_remaining: number | null;
  active: boolean;
}

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingError, setBookingError] = useState("");

  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [waiverAlreadySigned, setWaiverAlreadySigned] = useState(false);

  // Auth + membership state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);

  // calendar state
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [loading, setLoading] = useState(false);
  const [bookedHours, setBookedHours] = useState<number[]>([]);

  // Check if user is logged in and has a membership
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Pre-fill info from auth
      setName(session.user.user_metadata?.name || "");
      setEmail(session.user.email || "");
      setPhone(session.user.user_metadata?.phone || "");

      // Get customer ID and waiver status
      const { data: customer } = await supabase
        .from("customers")
        .select("id, waiver_signed_at")
        .eq("email", session.user.email)
        .single();

      if (customer) {
        setCustomerId(customer.id);
        if (customer.waiver_signed_at) {
          setWaiverAlreadySigned(true);
          setWaiverAccepted(true);
        }

        // Check for active membership
        const { data: mem } = await supabase
          .from("memberships")
          .select("type, sessions_remaining, active")
          .eq("customer_id", customer.id)
          .eq("active", true)
          .limit(1)
          .single();

        if (mem) setMembership(mem);
      }
    }
    checkAuth();
  }, []);

  // Can this member book without paying?
  const canBookFree = membership && membership.active && (
    membership.type === "staff" ||
    membership.type === "monthly" ||
    membership.type === "annual" ||
    (membership.type === "punchpass" && membership.sessions_remaining !== null && membership.sessions_remaining > 0)
  );

  // Fetch booked slots when location + date are set
  const fetchBookedSlots = useCallback(async () => {
    if (!location || !selectedDate) return;
    const dateISO = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/bookings?location=${location}&date=${dateISO}`);
      const data = await res.json();
      setBookedHours(data.bookedHours || []);
    } catch {
      setBookedHours([]);
    }
  }, [location, selectedDate]);

  useEffect(() => {
    if (step === 2) {
      fetchBookedSlots();
    }
  }, [step, fetchBookedSlots]);

  const monthName = new Date(calYear, calMonth).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Compute selected hours from start + duration (wraps past midnight)
  const selectedHours = useMemo(() => {
    if (selectedStartHour === null) return [];
    return Array.from({ length: duration }, (_, i) => (selectedStartHour + i) % 24);
  }, [selectedStartHour, duration]);

  // Check if a start time + duration has any conflicts (allows overnight)
  const isRangeAvailable = useCallback((startHour: number, dur: number) => {
    for (let i = 0; i < dur; i++) {
      const h = (startHour + i) % 24;
      if (bookedHours.includes(h)) return false;
    }
    return true;
  }, [bookedHours]);

  const canGoBack = step > 0;
  const canGoNext = (() => {
    if (step === 0) return !!location;
    if (step === 1) return !!selectedDate;
    if (step === 2) return selectedStartHour !== null && isRangeAvailable(selectedStartHour, duration);
    if (step === 3) return name.trim() && email.trim();
    return false;
  })();

  const locObj = LOCATIONS.find((l) => l.id === location);
  const firstSlot = SLOTS.find((s) => s.hour === selectedHours[0]);
  const lastSlot = SLOTS.find((s) => s.hour === selectedHours[selectedHours.length - 1]);
  const timeDisplay = firstSlot && lastSlot ? `${firstSlot.label} – ${lastSlot.endLabel}` : "";
  const totalHours = selectedHours.length;
  const totalPrice = totalHours * 35;

  const dateISO = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";

  async function handleMemberBooking() {
    if (!customerId || !locObj) return;
    setLoading(true);
    setBookingError("");
    // Save waiver to account if first time
    if (!waiverAlreadySigned && waiverAccepted) {
      try {
        await supabase.from("customers").update({ waiver_signed_at: new Date().toISOString() }).eq("id", customerId);
      } catch { /* non-blocking */ }
    }
    try {
      const res = await fetch("/api/bookings/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          location: locObj.name,
          dateISO,
          hours: selectedHours,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/book/success");
      } else if (res.status === 401 || res.status === 403 || data.expired) {
        setBookingError("SESSION_EXPIRED");
        setLoading(false);
      } else {
        setBookingError(data.error || "Booking failed");
        setLoading(false);
      }
    } catch {
      setBookingError("Failed to create booking");
      setLoading(false);
    }
  }

  async function handleStripeCheckout() {
    setLoading(true);
    setBookingError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: locObj?.name,
          date: selectedDate ? fmt(selectedDate) : "",
          time: timeDisplay,
          dateISO,
          hour: selectedStartHour,
          duration,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          amount: totalPrice * 100,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      alert("Failed to create checkout session");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-6">
        {/* ── Auth Banner ── */}
        {!customerId && (
          <div className="mb-6 rounded-lg border border-[#2D6A47]/20 bg-[#2D6A47]/[0.06] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F0E8D2]">Already a member?</p>
                <p className="text-xs text-[#F0E8D2]/50">Log in to book with your membership or punch pass — no payment needed.</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="/login?redirect=/book"
                  className="rounded bg-[#2D6A47] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
                >
                  Log In
                </a>
                <a
                  href="/signup?redirect=/book"
                  className="rounded border border-[#F0E8D2]/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:border-[#F0E8D2]/40"
                >
                  Sign Up
                </a>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-[#F0E8D2]/30">
              Not a member? No problem — you can book as a walk-in for $35/hr. <a href="/memberships" className="text-[#C8973A] hover:underline">View membership plans</a>
            </p>
          </div>
        )}

        {/* ── Member Banner ── */}
        {customerId && canBookFree && (
          <div className="mb-6 rounded-lg border border-[#2D6A47]/20 bg-[#2D6A47]/[0.06] p-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 shrink-0 text-[#2D6A47]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <p className="text-sm text-[#F0E8D2]">
                <span className="font-semibold">Logged in as a member</span>
                <span className="text-[#F0E8D2]/50"> — your booking will be included with your {membership?.type === "punchpass" ? "punch pass" : "membership"}.</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Progress ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      i < step
                        ? "bg-[#2D6A47] text-[#F0E8D2]"
                        : i === step
                          ? "border-2 border-[#2D6A47] text-[#2D6A47]"
                          : "border border-[#F0E8D2]/20 text-[#F0E8D2]/30"
                    }`}
                  >
                    {i < step ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 hidden text-xs font-medium sm:block ${
                      i <= step ? "text-[#F0E8D2]/70" : "text-[#F0E8D2]/30"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 ${
                      i < step ? "bg-[#2D6A47]" : "bg-[#F0E8D2]/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 0: Location ── */}
        {step === 0 && (
          <div>
            <h2
              className="mb-6 text-3xl font-bold uppercase text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Choose a Location
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocation(loc.id)}
                  className={`relative rounded-lg border p-6 text-left transition-all ${
                    location === loc.id
                      ? "border-[#2D6A47] bg-[#2D6A47]/[0.08]"
                      : "border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] hover:border-[#F0E8D2]/20"
                  }`}
                >
                  <div className="absolute right-4 top-4 rounded-full border border-[#2D6A47] bg-[#2D6A47]/10 px-2 py-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A47]">
                      24/7
                    </span>
                  </div>
                  <h3
                    className="mb-1 text-xl font-bold uppercase text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {loc.name}
                  </h3>
                  <p className="text-sm text-[#F0E8D2]/50">{loc.address}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Date ── */}
        {step === 1 && (
          <div>
            <h2
              className="mb-6 text-3xl font-bold uppercase text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Pick a Date
            </h2>
            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                    else setCalMonth(calMonth - 1);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded text-[#F0E8D2]/50 hover:text-[#F0E8D2]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#F0E8D2]">{monthName}</span>
                <button
                  onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                    else setCalMonth(calMonth + 1);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded text-[#F0E8D2]/50 hover:text-[#F0E8D2]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-[#F0E8D2]/40">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay(calYear, calMonth) }, (_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth(calYear, calMonth) }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(calYear, calMonth, day);
                  const isPast = date < today;
                  const isSelected = selectedDate?.getTime() === date.getTime();
                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      onClick={() => setSelectedDate(date)}
                      className={`flex h-10 items-center justify-center rounded text-sm transition-colors ${
                        isPast
                          ? "cursor-not-allowed text-[#F0E8D2]/15"
                          : isSelected
                            ? "bg-[#2D6A47] font-bold text-[#F0E8D2]"
                            : "text-[#F0E8D2]/70 hover:bg-[#F0E8D2]/10"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Time ── */}
        {step === 2 && (
          <div>
            <h2
              className="mb-2 text-3xl font-bold uppercase text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Choose a Time
            </h2>
            <p className="mb-6 text-sm text-[#F0E8D2]/50">{selectedDate && fmt(selectedDate)}</p>

            {/* Duration selector */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[#F0E8D2]/70">Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {(canBookFree ? [1, 2, 3] : [1, 2, 3, 4]).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDuration(d);
                      // Reset start if current selection doesn't fit new duration
                      if (selectedStartHour !== null && !isRangeAvailable(selectedStartHour, d)) {
                        setSelectedStartHour(null);
                      }
                    }}
                    className={`rounded-lg border py-3 text-center text-sm font-medium transition-colors ${
                      duration === d
                        ? "border-[#2D6A47] bg-[#2D6A47]/[0.15] text-[#F0E8D2]"
                        : "border-[#F0E8D2]/10 text-[#F0E8D2]/60 hover:border-[#F0E8D2]/20"
                    }`}
                  >
                    <span className="block font-bold">{d} hr{d > 1 ? "s" : ""}</span>
                    <span className="block text-xs text-[#F0E8D2]/40">${d * 35}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start time picker */}
            <label className="mb-2 block text-sm font-medium text-[#F0E8D2]/70">Start Time</label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {SLOTS.map((slot) => {
                const isBooked = bookedHours.includes(slot.hour);
                const canFit = isRangeAvailable(slot.hour, duration);
                const isToday = selectedDate?.toDateString() === new Date().toDateString();
                const isPastHour = isToday && slot.hour <= new Date().getHours();
                const isUnavailable = isBooked || !canFit || isPastHour;
                const isSelected = selectedStartHour === slot.hour;
                return (
                  <button
                    key={slot.hour}
                    disabled={isUnavailable}
                    onClick={() => setSelectedStartHour(isSelected ? null : slot.hour)}
                    className={`rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-colors h-[52px] flex flex-col items-center justify-center ${
                      isUnavailable
                        ? "cursor-not-allowed border-[#F0E8D2]/5 bg-[#F0E8D2]/[0.02] text-[#F0E8D2]/20"
                        : isSelected
                          ? "border-[#2D6A47] bg-[#2D6A47]/[0.15] text-[#F0E8D2]"
                          : "border-[#F0E8D2]/10 text-[#F0E8D2]/60 hover:border-[#F0E8D2]/20"
                    }`}
                  >
                    {slot.label}
                    {isBooked && <span className="block text-[10px] uppercase tracking-wider">Booked</span>}
                    {!isBooked && !canFit && <span className="block text-[10px] uppercase tracking-wider">N/A</span>}
                  </button>
                );
              })}
            </div>
            {selectedStartHour !== null && (
              <p className="mt-3 text-sm text-[#F0E8D2]/50">
                Selected: {timeDisplay} ({totalHours} hour{totalHours > 1 ? "s" : ""} — {canBookFree ? "included" : `$${totalPrice}`})
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Customer Info ── */}
        {step === 3 && (
          <div>
            <h2
              className="mb-6 text-3xl font-bold uppercase text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Your Info
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith"
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com"
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(801) 555-1234"
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div>
            <h2
              className="mb-6 text-3xl font-bold uppercase text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {canBookFree ? "Review & Confirm" : "Review & Pay"}
            </h2>
            <div className="mb-8 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Location</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">{locObj?.name}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Address</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">{locObj?.address}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Date</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">{selectedDate && fmt(selectedDate)}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Time</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">{timeDisplay}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Duration</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">{totalHours} hour{totalHours > 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Name</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">{name}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-[#F0E8D2]/50">Email</span>
                  <span className="text-sm font-medium text-[#F0E8D2] break-all">{email}</span>
                </div>
                {phone && (
                  <div className="flex flex-col gap-1 border-b border-[#F0E8D2]/10 pb-3 sm:flex-row sm:justify-between">
                    <span className="text-sm text-[#F0E8D2]/50">Phone</span>
                    <span className="text-sm font-medium text-[#F0E8D2]">{phone}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-base font-semibold text-[#F0E8D2]">Total</span>
                  {canBookFree ? (
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#2D6A47]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                        $0.00
                      </span>
                      <p className="text-xs text-[#2D6A47]">
                        {membership?.type === "punchpass" ? `${totalHours} Punch Pass Session${totalHours > 1 ? "s" : ""}` : "Member Booking"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      ${totalPrice}.00
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Waiver */}
            {!waiverAlreadySigned && (
              <div className="mb-4 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-4">
                <h4 className="mb-2 text-sm font-semibold text-[#F0E8D2]">Liability Waiver</h4>
                <div className="mb-3 max-h-32 overflow-y-auto rounded bg-[#060A07] p-3 text-xs leading-relaxed text-[#F0E8D2]/40">
                  <p>By booking a session at Gimme Golf, I acknowledge and agree that:</p>
                  <p className="mt-2">1. I understand that golf simulation involves swinging golf clubs in an enclosed space and carries inherent risks of injury to myself and others.</p>
                  <p className="mt-1">2. I assume full responsibility for any injury to myself or others in my group during my session.</p>
                  <p className="mt-1">3. I agree to pay for any damage to equipment, screens, projectors, walls, or other property caused by myself or anyone in my group during the session.</p>
                  <p className="mt-1">4. I will use the simulator equipment safely and only for its intended purpose.</p>
                  <p className="mt-1">5. I will not use the facility under the influence of alcohol or drugs.</p>
                  <p className="mt-1">6. I release Gimme Golf (Deters Birrell Golf LLC), its owners, employees, and agents from any and all claims, damages, or liability arising from my use of the facility.</p>
                  <p className="mt-1">7. This waiver applies to all current and future visits to any Gimme Golf location.</p>
                </div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={waiverAccepted}
                    onChange={(e) => setWaiverAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#2D6A47]"
                  />
                  <span className="text-xs text-[#F0E8D2]/60">
                    I have read and agree to the liability waiver
                  </span>
                </label>
              </div>
            )}
            {waiverAlreadySigned && (
              <p className="mb-4 text-xs text-[#2D6A47]">✓ Liability waiver signed on file</p>
            )}

            {bookingError && (
              <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {bookingError === "SESSION_EXPIRED" ? (
                  <span>
                    Your session has expired. Please{" "}
                    <a href="/login?redirect=/book" className="font-semibold underline hover:text-red-300">
                      log in again
                    </a>{" "}
                    to continue.
                  </span>
                ) : (
                  bookingError
                )}
              </div>
            )}

            {canBookFree ? (
              <>
                <button
                  disabled={loading || !waiverAccepted}
                  onClick={handleMemberBooking}
                  className="w-full rounded bg-[#2D6A47] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Confirming..." : "Confirm Booking"}
                </button>
                <p className="mt-3 text-center text-xs text-[#F0E8D2]/30">
                  {membership?.type === "punchpass"
                    ? `${(membership.sessions_remaining || 0) - totalHours} session${((membership.sessions_remaining || 0) - totalHours) === 1 ? "" : "s"} remaining after this booking`
                    : "Included with your membership"}
                </p>
              </>
            ) : (
              <>
                <button
                  disabled={loading || !waiverAccepted}
                  onClick={handleStripeCheckout}
                  className="w-full rounded bg-[#2D6A47] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Redirecting to Stripe..." : `Pay with Stripe — $${totalPrice}.00`}
                </button>
                <p className="mt-3 text-center text-xs text-[#F0E8D2]/30">
                  You&apos;ll be redirected to Stripe to complete your payment.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        {step < 4 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => step === 0 ? router.push("/") : setStep(step - 1)}
              className="rounded border border-[#F0E8D2]/20 px-6 py-2.5 text-sm font-medium uppercase tracking-wider text-[#F0E8D2] transition-colors hover:border-[#F0E8D2]/40"
            >
              Back
            </button>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext}
              className={`rounded px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                canGoNext
                  ? "bg-[#2D6A47] text-[#F0E8D2] hover:bg-[#2D6A47]/90"
                  : "cursor-not-allowed bg-[#2D6A47]/30 text-[#F0E8D2]/30"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setStep(3)}
              className="text-sm font-medium text-[#F0E8D2]/50 transition-colors hover:text-[#F0E8D2]"
            >
              &larr; Go back and edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
