// MIGRATION: Run this SQL in Supabase to add the internal_notes column:
// ALTER TABLE quotes ADD COLUMN IF NOT EXISTS internal_notes text;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
}

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_address: string;
  client_phone: string;
  client_email: string;
  quote_date: string;
  line_items: LineItem[];
  subtotal: number;
  total: number;
  deposit_amount: number;
  notes: string;
  internal_notes: string | null;
  status: string;
  signature_name: string | null;
  signed_at: string | null;
  sent_at: string | null;
  created_at: string;
  payment_method: string | null;
  paid_at: string | null;
}

const LINE_ITEM_PRESETS: LineItem[] = [
  { description: "Extra padding package", qty: 1, unit_price: 800 },
  { description: "Premium turf upgrade", qty: 1, unit_price: 500 },
  { description: "Additional TV/Monitor", qty: 1, unit_price: 689 },
  { description: "Projector upgrade", qty: 1, unit_price: 1200 },
  { description: "Custom lighting", qty: 1, unit_price: 350 },
];

const SERVICE_AGREEMENT = `SERVICE & PAYMENT AGREEMENT

Deters Birrell Golf LLC Service & Payment Agreement

This agreement is entered into by and between Deters Birrell Golf LLC, hereinafter referred to as the "Contractor", and the Client, hereinafter referred to as the "Client", effective as of the date of signing.

Services
The Contractor agrees to provide the agreed upon services to the Client as outlined in the agreed-upon proposal or quote.

Warranty
Contractor provides a one-year warranty on the installation services performed, effective from the date of Project completion. This warranty covers defects in workmanship directly related to the installation of the golf simulator system, including turf, enclosures, screens, mounts, and related components.

This warranty does not cover the performance, durability, or longevity of materials provided by the manufacturer, or damage resulting from normal wear and tear, misuse, accidents, human error, neglect, natural disasters, or any other conditions beyond the control of Contractor.

Any warranty claims for hardware, electronics, or software must be handled directly with the manufacturer. Contractor will assist with reasonable documentation but is not responsible for manufacturer delays or decisions.

Client is responsible for maintaining proper temperature, humidity, and environment suitable for electronics. Damage from improper environment is not covered under warranty.

Once Contractor has completed the Project and left the job site, Contractor shall not be liable for any damage or issues arising from factors not directly caused by the installation services performed by Deters Birrell Golf LLC.

Client Responsibilities
Client agrees to ensure that the job site is fully prepared, accessible, and suitable for installation of the golf simulator system.

Payment
Client agrees to pay Contractor the total agreed-upon amount for the services rendered. Payment terms shall be governed by the proposal or estimate provided by Contractor. Residential Clients are required to pay a 50% deposit before any work or materials procurement begins. The remaining balance is due within fourteen (14) days of Project completion.

Governing Law
This Agreement shall be governed by and construed in accordance with the laws of the State of Utah.

Entire Agreement
This Agreement, together with all attachments, exhibits, supplements, or documents referenced herein, constitutes the entire agreement between the parties.`;

