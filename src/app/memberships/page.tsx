"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const rules = [
  "Membership is non-transferable — one membership per person.",
  "Member must be present during all sessions.",
  "Monthly hours reset on your billing date each month.",
  "Unused hours do not roll over.",
  "Punch passes expire 1 year from purchase date.",
  "Max 4 hours per booking.",
  "Valid at both Kaysville and Clearfield locations.",
  "Memberships can be cancelled anytime — access continues until end of billing period.",
];

const plans = [
  {
    id: "walkin",
    name: "Walk-In",
    price: "$35",
    period: "/hr",
    description: "No signup needed — just book a bay and play.",
    features: ["No commitment", "Book online or walk in", "Play any time 24/7"],
    details: [
      "Pay per session — no membership required",
      "Book online or just walk in during open hours",
      "24/7 self-serve access at both locations",
      "$35 per hour, up to 4 hours per booking",
    ],
    cta: "Book a Bay",
    href: "/book",
    stripe: false,
    highlight: false,
    border: "",
  },
  {
    id: "punchpass",
    name: "Punch Pass",
    price: "$299",
    period: " / 10 sessions",
    description: "Buy 10 sessions up front and save.",
    features: ["Save 15% vs. walk-in", "Expires after 1 year", "Transferable"],
    details: [
      "10 one-hour sessions for $299 ($29.90/session)",
      "Each hour booked deducts 1 session",
      "Multi-hour bookings deduct multiple sessions",
      "Expires 1 year from purchase date",
      "Sessions are transferable to another person",
    ],
    cta: "Buy Punch Pass",
    href: "",
    stripe: true,
    highlight: false,
    border: "",
  },
  {
    id: "monthly",
    name: "Monthly Member",
    price: "$179",
    period: "/mo",
    description: "20 hours per month with priority booking and member perks.",
    features: ["20 hours per month", "Priority access", "Member discounts"],
    details: [
      "20 hours of simulator time per month",
      "Hours reset on your billing date each month",
      "Unused hours do not roll over",
      "Priority booking access",
      "Member discounts on events and merchandise",
      "Cancel anytime — access continues through billing period",
    ],
    cta: "Join Monthly",
    href: "",
    stripe: true,
    highlight: true,
    border: "",
  },
  {
    id: "annual",
    name: "Annual Member",
    price: "$1,200",
    period: "/yr",
    description: "Best value — one payment, 20 hours per month all year.",
    features: ["20 hours per month", "Save vs. monthly", "One payment, full year"],
    details: [
      "20 hours of simulator time per month, all year",
      "One upfront payment of $1,200 ($100/mo equivalent)",
      "Save vs. paying monthly ($179/mo × 12 = $2,148)",
      "Hours reset on the same date each month",
      "Unused hours do not roll over",
      "All monthly member perks included",
    ],
    cta: "Go Annual",
    href: "",
    stripe: true,
    highlight: false,
    border: "gold",
  },
];

