import Link from "next/link";

const locations = [
  {
    name: "Kaysville",
    href: "/locations/kaysville",
    address: "Kaysville, UT",
    description:
      "Our flagship location featuring premium simulator bays, lounge seating, and a fully stocked pro shop.",
  },
  {
    name: "Clearfield",
    href: "/locations/clearfield",
    address: "Clearfield, UT",
    description:
      "Our newest location with state-of-the-art simulators, event space, and a laid-back atmosphere.",
  },
];

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
    description: "Browse clubs, accessories, and simulator packages — online or in-store.",
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

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-20">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />
        {/* Subtle radial glow */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-accent/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-green-accent">
            Utah&apos;s Premier Golf Simulator Experience
          </p>
          <h1
            className="mb-6 text-5xl font-bold uppercase leading-[1.1] tracking-tight text-cream sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Play Golf
            <br />
            <span className="text-green-accent">Year Round</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-cream/60">
            Premium indoor golf simulators in Kaysville and Clearfield.
            Book a bay, host an event, or build your dream setup at home.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/book"
              className="rounded bg-green-accent px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-dark transition-colors hover:bg-green-accent/90"
            >
              Book a Bay
            </Link>
            <Link
              href="/build"
              className="rounded border border-cream/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:border-cream/40"
            >
              Build Your Own
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-dark to-transparent" />
      </section>

      {/* ── Locations ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              Two Locations
            </p>
            <h2
              className="text-4xl font-bold uppercase tracking-tight text-cream sm:text-5xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Find Us in Utah
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {locations.map((loc) => (
              <Link
                key={loc.name}
                href={loc.href}
                className="group relative overflow-hidden rounded-lg border border-cream/10 bg-cream/[0.03] p-8 transition-all hover:border-green-accent/30 hover:bg-cream/[0.06]"
              >
                <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-cream/10 text-cream/30 transition-colors group-hover:border-green-accent/40 group-hover:text-green-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  {loc.address}
                </p>
                <h3
                  className="mb-3 text-3xl font-bold uppercase text-cream"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {loc.name}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-cream/50">
                  {loc.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
              What We Offer
            </p>
            <h2
              className="text-4xl font-bold uppercase tracking-tight text-cream sm:text-5xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              The Gimme Golf Experience
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-cream/10 bg-cream/[0.03] p-7 transition-colors hover:border-cream/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-accent/10 text-green-accent">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-cream">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-cream/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Builder CTA ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-gradient-to-br from-green-accent/10 via-dark to-gold/5 px-8 py-16 text-center sm:px-16">
            {/* Decorative glow */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-green-accent/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />

            <div className="relative z-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
                Home Simulator Builds
              </p>
              <h2
                className="mb-4 text-4xl font-bold uppercase tracking-tight text-cream sm:text-5xl"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Build Your Dream Setup
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-cream/50">
                Use our interactive quote builder to configure a custom golf
                simulator for your home or business. Choose your launch monitor,
                screen, enclosure, and more.
              </p>
              <Link
                href="/build"
                className="inline-block rounded bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-dark transition-colors hover:bg-gold/90"
              >
                Start Your Build
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
