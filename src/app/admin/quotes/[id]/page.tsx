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
  status: string;
  signature_name: string | null;
  signed_at: string | null;
  sent_at: string | null;
  payment_method: string | null;
  paid_at: string | null;
}

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

        {/* Notes */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-2">
          <h3
            className="text-lg font-bold text-[#F0E8D2] uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Additional notes for the client..."
            className="w-full px-3 py-2 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-sm placeholder-[#F0E8D2]/30 focus:outline-none focus:border-[#C8973A] resize-none"
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
            className="px-6 py-3 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded font-semibold hover:text-[#F0E8D2] hover:border-[#F0E8D2]/40 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
          >
            {saving ? "Sending..." : "Save & Send to Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
