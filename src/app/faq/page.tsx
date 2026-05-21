"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  faqs: FAQ[];
}

const sections: FAQSection[] = [
  {
    title: "Booking & Access",
    faqs: [
      {
        question: "How do I book a session?",
        answer: "Head to our Book page, pick your location, choose a date and time, select your duration (1–4 hours), and pay online. You'll get a confirmation email with your access code and everything you need to get in and play.",
      },
      {
        question: "How does the self-serve access work?",
        answer: "Both of our locations are 24/7 self-serve. After booking, you'll receive a keybox code in your confirmation email. Use that code to access the key at the front door, let yourself in, power on the simulator, and play. When you're done, lock up and return the key to the keybox. It's that simple.",
      },
      {
        question: "What is the keybox code and where do I find it?",
        answer: "The keybox code is a numeric code that unlocks the lockbox on the front door where the building key is stored. You'll receive it in your booking confirmation email. Members also get it in their welcome email. If you can't find it, text us at (801) 513-3538 and we'll send it right over.",
      },
      {
        question: "Can I book same day?",
        answer: "Absolutely! As long as the time slot is available, you can book and play within minutes. Our system is fully automated — book online, get your code, and walk in.",
      },
      {
        question: "What is your cancellation policy?",
        answer: "You can cancel any upcoming booking from your account page. We understand plans change — just try to cancel with at least a few hours notice so other golfers can grab the slot.",
      },
      {
        question: "Can I extend my session while I'm there?",
        answer: "If the time slot after yours is open, you can book it on your phone right from the bay. Just pull up the booking page and add another hour. No need to leave and come back.",
      },
      {
        question: "What happens if I'm late to my session?",
        answer: "Your booking holds the bay for your full reserved time, but it doesn't extend if you arrive late. If you booked 2–3 PM and arrive at 2:30, you'll still need to wrap up by 3 PM if someone else has the next slot.",
      },
    ],
  },
  {
    title: "Pricing & Memberships",
    faqs: [
      {
        question: "What's the difference between a punch pass and a membership?",
        answer: "A punch pass gives you 10 one-hour sessions for $299 (about $29.90/session) that you use at your own pace — they expire after 1 year. A monthly membership ($179/mo) or annual membership ($1,200/yr) gives you 20 hours per month with priority booking and member discounts. Members save more if they play regularly.",
      },
      {
        question: "Do membership hours roll over?",
        answer: "No, unused hours do not roll over to the next month. Your 20 hours reset on your billing date each month. We encourage you to use them all — that's what they're there for!",
      },
      {
        question: "Can I share my membership with someone else?",
        answer: "Memberships are non-transferable — one membership per person, and the member must be present during all sessions. However, punch pass sessions are transferable, so you can share those with friends or family.",
      },
      {
        question: "Can I use my membership at both locations?",
        answer: "Yes! Your membership is valid at both our Kaysville and Clearfield locations. Book a bay at whichever one is most convenient for you.",
      },
      {
        question: "How do I cancel my membership?",
        answer: "You can cancel anytime by contacting us at info@gimmegolfsimulators.com or texting (801) 513-3538. Your access continues through the end of your current billing period.",
      },
      {
        question: "Can I pause my membership?",
        answer: "We don't currently offer a formal pause option, but reach out to us and we'll work with you. Text us at (801) 513-3538 — we're flexible and want to make it work for you.",
      },
    ],
  },
  {
    title: "At the Simulator",
    faqs: [
      {
        question: "What should I bring?",
        answer: "Bring your own golf clubs — we do not provide clubs. Wear comfortable shoes (golf shoes or sneakers — no hard soles on the turf). We provide the hitting mat, balls, and tees. Please use our provided balls, or if you bring your own, make sure they're clean. Clean your clubfaces before hitting to protect the impact screen. Please note that balls are property of Gimme Golf and missing balls will be charged to your account.",
      },
      {
        question: "Do you provide clubs?",
        answer: "We don't currently have rental clubs available, so please bring your own. If you're coming with a group and someone doesn't have clubs, they're welcome to share with others in the bay.",
      },
      {
        question: "How many people can play at once?",
        answer: "Each bay comfortably fits up to 6 people. It's great for groups — you can take turns hitting while everyone else watches on the big screen. Perfect for a round with friends, a date night, or a small event.",
      },
      {
        question: "What simulator software do you use?",
        answer: "Our bays run GSPro, which gives you access to 200+ world-class courses including Pebble Beach, St Andrews, Augusta-inspired layouts, and more. You can play full rounds, driving range, closest-to-the-pin challenges, and other game modes.",
      },
    ],
  },
  {
    title: "Simulator Builds",
    faqs: [
      {
        question: "What does a simulator installation cost?",
        answer: "Simulator installations vary widely depending on the setup. We do everything from budget-friendly builds starting around $5,000 to premium installations at $20,000+. The price depends on your launch monitor, room size, screen and enclosure, and any custom work. We also offer maintenance, repairs, and upgrades on existing setups. Schedule a free consultation and we'll put together a quote that fits your budget.",
      },
      {
        question: "How long does an installation take?",
        answer: "Most residential installations are completed in 1–3 days depending on complexity. The full process from consultation to playing your first round is typically 4–8 weeks, which includes design, equipment sourcing, and scheduling the install.",
      },
      {
        question: "What launch monitors do you work with?",
        answer: "We work with any launch monitor of your choosing, but our favorites are ProTee VX, Uneekor (QED, EYE XO2), and Trackman. We also work with Foresight, Garmin, and others. We'll help you choose the right one for your space, goals, and budget during your free consultation.",
      },
      {
        question: "Do you offer financing?",
        answer: "Yes, we have financing options available for simulator builds. We'll discuss payment plans during your consultation so you can get your dream setup without a huge upfront cost. Reach out to us at info@gimmegolfsimulators.com or text (801) 513-3538 to learn more.",
      },
    ],
  },
];

function Accordion({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#F0E8D2]/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-sm font-medium text-[#F0E8D2] sm:text-base">
          {faq.question}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`h-5 w-5 shrink-0 text-[#F0E8D2]/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm leading-relaxed text-[#F0E8D2]/50">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
            Help Center
          </p>
          <h1
            className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-[#F0E8D2]/50">
            Everything you need to know about Gimme Golf. Can&apos;t find what you&apos;re
            looking for? Text us at{" "}
            <a href="sms:+18015133538" className="text-[#2D6A47] hover:underline">
              (801) 513-3538
            </a>
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2
                className="mb-4 text-xl font-bold uppercase tracking-wider text-[#F0E8D2]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {section.title}
              </h2>
              <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] px-6">
                {section.faqs.map((faq) => (
                  <Accordion key={faq.question} faq={faq} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-[#F0E8D2]/40">
            Still have questions? We&apos;re happy to help.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="sms:+18015133538"
              className="rounded bg-[#2D6A47] px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
            >
              Text Us
            </a>
            <Link
              href="/contact"
              className="rounded border border-[#F0E8D2]/20 px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:border-[#F0E8D2]/40"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
