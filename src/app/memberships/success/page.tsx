import Link from "next/link";

export default function MembershipSuccessPage() {
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
          Welcome to the Club!
        </h1>
        <p className="mb-8 text-lg leading-relaxed text-[#F0E8D2]/50">
          Your membership is now active. Check your email for a confirmation
          with your membership details.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/book"
            className="rounded bg-[#2D6A47] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
          >
            Book a Session
          </Link>
          <Link
            href="/account"
            className="rounded border border-[#F0E8D2]/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:border-[#F0E8D2]/40"
          >
            My Account
          </Link>
        </div>
      </div>
    </div>
  );
}
