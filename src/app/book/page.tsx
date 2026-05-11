"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

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

const SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6; // 6am–11pm
  const label = h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
  const endH = h + 1;
  const endLabel =
    endH < 12 ? `${endH} AM` : endH === 12 ? "12 PM" : `${endH - 12} PM`;
  return { hour: h, label, endLabel };
});

const STEPS = ["Location", "Date", "Time", "Info", "Review"];

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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

  const canGoBack = step > 0;
  const canGoNext = (() => {
    if (step === 0) return !!location;
    if (step === 1) return !!selectedDate;
    if (step === 2) return selectedHour !== null;
    if (step === 3) return name.trim() && email.trim();
    return false;
  })();

  const locObj = LOCATIONS.find((l) => l.id === location);
  const slotObj = SLOTS.find((s) => s.hour === selectedHour);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-6">
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
                    className={`mt-1.5 text-xs font-medium ${
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
              {/* Month nav */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (calMonth === 0) {
                      setCalMonth(11);
                      setCalYear(calYear - 1);
                    } else setCalMonth(calMonth - 1);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded text-[#F0E8D2]/50 hover:text-[#F0E8D2]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#F0E8D2]">
                  {monthName}
                </span>
                <button
                  onClick={() => {
                    if (calMonth === 11) {
                      setCalMonth(0);
                      setCalYear(calYear + 1);
                    } else setCalMonth(calMonth + 1);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded text-[#F0E8D2]/50 hover:text-[#F0E8D2]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-[#F0E8D2]/40">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay(calYear, calMonth) }, (_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from(
                  { length: daysInMonth(calYear, calMonth) },
                  (_, i) => {
                    const day = i + 1;
                    const date = new Date(calYear, calMonth, day);
                    const isPast = date < today;
                    const isSelected =
                      selectedDate?.getTime() === date.getTime();
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
                  }
                )}
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
            <p className="mb-6 text-sm text-[#F0E8D2]/50">
              {selectedDate && fmt(selectedDate)}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {SLOTS.map((slot) => {
                const isBooked = bookedHours.includes(slot.hour);
                return (
                  <button
                    key={slot.hour}
                    disabled={isBooked}
                    onClick={() => setSelectedHour(slot.hour)}
                    className={`rounded-lg border px-3 py-3 text-center text-sm font-medium transition-colors ${
                      isBooked
                        ? "cursor-not-allowed border-[#F0E8D2]/5 bg-[#F0E8D2]/[0.02] text-[#F0E8D2]/20 line-through"
                        : selectedHour === slot.hour
                          ? "border-[#2D6A47] bg-[#2D6A47]/[0.15] text-[#F0E8D2]"
                          : "border-[#F0E8D2]/10 text-[#F0E8D2]/60 hover:border-[#F0E8D2]/20"
                    }`}
                  >
                    {slot.label}
                    {isBooked && <span className="block text-[10px] uppercase tracking-wider">Booked</span>}
                  </button>
                );
              })}
            </div>
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
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(801) 555-1234"
                  className="w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]"
                />
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
              Review & Pay
            </h2>
            <div className="mb-8 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Location</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    {locObj?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Address</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    {locObj?.address}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Date</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    {selectedDate && fmt(selectedDate)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Time</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    {slotObj?.label} – {slotObj?.endLabel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Duration</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    1 hour
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Name</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    {name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                  <span className="text-sm text-[#F0E8D2]/50">Email</span>
                  <span className="text-sm font-medium text-[#F0E8D2]">
                    {email}
                  </span>
                </div>
                {phone && (
                  <div className="flex justify-between border-b border-[#F0E8D2]/10 pb-3">
                    <span className="text-sm text-[#F0E8D2]/50">Phone</span>
                    <span className="text-sm font-medium text-[#F0E8D2]">
                      {phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-base font-semibold text-[#F0E8D2]">
                    Total
                  </span>
                  <span
                    className="text-2xl font-bold text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    $35.00
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      location: locObj?.name,
                      date: selectedDate ? fmt(selectedDate) : "",
                      time: slotObj ? `${slotObj.label} – ${slotObj.endLabel}` : "",
                      dateISO: selectedDate
                        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                        : "",
                      hour: selectedHour,
                      customerName: name,
                      customerEmail: email,
                      customerPhone: phone,
                      amount: 3500,
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
              }}
              className="w-full rounded bg-[#2D6A47] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50"
            >
              {loading ? "Redirecting to Stripe..." : "Pay with Stripe — $35.00"}
            </button>
            <p className="mt-3 text-center text-xs text-[#F0E8D2]/30">
              You&apos;ll be redirected to Stripe to complete your payment.
            </p>
          </div>
        )}

        {/* ── Navigation ── */}
        {step < 4 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={!canGoBack}
              className={`rounded border border-[#F0E8D2]/20 px-6 py-2.5 text-sm font-medium uppercase tracking-wider transition-colors ${
                canGoBack
                  ? "text-[#F0E8D2] hover:border-[#F0E8D2]/40"
                  : "cursor-not-allowed text-[#F0E8D2]/20"
              }`}
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
