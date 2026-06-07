import Link from "next/link";

const features = [
  { title: "Homepage", desc: "Hero with simulator photo, location cards, home builds section, features grid, pricing cards, testimonials, about us" },
  { title: "Locations", desc: "Kaysville & Clearfield pages with real photos, Google Maps embed, 24/7 badge, What to Bring rules" },
  { title: "Book a Bay", desc: "5-step booking: location → date → duration & time → info → review & pay via Stripe" },
  { title: "Memberships", desc: "4 plans with rules modal, agreement checkbox, Stripe checkout. Monthly is recurring subscription" },
  { title: "Build", desc: "Premium installations page, Our Work photo gallery, consultation request form with Resend email" },
  { title: "FAQ", desc: "21 questions across 4 sections with accordion expand/collapse" },
  { title: "Contact", desc: "Contact form + info cards — email, phone, locations, social links. Saves to Messages inbox" },
  { title: "Shop", desc: "Coming Soon page with email signup for launch notifications" },
];

const emails = [
  "Booking confirmation — keybox code, YouTube video, What to Bring rules",
  "Booking cancellation — confirmation with details",
  "Membership welcome — both locations, keybox codes, YouTube videos, getting started checklist",
  "Quote sent — View Your Quote button with link",
  "Final 50% payment request — remaining balance with payment options",
  "New member welcome (admin-created) — Set Your Password link",
  "Renewal reminder — membership expiring soon",
  "Build inquiry received — branded email to admin",
  "Contact form received — branded email to admin",
  "Deposit received notification — email to admin when client pays",
];

const adminTools = [
  "Create Member — set up accounts, sends welcome email with password reset",
  "Comp a Session — free booking with confirmation email",
  "Block Time Slots — mark slots unavailable for customers",
  "Resend Confirmation Email — re-send for any booking",
  "Refund via Stripe — one-click refund on paid bookings",
  "Add/Remove Punch Pass Sessions",
  "Set/Change Membership — manually assign any type",
  "Update Keybox Codes — inline edit per location",
  "Revenue Dashboard — this month, last month, this year",
  "Member Expiry Alerts — 30-day warning with reminder email",
  "Export CSV — download all customers with name, email, phone, membership",
  "Delete Customer — full cleanup (auth, records, bookings, memberships)",
  "Customer Notes — inline notes per customer",
];

const todos = [
  { task: "Stripe live mode", desc: "Switch from sandbox to live keys in Vercel. Create live webhook endpoint." },
  { task: "Resend domain", desc: "Verify gimmegolfsimulators.com so emails send to real customers." },
  { task: "Custom domain", desc: "Connect gimmegolfsimulators.com in Vercel → Domains." },
  { task: "Migrate members", desc: "Use admin Create Member tool for existing Wix customers." },
  { task: "Terms & Privacy", desc: "Add legal pages for collecting payments and personal data." },
  { task: "Google Analytics", desc: "Add tracking for visitor insights." },
];

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="py-10 sm:py-14">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">{label}</p>
      <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-4xl" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5 transition-colors hover:border-[#F0E8D2]/20">
      <h4 className="mb-1 text-sm font-semibold text-[#F0E8D2]">{title}</h4>
      <p className="text-xs leading-relaxed text-[#F0E8D2]/50">{desc}</p>
    </div>
  );
}

