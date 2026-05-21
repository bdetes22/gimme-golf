import Link from "next/link";

export default function LocationsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Two Locations
            </p>
            <h1
              className="text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Find Us in Utah
            </h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* ── Kaysville ── */}
            <Link href="/locations/kaysville" className="group">
              <div
                className="relative overflow-hidden rounded-lg border border-[#F0E8D2]/10 p-6 sm:p-8 transition-all hover:border-[#2D6A47]/30"
                style={{ backgroundImage: "url('/images/kaysille/Kaysvillephoto1.JPG')", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#060A07]/80 via-[#060A07]/75 to-[#060A07]/90" />
                <div className="relative z-10">
                  <div className="absolute right-0 top-0 rounded-full border border-[#2D6A47] bg-[#2D6A47]/10 px-3 py-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A47]">24/7 Access</span>
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8973A]">From $35/hr</p>
                  <h2
                    className="mb-4 text-3xl font-bold uppercase text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    Kaysville
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-[#F0E8D2]/50">
                    Our flagship location featuring premium simulator bays, lounge seating, and a fully stocked pro shop.
                  </p>
                  <div className="mb-4 flex items-start gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    <span className="text-sm text-[#F0E8D2]/70">140 N Main Street, Kaysville, UT 84037</span>
                  </div>
                  <div className="mb-6 flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span className="text-sm font-medium text-[#F0E8D2]/70">24/7 Self-Serve Access</span>
                  </div>
                  <span className="inline-block rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors group-hover:bg-[#2D6A47]/90">
                    View Location
                  </span>
                </div>
              </div>
            </Link>

            {/* ── Clearfield ── */}
            <Link href="/locations/clearfield" className="group">
              <div
                className="relative overflow-hidden rounded-lg border border-[#F0E8D2]/10 p-6 sm:p-8 transition-all hover:border-[#2D6A47]/30"
                style={{ backgroundImage: "url('/images/Clearfield/clearfieldphoto1.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#060A07]/80 via-[#060A07]/75 to-[#060A07]/90" />
                <div className="relative z-10">
                  <div className="absolute right-0 top-0 rounded-full border border-[#2D6A47] bg-[#2D6A47]/10 px-3 py-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A47]">24/7 Access</span>
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8973A]">From $35/hr</p>
                  <h2
                    className="mb-4 text-3xl font-bold uppercase text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    Clearfield
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-[#F0E8D2]/50">
                    Our newest location with state-of-the-art simulators, event space, and a laid-back atmosphere.
                  </p>
                  <div className="mb-4 flex items-start gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    <span className="text-sm text-[#F0E8D2]/70">293 State St, Clearfield, UT 84015</span>
                  </div>
                  <div className="mb-6 flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span className="text-sm font-medium text-[#F0E8D2]/70">24/7 Self-Serve Access</span>
                  </div>
                  <span className="inline-block rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors group-hover:bg-[#2D6A47]/90">
                    View Location
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
