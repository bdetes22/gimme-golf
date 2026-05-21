"use client";

import { useState } from "react";
import Image from "next/image";

const buildPhotos = [
  { src: "/images/builds/jeffbuild.jpeg", alt: "Custom installation by Jeff" },
  { src: "/images/builds/spencerbuild.JPG", alt: "Custom installation by Spencer" },
  { src: "/images/builds/jasonbuild.JPG", alt: "Custom installation by Jason" },
];

const includes = [
  {
    title: "Professional Launch Monitors",
    description: "We work with the best in the industry — Uneekor, Trackman, Foresight, and ProTee VX. We'll match the right system to your space and goals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    ),
  },
  {
    title: "Commercial-Grade Screens",
    description: "Commercial-grade impact screens with custom-built enclosures designed and fitted to your exact room dimensions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z" />
      </svg>
    ),
  },
  {
    title: "Wall Padding & Premium Turf",
    description: "Professional-grade safety padding for walls and ceiling, plus tour-quality hitting turf for the most realistic feel.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Software Setup",
    description: "Full software installation and configuration — GSPro, E6, TGC, or whatever platform you prefer.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: "Professional Installation & Calibration",
    description: "Our team handles all mounting, wiring, calibration, and testing. Walk in and play — completely turnkey.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
      </svg>
    ),
  },
];

const budgetOptions = ["$10,000 – $20,000", "$20,000 – $30,000", "$30,000 – $50,000", "$50,000+"];
const timelineOptions = ["ASAP", "1–3 months", "3–6 months", "Just exploring"];

export default function BuildPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/build-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, width, length, height, budget, timeline, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded border border-[#F0E8D2]/20 bg-[#F0E8D2]/[0.05] px-4 py-3 text-sm text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]";
  const selectClass = "w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-4 py-3 text-sm text-[#F0E8D2] outline-none transition-colors focus:border-[#2D6A47] appearance-none";

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* ── Hero ── */}
      <section className="relative py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
            Premium Simulator Installations
          </p>
          <h1
            className="mb-6 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            World-Class
            <br />
            <span className="text-[#2D6A47]">Simulator Rooms</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#F0E8D2]/60">
            Professional golf simulator installations starting at $20,000.
            We design and build world-class simulator rooms for serious golfers
            and commercial spaces.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#F0E8D2]/35">
            We specialize in premium builds only — if you&apos;re looking for a budget
            setup, we recommend checking out Carl&apos;s Place or Rain or Shine Golf
            for DIY options.
          </p>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Premium Components & Full-Service Installation
            </p>
            <h2
              className="text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              What&apos;s Included
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {includes.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-7 transition-colors hover:border-[#F0E8D2]/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#2D6A47]/10 text-[#2D6A47]">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#F0E8D2]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#F0E8D2]/50">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Work Gallery ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Recent Projects
            </p>
            <h2
              className="text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Our Work
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {buildPhotos.map((photo) => (
              <div
                key={photo.src}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#060A07]/0 transition-colors duration-300 group-hover:bg-[#060A07]/50" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span
                    className="text-lg font-bold uppercase tracking-wider text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    Custom Installation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted Partners ── */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#F0E8D2]/30">
            Trusted Launch Monitor Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {["Uneekor", "Trackman", "Foresight", "ProTee VX"].map((brand) => (
              <span
                key={brand}
                className="text-lg font-bold uppercase tracking-wider text-[#F0E8D2]/20"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultation Form ── */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Get Started
            </p>
            <h2
              className="mb-4 text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Schedule a Free Consultation
            </h2>
            <p className="text-[#F0E8D2]/50">
              Tell us about your space and we&apos;ll put together a custom quote.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg border border-[#2D6A47]/30 bg-[#2D6A47]/10 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2D6A47]/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7 text-[#2D6A47]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3
                className="mb-2 text-2xl font-bold uppercase text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Inquiry Sent!
              </h3>
              <p className="text-sm text-[#F0E8D2]/50">
                Thanks, {name}! We&apos;ll review your details and get back to you
                within 24 hours to schedule your free consultation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Contact Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(801) 555-1234" className={inputClass} />
              </div>

              {/* Room Dimensions */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Room Dimensions (feet)</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width" className={inputClass} />
                  <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="Length" className={inputClass} />
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ceiling" className={inputClass} />
                </div>
                <p className="mt-1 text-xs text-[#F0E8D2]/30">Don&apos;t know exact dimensions? No problem — we&apos;ll measure during the consultation.</p>
              </div>

              {/* Budget & Timeline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Budget Range</label>
                  <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectClass}>
                    <option value="">Select budget</option>
                    {budgetOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Timeline</label>
                  <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={selectClass}>
                    <option value="">Select timeline</option>
                    {timelineOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your space, what you're looking for, or any questions..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[#C8973A] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#060A07] transition-colors hover:bg-[#C8973A]/90 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Request a Free Consultation"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
