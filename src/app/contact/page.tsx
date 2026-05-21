"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
            Get in Touch
          </p>
          <h1
            className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Contact Us
          </h1>
          <p className="mx-auto max-w-xl text-[#F0E8D2]/50">
            Questions about bookings, memberships, or custom builds? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Contact</h3>
              <div className="flex flex-col gap-2">
                <a href="tel:+18015133538" className="text-sm text-[#2D6A47] hover:underline">
                  (801) 513-3538
                </a>
                <a href="mailto:info@gimmegolfsimulators.com" className="text-sm text-[#2D6A47] hover:underline">
                  info@gimmegolfsimulators.com
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Locations</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-[#F0E8D2]/70">Kaysville</p>
                  <p className="text-sm text-[#F0E8D2]/50">140 N Main Street, Kaysville, UT 84037</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F0E8D2]/70">Clearfield</p>
                  <p className="text-sm text-[#F0E8D2]/50">293 State St, Clearfield, UT 84015</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Hours</h3>
              <p className="text-sm text-[#F0E8D2]/50">24/7 Self-Serve Access at both locations</p>
            </div>

            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/gimmegolf.simulators/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E8D2]/10 text-[#F0E8D2]/40 transition-colors hover:border-[#2D6A47]/40 hover:text-[#2D6A47]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/gimmegolfclub.co/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E8D2]/10 text-[#F0E8D2]/40 transition-colors hover:border-[#2D6A47]/40 hover:text-[#2D6A47]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="rounded-lg border border-[#2D6A47]/30 bg-[#2D6A47]/10 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2D6A47]/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7 text-[#2D6A47]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold uppercase text-[#F0E8D2]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Message Sent!
                </h3>
                <p className="text-sm text-[#F0E8D2]/50">
                  Thanks, {name}! We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
                )}

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
                  <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" className={inputClass} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">Message *</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="How can we help?" className={`${inputClass} resize-none`} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-[#2D6A47] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