export default function EditQuotePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteDate, setQuoteDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      setPassword(stored);
      setAuthenticated(true);
      fetchQuote(stored);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuote = async (pw: string) => {
    setLoading(true);
    try {
      // Verify password first
      const authRes = await fetch(
        `/api/quotes?password=${encodeURIComponent(pw)}`
      );
      if (authRes.status === 401) {
        setError("Invalid password");
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/quotes/${id}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setQuote(data);
      setClientName(data.client_name || "");
      setClientAddress(data.client_address || "");
      setClientPhone(data.client_phone || "");
      setClientEmail(data.client_email || "");
      setQuoteDate(data.quote_date || "");
      setLineItems(data.line_items || []);
      setNotes(data.notes || "");
      setInternalNotes(data.internal_notes || "");
      setAuthenticated(true);
    } catch {
      setError("Failed to load quote");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("admin_pw", password);
    await fetchQuote(password);
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.unit_price,
    0
  );
  const total = subtotal;
  const deposit = total * 0.5;

  const updateItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", qty: 1, unit_price: 0 },
    ]);
  };

  const handleSave = async (sendToClient: boolean) => {
    if (!clientName || !clientEmail) {
      setError("Client name and email are required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id,
          client_name: clientName,
          client_address: clientAddress,
          client_phone: clientPhone,
          client_email: clientEmail,
          quote_date: quoteDate,
          line_items: lineItems,
          subtotal,
          total,
          deposit_amount: deposit,
          notes,
          internal_notes: internalNotes,
        }),
      });

      if (res.status === 401) {
        setError("Invalid admin password");
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setSaving(false);
        return;
      }

      if (sendToClient) {
        await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password,
            action: "send",
            id,
          }),
        });
      }

      await fetchQuote(password);
      if (!sendToClient) {
        setError("");
      }
    } catch {
      setError("Failed to save quote");
    }
    setSaving(false);
  };

  const handleMarkPaid = async (paymentType: string) => {
    const label = paymentType === "deposit" ? "50% deposit" : "final balance (fully paid)";
    if (!confirm(`Mark ${label} as received?`)) return;
    setSaving(true);
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id,
          status: paymentType === "final" ? "paid" : "deposit-paid",
          payment_method: paymentType === "deposit"
            ? "deposit-manual"
            : "paid-manual",
        }),
      });
      await fetchQuote(password);
    } catch {
      setError("Failed to update");
    }
    setSaving(false);
  };

  const handleRequestFinalPayment = async () => {
    if (!quote?.client_email) {
      alert("No client email on this quote");
      return;
    }
    if (!confirm(`Send final payment request to ${quote.client_email}?`)) return;
    setSaving(true);
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          action: "request_final",
          id,
        }),
      });
      alert("Final payment request sent!");
    } catch {
      setError("Failed to send");
    }
    setSaving(false);
  };

  const handleDuplicate = async () => {
    if (!confirm("Duplicate this quote? A new draft quote will be created with the same line items and client info.")) return;
    setDuplicating(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          client_name: clientName,
          client_address: clientAddress,
          client_phone: clientPhone,
          client_email: clientEmail,
          quote_date: new Date().toISOString().split("T")[0],
          line_items: lineItems,
          subtotal,
          total,
          deposit_amount: deposit,
          notes,
          internal_notes: internalNotes,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.id) {
        router.push(`/admin/quotes/${data.id}`);
      }
    } catch {
      setError("Failed to duplicate quote");
    }
    setDuplicating(false);
  };

  const handleExportSigned = () => {
    if (!quote || !quote.signature_name) return;
    const items = (quote.line_items || []) as LineItem[];
    const itemRows = items
      .map(
        (item, i) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;">${i + 1}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">${item.description}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.qty}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${(item.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${(item.qty * item.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          </tr>`
      )
      .join("");

    const signedDate = quote.signed_at
      ? new Date(quote.signed_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

    const quoteFormattedDate = quote.quote_date
      ? new Date(quote.quote_date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Signed Agreement - Quote #${quote.quote_number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #222; }
    h1 { color: #2D6A47; margin-bottom: 4px; }
    h2 { color: #C8973A; border-bottom: 2px solid #C8973A; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f5f5f0; text-align: left; padding: 8px; border-bottom: 2px solid #ccc; }
    .totals { text-align: right; margin: 16px 0; }
    .totals span { display: inline-block; min-width: 120px; }
    .signature-box { border: 2px solid #2D6A47; border-radius: 8px; padding: 20px; margin: 24px 0; background: #f9f9f5; }
    .agreement { white-space: pre-wrap; font-size: 11px; line-height: 1.5; border: 1px solid #ddd; padding: 16px; margin: 16px 0; max-height: none; background: #fafaf6; }
    .legal-note { font-style: italic; color: #666; font-size: 12px; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Deters Birrell Golf LLC (Gimme Golf)</h1>
  <p style="color:#666;margin-top:0;">(801) 513-3538 | info@gimmegolfsimulators.com<br/>140 N Main St, Kaysville, UT 84037 | gimmegolfsimulators.com</p>

  <h2>Quote #${quote.quote_number}</h2>
  <p><strong>Date:</strong> ${quoteFormattedDate}</p>
  <p><strong>Client:</strong> ${quote.client_name}</p>
  ${quote.client_address ? `<p><strong>Address:</strong> ${quote.client_address}</p>` : ""}
  ${quote.client_phone ? `<p><strong>Phone:</strong> ${quote.client_phone}</p>` : ""}
  <p><strong>Email:</strong> ${quote.client_email}</p>

  <h2>Line Items</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <p><span>Subtotal:</span> <strong>$${Number(quote.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>
    <p style="font-size:18px;color:#C8973A;"><span>Total:</span> <strong>$${Number(quote.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>
    <p><span>50% Deposit:</span> <strong>$${Number(quote.deposit_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>
  </div>

  ${quote.notes ? `<h2>Notes</h2><p>${quote.notes}</p>` : ""}

  <h2>Service & Payment Agreement</h2>
  <div class="agreement">${SERVICE_AGREEMENT}</div>

  <div class="signature-box">
    <h3 style="color:#2D6A47;margin-top:0;">Electronic Signature</h3>
    <p><strong>Signed by:</strong> ${quote.signature_name}</p>
    <p><strong>Date:</strong> ${signedDate}</p>
    <p style="font-style:italic;color:#666;font-size:13px;">By signing electronically, the signer agreed to all terms and conditions in the Service & Payment Agreement above.</p>
  </div>

  <p class="legal-note">This document serves as a legally binding record of the agreement between Deters Birrell Golf LLC and ${quote.client_name}. Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quote-${quote.quote_number}-Signed-Agreement.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8"
        >
          <h1
            className="text-2xl font-bold text-[#F0E8D2] text-center"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            EDIT QUOTE
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] placeholder-[#F0E8D2]/40 focus:outline-none focus:border-[#C8973A]"
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center">
        <p className="text-[#F0E8D2]/60">Loading quote...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center">
        <p className="text-red-400">Quote not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-[#C8973A]"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              QUOTE #{quote.quote_number}
            </h1>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${
                quote.status === "draft"
                  ? "bg-[#F0E8D2]/10 text-[#F0E8D2]/60"
                  : quote.status === "sent"
                  ? "bg-blue-900/40 text-blue-300"
                  : quote.status === "accepted"
                  ? "bg-[#2D6A47]/40 text-green-300"
                  : quote.status === "accepted-pending"
                  ? "bg-amber-900/40 text-amber-300"
                  : quote.status === "paid"
                  ? "bg-[#2D6A47]/60 text-green-200"
                  : "bg-[#F0E8D2]/10 text-[#F0E8D2]/60"
              }`}
            >
              {quote.status}
            </span>
          </div>
          <button
            onClick={() => router.push("/admin/quotes")}
            className="px-4 py-2 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded text-sm hover:text-[#F0E8D2] transition-colors"
          >
            Back to Quotes
          </button>
        </div>

        {/* Signature Info */}
        {quote.signature_name && (
          <div className="border border-[#2D6A47]/30 bg-[#2D6A47]/10 rounded-lg p-4">
            <p className="text-sm text-green-300">
              <span className="font-semibold">Signed by:</span>{" "}
              {quote.signature_name}
            </p>
            {quote.signed_at && (
              <p className="text-xs text-green-300/60 mt-1">
                Signed on{" "}
                {new Date(quote.signed_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
          <h3
            className="text-lg font-bold text-[#F0E8D2] uppercase mb-3"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Timeline
          </h3>
          <div className="space-y-2 text-sm">
            {quote.created_at && (
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-[#F0E8D2]/40" />
                <span className="text-[#F0E8D2]/60">Created:</span>
                <span className="text-[#F0E8D2]/80">
                  {new Date(quote.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {quote.sent_at && (
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-[#F0E8D2]/60">Sent:</span>
                <span className="text-[#F0E8D2]/80">
                  {new Date(quote.sent_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {quote.signed_at && (
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                <span className="text-[#F0E8D2]/60">Signed by {quote.signature_name}:</span>
                <span className="text-[#F0E8D2]/80">
                  {new Date(quote.signed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {quote.paid_at && (
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-[#C8973A]" />
                <span className="text-[#F0E8D2]/60">Paid:</span>
                <span className="text-[#F0E8D2]/80">
                  {new Date(quote.paid_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  quote.status === "paid"
                    ? "bg-[#2D6A47]"
                    : quote.status === "accepted"
                    ? "bg-green-400"
                    : quote.status === "sent"
                    ? "bg-blue-400"
                    : "bg-[#F0E8D2]/30"
                }`}
              />
              <span className="text-[#F0E8D2]/60">Current Status:</span>
              <span className="text-[#F0E8D2] font-medium capitalize">{quote.status}</span>
            </div>
          </div>
        </div>

        {/* Company Header (display only) */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
          <h2
            className="text-xl font-bold text-[#C8973A]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            DETERS BIRRELL GOLF LLC (GIMME GOLF)
          </h2>
          <div className="mt-2 text-sm text-[#F0E8D2]/60 space-y-0.5">
            <p>(801) 513-3538</p>
            <p>info@gimmegolfsimulators.com</p>
            <p>140 N Main St, Kaysville, UT 84037</p>
            <p>gimmegolfsimulators.com</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-4">
          <h3
            className="text-lg font-bold text-[#F0E8D2] uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                Email *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                Phone
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                Address
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
              Quote Date
            </label>
            <input
              type="date"
              value={quoteDate}
              onChange={(e) => setQuoteDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm focus:outline-none focus:border-[#C8973A]"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-4">
          <h3
            className="text-lg font-bold text-[#F0E8D2] uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Line Items
          </h3>

          {/* Quick-add Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-[#F0E8D2]/40 uppercase self-center mr-1">Quick Add:</span>
            {LINE_ITEM_PRESETS.map((preset) => (
              <button
                key={preset.description}
                onClick={() =>
                  setLineItems((prev) => [
                    ...prev,
                    { ...preset },
                  ])
                }
                className="px-3 py-1.5 text-xs border border-[#C8973A]/30 text-[#C8973A] rounded hover:bg-[#C8973A]/10 transition-colors"
              >
                {preset.description} — ${preset.unit_price.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase">
                  <th className="text-left p-2 w-8">#</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-center p-2 w-20">Qty</th>
                  <th className="text-right p-2 w-32">Unit Price</th>
                  <th className="text-right p-2 w-28">Total</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b border-[#F0E8D2]/5">
                    <td className="p-2 text-[#F0E8D2]/30">{index + 1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        className="w-full bg-transparent border-b border-[#F0E8D2]/10 text-[#F0E8D2] text-sm py-1 focus:outline-none focus:border-[#C8973A]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(index, "qty", Number(e.target.value))
                        }
                        min={1}
                        className="w-full bg-transparent border-b border-[#F0E8D2]/10 text-[#F0E8D2] text-sm py-1 text-center focus:outline-none focus:border-[#C8973A]"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-end">
                        <span className="text-[#F0E8D2]/40 mr-1">$</span>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unit_price",
                              Number(e.target.value)
                            )
                          }
                          min={0}
                          step={0.01}
                          className="w-24 bg-transparent border-b border-[#F0E8D2]/10 text-[#F0E8D2] text-sm py-1 text-right focus:outline-none focus:border-[#C8973A]"
                        />
                      </div>
                    </td>
                    <td className="p-2 text-right font-mono text-[#F0E8D2]/80">
                      $
                      {(item.qty * item.unit_price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400/60 hover:text-red-400 transition-colors text-lg leading-none"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addItem}
            className="px-4 py-2 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded text-sm hover:text-[#F0E8D2] hover:border-[#F0E8D2]/40 transition-colors"
          >
            + Add Line Item
          </button>

          {/* Totals */}
          <div className="border-t border-[#F0E8D2]/10 pt-4 space-y-2">
            <div className="flex justify-end gap-8">
              <span className="text-[#F0E8D2]/60 uppercase text-sm">
                Subtotal
              </span>
              <span className="font-mono w-32 text-right">
                $
                {subtotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-[#C8973A] font-bold uppercase text-sm">
                Total
              </span>
              <span className="font-mono font-bold text-[#C8973A] w-32 text-right">
                $
                {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-[#F0E8D2]/60 uppercase text-sm">
                50% Deposit Due
              </span>
              <span className="font-mono w-32 text-right">
                $
                {deposit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Client Notes */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-2">
          <h3
            className="text-lg font-bold text-[#F0E8D2] uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Client Notes
          </h3>
          <p className="text-xs text-[#F0E8D2]/40">Visible to the client on their quote page.</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Additional notes for the client..."
            className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm placeholder-[#F0E8D2]/30 focus:outline-none focus:border-[#C8973A] resize-none"
          />
        </div>

        {/* Internal Notes */}
        <div className="border border-[#C8973A]/20 bg-[#C8973A]/5 rounded-lg p-6 space-y-2">
          <h3
            className="text-lg font-bold text-[#C8973A] uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Internal Notes
          </h3>
          <p className="text-xs text-[#C8973A]/60">Admin only — not visible to the client.</p>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Private notes, reminders, follow-up items..."
            className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#C8973A]/30 text-[#F0E8D2] text-sm placeholder-[#F0E8D2]/30 focus:outline-none focus:border-[#C8973A] resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end flex-wrap pb-8">
          {/* Payment status indicator */}
          {quote.status === "deposit-paid" && (
            <div className="flex items-center gap-2 mr-auto">
              <span className="inline-block h-2 w-2 rounded-full bg-[#C8973A]" />
              <span className="text-sm text-[#C8973A]">50% Deposit Received — Awaiting Final Payment</span>
            </div>
          )}
          {quote.status === "paid" && (
            <div className="flex items-center gap-2 mr-auto">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2D6A47]" />
              <span className="text-sm text-[#2D6A47]">Fully Paid</span>
            </div>
          )}

          {/* Deposit not yet paid */}
          {quote.status !== "paid" && quote.status !== "deposit-paid" && (
            <button
              onClick={() => handleMarkPaid("deposit")}
              disabled={saving}
              className="px-4 py-3 border border-[#2D6A47]/40 text-[#2D6A47] rounded text-sm font-semibold hover:bg-[#2D6A47]/10 disabled:opacity-50 transition-colors"
            >
              Mark Deposit Paid
            </button>
          )}

          {/* Deposit paid, need final payment */}
          {quote.status === "deposit-paid" && (
            <>
              <button
                onClick={handleRequestFinalPayment}
                disabled={saving}
                className="px-4 py-3 border border-[#C8973A]/40 text-[#C8973A] rounded text-sm font-semibold hover:bg-[#C8973A]/10 disabled:opacity-50 transition-colors"
              >
                Request Final 50%
              </button>
              <button
                onClick={() => handleMarkPaid("final")}
                disabled={saving}
                className="px-4 py-3 bg-[#C8973A] text-[#060A07] rounded text-sm font-semibold hover:bg-[#C8973A]/80 disabled:opacity-50 transition-colors"
              >
                Mark Fully Paid
              </button>
            </>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded text-sm font-semibold hover:text-[#F0E8D2] hover:border-[#F0E8D2]/40 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {quote.status === "draft" && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-6 py-3 bg-[#2D6A47] text-[#F0E8D2] rounded text-sm font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
            >
              {saving ? "Sending..." : "Send to Client"}
            </button>
          )}
          {quote.status === "sent" && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-3 border border-[#F0E8D2]/10 text-[#F0E8D2]/40 rounded text-sm font-semibold hover:text-[#F0E8D2]/60 disabled:opacity-50 transition-colors"
            >
              Resend Quote
            </button>
          )}
          <button
            onClick={handleDuplicate}
            disabled={duplicating || saving}
            className="px-4 py-3 border border-[#F0E8D2]/10 text-[#F0E8D2]/40 rounded text-sm font-semibold hover:text-[#F0E8D2]/60 disabled:opacity-50 transition-colors"
          >
            {duplicating ? "Duplicating..." : "Duplicate"}
          </button>
          {quote.signature_name && (
            <button
              onClick={handleExportSigned}
              className="px-4 py-3 border border-[#2D6A47]/40 text-[#2D6A47] rounded text-sm font-semibold hover:bg-[#2D6A47]/10 transition-colors"
            >
              Download Signed Agreement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