function FlowStep({ steps }: { steps: string[] }) {
  return (
    <div className="my-4 flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="rounded bg-[#2D6A47]/15 border border-[#2D6A47]/30 px-3 py-1.5 text-xs font-medium text-[#F0E8D2]">{s}</span>
          {i < steps.length - 1 && <span className="text-[#F0E8D2]/20">→</span>}
        </div>
      ))}
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5 text-center">
      <p className="text-3xl font-bold text-[#2D6A47]" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{number}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#F0E8D2]/40">{label}</p>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <div className="mb-6 text-center">
          <img src="/logos/logo-trimmed.png" alt="Gimme Golf" className="mx-auto mb-6 h-12 w-auto" />
          <h1 className="mb-4 text-4xl font-bold uppercase tracking-tight text-[#F0E8D2] sm:text-5xl" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Platform Overview
          </h1>
          <p className="mx-auto max-w-2xl text-[#F0E8D2]/50">
            Everything we built — website, booking system, membership management, quote builder, job tracker, admin dashboard, automated emails, and Stripe payments.
          </p>
        </div>

        {/* TL;DR */}
        <div className="rounded-lg border border-[#C8973A]/20 bg-[#C8973A]/[0.04] p-6 text-center">
          <p className="text-sm leading-relaxed text-[#C8973A]">
            <strong>TL;DR:</strong> A complete business platform from scratch — replaces Wix, Jobber, and most manual processes. Booking, memberships, customer accounts, quoting with e-signatures, job tracking with expense management, and a full admin dashboard.
          </p>
        </div>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-[#2D6A47] to-transparent" />

        {/* Website Pages */}
        <Section label="The Website" title="Public Pages">
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => <Card key={f.title} title={f.title} desc={f.desc} />)}
          </div>
        </Section>

        {/* Booking */}
        <Section label="Bookings" title="Booking System">
          <FlowStep steps={["Pick Location", "Pick Date", "Duration (1-4 hrs)", "Pick Start Time", "Enter Info", "Pay via Stripe"]} />
          <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5">
            <ul className="flex flex-col gap-2">
              {[
                "Walk-in rate: $35/hr, 1-4 hour sessions",
                "Duration selector shows price, greys out unavailable slots",
                "Double-booking prevention — each hour individually tracked",
                "Members skip payment — confirm directly with active membership",
                "Smart login prompt: 'Already a member?' banner on booking page",
                "15-minute cancellation policy enforced server-side",
                "Confirmation email with keybox code, YouTube video, What to Bring",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#F0E8D2]/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Memberships */}
        <Section label="Memberships" title="Plans & Pricing">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat number="$35" label="Walk-In / hr" />
            <Stat number="$299" label="Punch Pass (10)" />
            <Stat number="$179" label="Monthly (20 hrs)" />
            <Stat number="$1,200" label="Annual (20 hrs)" />
            <Stat number="∞" label="Staff / Owner" />
          </div>
          <div className="mt-4 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5">
            <ul className="flex flex-col gap-2">
              {[
                "Monthly is a Stripe subscription — auto-renews, auto-deactivates on failed payment",
                "Punch Pass: 10 sessions, expires after 1 year, deducts per hour booked",
                "Monthly/Annual: 20 hours/month, resets on billing date, no rollover",
                "Staff/Owner: unlimited hours, no limits, no expiry",
                "Membership rules + agreement checkbox required before purchase",
                "Account page shows hours remaining as a progress bar",
                "Welcome email with both locations, keybox codes, YouTube videos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#F0E8D2]/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Emails */}
        <Section label="Automated" title="Emails (10+ Templates)">
          <p className="mb-4 text-sm text-[#F0E8D2]/50">All branded with the Gimme Golf logo, dark theme, and contact info. Sent via Resend.</p>
          <div className="grid gap-2">
            {emails.map((e) => (
              <div key={e} className="flex items-start gap-2 rounded border border-[#F0E8D2]/5 bg-[#F0E8D2]/[0.02] px-4 py-2.5">
                <span className="mt-0.5 text-[#C8973A]">✉</span>
                <span className="text-sm text-[#F0E8D2]/60">{e}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Payments */}
        <Section label="Payments" title="Stripe Integration">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card title="Walk-in Bookings" desc="One-time $35/hr via Stripe Checkout" />
            <Card title="Punch Pass & Annual" desc="One-time payments" />
            <Card title="Monthly Membership" desc="Recurring Stripe subscription ($179/mo)" />
            <Card title="Quote Deposits" desc="ACH (no fee) or Card (+3% fee shown before confirming)" />
            <Card title="Webhooks" desc="Auto-handles completed checkout, subscription renewal/failure/cancellation" />
            <Card title="Admin Refunds" desc="One-click refund button via Stripe API" />
          </div>
        </Section>

        {/* Quote Builder */}
        <Section label="Quoting" title="Quote Builder">
          <FlowStep steps={["Draft", "Send to Client", "Client Signs", "Deposit Paid", "Do the Work", "Request Final 50%", "Fully Paid"]} />
          <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5">
            <ul className="flex flex-col gap-2">
              {[
                "13 default line items pre-loaded — all editable and removable",
                "Quick-add presets for common add-ons (padding, turf, TV, projector, lighting)",
                "Auto-calculates subtotal, total, and 50% deposit",
                "Branded client quote page with full line items table",
                "Full legal Service & Payment Agreement with e-signature",
                "3 payment options: ACH (no fee), Card (+3%), Check/Zelle/Venmo",
                "Duplicate quote to save time on similar builds",
                "Internal notes (admin-only, not visible to client)",
                "Export signed document as HTML for legal records",
                "Auto-numbered starting from #0000017",
                "Request Final 50% email with pay online button",
                "Mark Deposit Paid / Mark Fully Paid tracking",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#F0E8D2]/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Job Tracker */}
        <Section label="Job Management" title="Job Tracker (Replaces Jobber)">
          <FlowStep steps={["Lead", "Quoted", "Scheduled", "In Progress", "Complete"]} />
          <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5">
            <ul className="flex flex-col gap-2">
              {[
                "Create from quote — one click, all client info pre-filled",
                "Schedule dates: planned start/end + actual start/end",
                "Expense tracking: description, category, vendor, amount, date, receipt URL",
                "Real-time profit margin: quoted amount vs. actual expenses ($ and %)",
                "Category badges: materials, labor, equipment, food, travel, other",
                "Activity log: automatic timeline of all actions",
                "Client + internal notes",
                "Replaces Google Sheets for expense tracking per job",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#F0E8D2]/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A47]"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Admin Dashboard */}
        <Section label="Operations" title="Admin Dashboard">
          <p className="mb-4 text-sm text-[#F0E8D2]/50">Password-protected at /admin. Hidden link in footer copyright text.</p>

          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#C8973A]">5 Tabs</h4>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Dashboard" desc="Stats, revenue, keybox manager, today/tomorrow bookings, expiring members, bookings & customers tables" />
            <Card title="Analytics" desc="14-day booking chart, busiest hours, location split, booking type breakdown, unique customers" />
            <Card title="Messages" desc="Inbox for contact form & build inquiries, unread badge, expand/collapse, mark read/delete" />
            <Card title="Jobs" desc="Pipeline overview, job cards with expenses and margin, create from quote" />
            <Card title="Quotes" desc="All quotes with status badges, click to edit/resend/duplicate" />
          </div>

          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#C8973A]">Admin Tools</h4>
          <div className="grid gap-1.5">
            {adminTools.map((tool) => (
              <div key={tool} className="flex items-start gap-2 rounded bg-[#F0E8D2]/[0.02] px-3 py-2">
                <span className="mt-0.5 text-xs text-[#2D6A47]">●</span>
                <span className="text-xs text-[#F0E8D2]/50">{tool}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Tech Stack */}
        <Section label="Technical" title="Tech Stack">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Frontend" desc="Next.js 14, TypeScript, Tailwind CSS, App Router" />
            <Card title="Database" desc="Supabase (PostgreSQL) with Row Level Security" />
            <Card title="Payments" desc="Stripe (Checkout, Subscriptions, Webhooks, Refunds)" />
            <Card title="Email" desc="Resend (10+ branded HTML templates)" />
            <Card title="Auth" desc="Supabase Auth (email/password, password reset)" />
            <Card title="Hosting" desc="Vercel (auto-deploy from GitHub on every push)" />
          </div>
        </Section>

        {/* To-Do */}
        <Section label="Launch" title="Before Going Live">
          <div className="flex flex-col gap-3">
            {todos.map((t) => (
              <div key={t.task} className="rounded-lg border border-[#C8973A]/15 bg-[#C8973A]/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg text-[#F0E8D2]/20">☐</span>
                  <div>
                    <p className="text-sm font-semibold text-[#F0E8D2]">{t.task}</p>
                    <p className="text-xs text-[#F0E8D2]/40">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="mb-4 h-px bg-gradient-to-r from-transparent via-[#2D6A47] to-transparent" />
          <p className="text-xs text-[#F0E8D2]/20">Gimme Golf — Built May 2026</p>
          <Link href="/" className="mt-2 inline-block text-xs text-[#2D6A47] hover:underline">← Back to Website</Link>
        </div>
      </div>
    </div>
  );
}
