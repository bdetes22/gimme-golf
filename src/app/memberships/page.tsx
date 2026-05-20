"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    id: "walkin",
    name: "Walk-In",
    price: "$35",
    period: "/hr",
    description: "No signup needed — just book a bay and play.",
    features: ["No commitment", "Book online or walk in", "Play any time 24/7"],
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
    description: "Buy 10 sessions up front and save. No expiration.",
    features: ["Save 15% vs. walk-in", "Never expires", "Transferable"],
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
    cta: "Go Annual",
    href: "",
    stripe: true,
    highlight: false,
    border: "gold",
  },
];

export default function MembershipsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setCustomerEmail(session.user.email || null);
      setCustomerName(session.user.user_metadata?.name || null);

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (customer) setCustomerId(customer.id);
    }
    checkAuth();
  }, []);

  async function handlePurchase(planId: string) {
    if (!customerId || !customerEmail) {
      window.location.href = "/login";
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          customerId,
          customerEmail,
          customerName,
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
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loading === plan.id || !agreedToRules}
                  className={`mt-auto block rounded px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlight
                      ? "bg-[#2D6A47] text-[#F0E8D2] hover:bg-[#2D6A47]/90"
                      : plan.border === "gold"
                        ? "bg-[#F0E8D2] text-[#060A07] hover:bg-[#F0E8D2]/90"
                        : "border border-[#F0E8D2]/20 text-[#F0E8D2] hover:border-[#F0E8D2]/40"
                  }`}
                >
                  {loading === plan.id ? "Redirecting..." : plan.cta}
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

        {/* Agree to Rules Checkbox */}
        <div className="mt-10 flex justify-center">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#F0E8D2]/30 bg-[#060A07] accent-[#2D6A47]"
            />
            <span className="text-sm text-[#F0E8D2]/60">
              I have read and agree to the{" "}
              <a href="#rules" className="text-[#2D6A47] underline">
                membership rules
              </a>
            </span>
          </label>
        </div>

        {/* Membership Rules */}
        <div id="rules" className="mt-16">
          <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-8">
            <h3
              className="mb-6 text-xl font-bold uppercase text-[#F0E8D2]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Membership Rules
            </h3>
            <ol className="flex flex-col gap-3">
              {[
                "Membership is non-transferable — one membership per person.",
                "Member must be present during all sessions.",
                "Monthly hours reset on your billing date each month.",
                "Unused hours do not roll over.",
                "Punch passes expire 1 year from purchase date.",
                "Max 2 hours per booking.",
                "Max 1 booking per day.",
                "Valid at both Kaysville and Clearfield locations.",
                "Memberships can be cancelled anytime — access continues until end of billing period.",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#F0E8D2]/60">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0E8D2]/10 text-[10px] font-bold text-[#F0E8D2]/40">
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>
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
    </div>
  );
}
