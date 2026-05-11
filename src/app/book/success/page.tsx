import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 pt-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2D6A47]/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-[#2D6A47]">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1
          className="mb-4 text-4xl font-bold uppercase text-[#F0E8D2]"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Booking Confirmed
        </h1>
        <p className="mb-8 text-lg leading-relaxed text-[#F0E8D2]/50">
          You&apos;re all set! Check your email for a confirmation with your
          booking details and access instructions.
        </p>
        <Link
          href="/"
          className="inline-block rounded bg-[#2D6A47] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
