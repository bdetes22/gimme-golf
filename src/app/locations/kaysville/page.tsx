import Image from "next/image";
import Link from "next/link";

export default function KaysvillePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-20"
        style={{ backgroundImage: "url('/images/kaysille/Kaysvillephoto1.JPG')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#060A07]/70 via-[#060A07]/60 to-[#060A07]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-flex rounded-full border border-[#2D6A47] bg-[#2D6A47]/10 px-4 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A47]">24/7 Access</span>
          </div>
          <h1
            className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Kaysville
          </h1>
          <p className="mb-6 text-lg text-[#F0E8D2]/70">140 N Main Street, Kaysville, UT 84037</p>
          <Link
            href="/book"
            className="inline-block rounded bg-[#2D6A47] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* ── Info ── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-8">
              <h3
                className="mb-4 text-xl font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Hours
              </h3>
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span className="text-[#F0E8D2]/70">24/7 Self-Serve Access</span>
              </div>
            </div>
            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-8">
              <h3
                className="mb-4 text-xl font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Address
              </h3>
              <div className="flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                <div>
                  <p className="text-[#F0E8D2]/70">140 N Main Street, Kaysville, UT 84037</p>
                  <a
                    href="https://maps.google.com/?q=140+N+Main+Street+Kaysville+UT+84037"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#2D6A47] transition-colors hover:text-[#2D6A47]/80"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-[#C8973A]/20 bg-[#C8973A]/[0.04] p-6">
            <h3
              className="mb-2 text-lg font-bold uppercase text-[#C8973A]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              What to Bring
            </h3>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[#F0E8D2]/60">
              <li>Bring your own golf clubs — we do not provide clubs.</li>
              <li>Wear comfortable shoes (golf shoes or sneakers — no hard soles).</li>
              <li>Please use the balls we provide. If you use your own, make sure they&apos;re clean.</li>
              <li>Clean your clubs before hitting — dirty clubfaces can damage the screen.</li>
              <li>Balls are property of Gimme Golf — missing balls will be charged to your account.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="mb-8 text-center text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Our Space
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/kaysille/Kaysvillephoto1.JPG"
                alt="Kaysville location photo 1"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/kaysille/kaysvillephoto2.JPG"
                alt="Kaysville location photo 2"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Find Us ── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2
            className="mb-8 text-center text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Find Us
          </h2>
          <div className="aspect-video overflow-hidden rounded-lg border border-[#F0E8D2]/10">
            <iframe
              src="https://maps.google.com/maps?q=140+N+Main+Street+Kaysville+UT+84037&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Kaysville location map"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="mb-4 text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Ready to Play?
          </h2>
          <p className="mb-8 text-lg text-[#F0E8D2]/50">
            Book a bay at our Kaysville location and experience premium golf simulation 24/7.
          </p>
          <Link
            href="/book"
            className="inline-block rounded bg-[#2D6A47] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}