function MembershipsContent() {
  const searchParams = useSearchParams();
  const autoPlan = searchParams.get("plan");

  const [loading, setLoading] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);

  const goToStripe = useCallback(async (planId: string, custId: string, email: string, name: string | null, promo?: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          customerId: custId,
          customerEmail: email,
          promoCode: promo || undefined,
          customerName: name,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(null);
      }
    } catch {
      alert("Failed to start checkout");
      setLoading(null);
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const email = session.user.email || "";
      const name = session.user.user_metadata?.name || null;
      setCustomerEmail(email);
      setCustomerName(name);

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .single();

      if (customer) {
        setCustomerId(customer.id);

        // Auto-checkout if coming back from login/signup with a plan
        if (autoPlan && !autoCheckoutDone) {
          setAutoCheckoutDone(true);
          const validPlans = ["punchpass", "monthly", "annual"];
          if (validPlans.includes(autoPlan)) {
            goToStripe(autoPlan, customer.id, email, name);
          }
        }
      }
    }
    checkAuth();
  }, [autoPlan, autoCheckoutDone, goToStripe]);

  function openPlanModal(plan: typeof plans[0]) {
    setSelectedPlan(plan);
    setAgreedToRules(false);
  }

  async function handleCheckout() {
    if (!selectedPlan) return;

    if (!customerId || !customerEmail) {
      window.location.href = `/login?redirect=/memberships?plan=${selectedPlan.id}`;
      return;
    }

    goToStripe(selectedPlan.id, customerId, customerEmail, customerName, promoApplied?.code);
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
            Memberships & Pricing
          </p>
          <h1
            className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Play Your Way
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#F0E8D2]/50">
            Whether you&apos;re a regular or just dropping in, we&apos;ve got a plan that fits.
            All plans include 24/7 access to both locations.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-lg border p-8 transition-colors ${
                plan.highlight
                  ? "border-[#2D6A47] bg-[#2D6A47]/[0.06]"
                  : plan.border === "gold"
                    ? "border-[#F0E8D2] bg-[#F0E8D2]/[0.06]"
                    : "border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] hover:border-[#F0E8D2]/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#2D6A47] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F0E8D2]">
                  Most Popular
                </div>
              )}
              {plan.border === "gold" && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#F0E8D2] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#060A07]">
                  Best Deal
                </div>
              )}

              <h3
                className="mb-1 text-xl font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {plan.name}
              </h3>

              <div className="mb-2 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold text-[#F0E8D2]"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {plan.price}
                </span>
                <span className="text-sm text-[#F0E8D2]/40">{plan.period}</span>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-[#F0E8D2]/50">
                {plan.description}
              </p>

              <ul className="mb-8 flex flex-col gap-2.5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-[#F0E8D2]/70">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-[#2D6A47]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              {plan.stripe ? (
                <button
                  onClick={() => openPlanModal(plan)}
                  className={`mt-auto block rounded px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors ${
                    plan.highlight
                      ? "bg-[#2D6A47] text-[#F0E8D2] hover:bg-[#2D6A47]/90"
                      : plan.border === "gold"
                        ? "bg-[#F0E8D2] text-[#060A07] hover:bg-[#F0E8D2]/90"
                        : "border border-[#F0E8D2]/20 text-[#F0E8D2] hover:border-[#F0E8D2]/40"
                  }`}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className="mt-auto block rounded border border-[#F0E8D2]/20 px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:border-[#F0E8D2]/40"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ / Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#F0E8D2]/40">
            All memberships include 24/7 self-serve access at both Kaysville and Clearfield locations.
            <br />
            Questions? Email us at{" "}
            <a href="mailto:info@gimmegolfsimulators.com" className="text-[#2D6A47] hover:underline">
              info@gimmegolfsimulators.com
            </a>
          </p>
        </div>
      </div>

      {/* ── Plan Details & Checkout Modal ── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-[#F0E8D2]/10 bg-[#060A07] p-6 sm:p-8">
            {/* Close */}
            <button
              onClick={() => { setSelectedPlan(null); setLoading(null); }}
              className="absolute right-4 top-4 text-xl text-[#F0E8D2]/40 hover:text-[#F0E8D2]"
            >
              &times;
            </button>

            {/* Plan header */}
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8973A]">
              {selectedPlan.name}
            </p>
            <div className="mb-4 flex items-baseline gap-2">
              <span
                className="text-4xl font-bold text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {selectedPlan.price}
              </span>
              <span className="text-sm text-[#F0E8D2]/40">{selectedPlan.period}</span>
            </div>

            {/* Plan details */}
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2]/70">
                What You Get
              </h4>
              <ul className="flex flex-col gap-2">
                {selectedPlan.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#F0E8D2]/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Membership rules */}
            <div className="mb-6 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2]/70">
                Membership Rules
              </h4>
              <ol className="flex flex-col gap-2">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-[#F0E8D2]/50">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F0E8D2]/10 text-[9px] font-bold text-[#F0E8D2]/40">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </div>

            {/* Promo Code */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); setPromoApplied(null); }}
                  placeholder="e.g. WELCOME-A3X9"
                  className="flex-1 rounded border border-[#F0E8D2]/20 bg-[#060A07] px-3 py-2 text-sm text-[#F0E8D2] uppercase tracking-wider outline-none focus:border-[#2D6A47] placeholder-[#F0E8D2]/20"
                />
                <button
                  type="button"
                  disabled={!promoCode.trim() || promoChecking}
                  onClick={async () => {
                    setPromoChecking(true);
                    setPromoError("");
                    try {
                      const res = await fetch(`/api/promo/validate?code=${encodeURIComponent(promoCode.trim())}`);
                      const data = await res.json();
                      if (data.valid) {
                        setPromoApplied({ discount: data.discount, code: data.code });
                      } else {
                        setPromoError(data.error || "Invalid code");
                        setPromoApplied(null);
                      }
                    } catch {
                      setPromoError("Failed to validate");
                    }
                    setPromoChecking(false);
                  }}
                  className="rounded bg-[#F0E8D2]/10 px-4 py-2 text-xs font-semibold text-[#F0E8D2]/60 hover:bg-[#F0E8D2]/20 disabled:opacity-30"
                >
                  {promoChecking ? "..." : "Apply"}
                </button>
              </div>
              {promoError && <p className="mt-1 text-xs text-red-400">{promoError}</p>}
              {promoApplied && (
                <p className="mt-1 text-xs text-[#2D6A47]">
                  ✓ ${promoApplied.discount} discount applied!
                </p>
              )}
            </div>

            {/* Agreement checkbox */}
            <label className="mb-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-[#2D6A47]"
              />
              <span className="text-sm font-medium text-[#F0E8D2]/80">
                I have read and agree to the membership rules
              </span>
            </label>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={!agreedToRules || loading === selectedPlan.id}
              className="w-full rounded bg-[#2D6A47] px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading === selectedPlan.id
                ? "Redirecting to Stripe..."
                : promoApplied
                  ? `Checkout — $${(Number(selectedPlan.price.replace(/[^0-9.]/g, "")) - promoApplied.discount).toFixed(2)}`
                  : `Checkout — ${selectedPlan.price}${selectedPlan.period}`}
            </button>

            {!agreedToRules && (
              <p className="mt-2 text-center text-xs text-[#F0E8D2]/30">
                Check the box above to continue
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MembershipsPage() {
  return (
    <Suspense>
      <MembershipsContent />
    </Suspense>
  );
}
