"use client";

export default function ShopPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 pt-20">
      <div className="max-w-md text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
          Coming Soon
        </p>
        <h1
          className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          The Pro Shop
        </h1>
        <p className="mb-8 text-lg leading-relaxed text-[#F0E8D2]/50">
          Merch, accessories, and more — coming soon.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3 sm:flex-row"
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
    </div>
  );
}
