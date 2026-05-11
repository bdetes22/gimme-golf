"use client";

import Link from "next/link";

const features = [
  {
    title: "Premium Simulators",
    description:
      "Top-tier launch monitors and software with 200+ world-class courses.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    ),
  },
  {
    title: "Hourly Rentals",
    description: "Book a bay by the hour — perfect for practice, lessons, or a round with friends.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Events & Parties",
    description: "Host your next corporate outing, birthday party, or league night with us.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "Home Installations",
    description: "We design and install custom golf simulator setups for your home or business.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: "Pro Shop",
    description: "Merch, accessories, and simulator packages — coming soon.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    title: "Year-Round Play",
    description: "Rain, snow, or shine — play your favorite courses any day of the year.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
];

const pricingOptions = [
  {
    name: "Walk-In",
    price: "$35",
    period: "/hr",
    features: ["No commitment", "Book online or walk in", "Play any time 24/7"],
    cta: "Book a Bay",
    href: "/book",
    highlight: false,
    border: "",
  },
  {
    name: "Punch Pass",
    price: "$299",
    period: " / 10 sessions",
    features: ["Save 15% vs. walk-in", "Never expires", "Transferable"],
    cta: "Buy a Pass",
    href: "/book",
    highlight: false,
    border: "",
  },
  {
    name: "Monthly Member",
    price: "$199",
    period: "/mo",
    features: ["Unlimited bookings", "Priority access", "Member discounts"],
    cta: "Join Now",
    href: "/book",
    highlight: true,
    border: "",
  },
  {
    name: "Annual Member",
    price: "$1,200",
    period: "/yr",
    features: ["Best value", "Save $1,188 vs. monthly", "One payment, full year"],
    cta: "Go Annual",
    href: "/book",
    highlight: false,
    border: "gold",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060A07] via-[#060A07]/95 to-[#060A07]" />
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D6A47]/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#2D6A47]">
            Utah&apos;s Premier Golf Simulator Experience
          </p>
          <h1
            className="mb-6 text-5xl font-bold uppercase leading-[1.1] tracking-tight text-[#F0E8D2] sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Play Golf
            <br />
            <span className="text-[#2D6A47]">Year Round</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#F0E8D2]/60">
            Premium indoor golf simulators in Kaysville and Clearfield.
            Book a bay, host an event, or build your dream setup at home.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/book"
              className="rounded bg-[#2D6A47] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
            >
              Book a Bay
            </Link>
            <Link
              href="/build"
              className="rounded border border-[#F0E8D2]/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:border-[#F0E8D2]/40"
            >
              Get a Quote
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[#060A07] to-transparent" />
      </section>

      {/* ── Locations ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Two Locations
            </p>
            <h2
              className="text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Find Us in Utah
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* ── Kaysville ── */}
            <div className="group relative overflow-hidden rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-8 transition-all hover:border-[#2D6A47]/30 hover:bg-[#F0E8D2]/[0.06]">
              {/* 24/7 Badge */}
              <div className="absolute right-6 top-6 rounded-full border border-[#2D6A47] bg-[#2D6A47]/10 px-3 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A47]">24/7 Access</span>
              </div>

              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8973A]">
                From $35/hr
              </p>
              <h3
                className="mb-4 text-3xl font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Kaysville
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-[#F0E8D2]/50">
                Our flagship location featuring premium simulator bays, lounge seating, and a fully stocked pro shop.
              </p>

              {/* Address */}
              <div className="mb-4 flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="text-sm text-[#F0E8D2]/70">140 Main Street, Kaysville, UT 84037</span>
              </div>

              {/* Hours */}
              <div className="mb-6 flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-[#2D6A47]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-sm font-medium text-[#F0E8D2]/70">24/7 Self-Serve Access</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/book"
                  className="rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
                >
                  Book Now
                </Link>
                <a
                  href="https://maps.google.com/?q=140+Main+Street+Kaysville+UT+84037"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#F0E8D2]/50 transition-colors hover:text-[#2D6A47]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Directions
                </a>
              </div>
            </div>

            {/* ── Clearfield ── */}
            <div className="group relative overflow-hidden rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-8 transition-all hover:border-[#2D6A47]/30 hover:bg-[#F0E8D2]/[0.06]">
              {/* 24/7 Badge */}
              <div className="absolute right-6 top-6 rounded-full border border-[#2D6A47] bg-[#2D6A47]/10 px-3 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A47]">24/7 Access</span>
              </div>

              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8973A]">
                From $35/hr
              </p>
              <h3
                className="mb-4 text-3xl font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Clearfield
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-[#F0E8D2]/50">
                Our newest location with state-of-the-art simulators, event space, and a laid-back atmosphere.
              </p>

              {/* Address */}
              <div className="mb-4 flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="text-sm text-[#F0E8D2]/70">293 State St, Clearfield, UT 84015</span>
              </div>

              {/* Hours */}
              <div className="mb-6 flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-[#2D6A47]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-sm font-medium text-[#F0E8D2]/70">24/7 Self-Serve Access</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/book"
                  className="rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
                >
                  Book Now
                </Link>
                <a
                  href="https://maps.google.com/?q=293+State+St+Clearfield+UT+84015"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#F0E8D2]/50 transition-colors hover:text-[#2D6A47]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              What We Offer
            </p>
            <h2
              className="text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              The Gimme Golf Experience
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-7 transition-colors hover:border-[#F0E8D2]/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#2D6A47]/10 text-[#2D6A47]">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#F0E8D2]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#F0E8D2]/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pro Shop Coming Soon ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
            Coming Soon
          </p>
          <h2
            className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            The Pro Shop
          </h2>
          <p className="mx-auto mb-8 text-lg leading-relaxed text-[#F0E8D2]/50">
            Merch, accessories, and more — coming soon.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]"
            />
            <button
              type="submit"
              className="rounded bg-[#2D6A47] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
            >
              Notify Me
            </button>
          </form>
        </div>
      </section>

      {/* ── Membership / Pricing ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Pricing Options
            </p>
            <h2
              className="text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Play Your Way
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#F0E8D2]/50">
              Whether you&apos;re a regular or just dropping in, we&apos;ve got a plan that fits.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingOptions.map((option) => (
              <div
                key={option.name}
                className={`relative flex flex-col rounded-lg border p-8 transition-colors ${
                  option.highlight
                    ? "border-[#2D6A47] bg-[#2D6A47]/[0.06]"
                    : option.border === "gold"
                      ? "border-[#F0E8D2] bg-[#F0E8D2]/[0.06]"
                      : "border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] hover:border-[#F0E8D2]/20"
                }`}
              >
                {option.highlight && (
                  <div className="absolute -top-3 left-6 rounded-full bg-[#2D6A47] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F0E8D2]">
                    Most Popular
                  </div>
                )}
                {option.border === "gold" && (
                  <div className="absolute -top-3 left-6 rounded-full bg-[#F0E8D2] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#060A07]">
                    Best Deal
                  </div>
                )}

                <h3
                  className="mb-1 text-xl font-bold uppercase text-[#F0E8D2]"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {option.name}
                </h3>

                <div className="mb-6 flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {option.price}
                  </span>
                  <span className="text-sm text-[#F0E8D2]/40">{option.period}</span>
                </div>

                <ul className="mb-8 flex flex-col gap-2.5">
                  {option.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#F0E8D2]/70">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-[#2D6A47]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={option.href}
                  className={`mt-auto block rounded px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors ${
                    option.highlight
                      ? "bg-[#2D6A47] text-[#F0E8D2] hover:bg-[#2D6A47]/90"
                      : "border border-[#F0E8D2]/20 text-[#F0E8D2] hover:border-[#F0E8D2]/40"
                  }`}
                >
                  {option.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Builder CTA ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#F0E8D2]/10 bg-gradient-to-br from-[#2D6A47]/10 via-[#060A07] to-[#C8973A]/5 px-8 py-16 text-center sm:px-16">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#2D6A47]/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#C8973A]/10 blur-3xl" />

            <div className="relative z-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
                Home Simulator Builds
              </p>
              <h2
                className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                We Build Your Dream Setup
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-[#F0E8D2]/50">
                We handle everything — from room design and equipment selection
                to full installation. Schedule a free consultation and
                we&apos;ll build you a custom quote.
              </p>
              <Link
                href="/build"
                className="inline-block rounded bg-[#C8973A] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#060A07] transition-colors hover:bg-[#C8973A]/90"
              >
                Schedule a Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
