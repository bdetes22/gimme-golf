"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
}

const LINE_ITEM_PRESETS: LineItem[] = [
  { description: "Extra padding package", qty: 1, unit_price: 800 },
  { description: "Premium turf upgrade", qty: 1, unit_price: 500 },
  { description: "Additional TV/Monitor", qty: 1, unit_price: 689 },
  { description: "Projector upgrade", qty: 1, unit_price: 1200 },
  { description: "Custom lighting", qty: 1, unit_price: 350 },
];

const DEFAULT_LINE_ITEMS: LineItem[] = [
  { description: "ProTee VX Launch Monitor installation and calibration", qty: 1, unit_price: 7955 },
  { description: "Software implementation (software purchased separately)", qty: 1, unit_price: 100 },
  { description: "4K Projector installation and calibration", qty: 1, unit_price: 2058 },
  { description: "Required PC + Keyboard and Mouse with setup and install", qty: 1, unit_price: 1965 },
  { description: "Monitor/TV Screen + installation", qty: 1, unit_price: 689 },
  { description: "PC Cabinet/Enclosure + setup and installation", qty: 1, unit_price: 450 },
  { description: "Black behind screen for better picture", qty: 1, unit_price: 480 },
  { description: "Design Process and Planning", qty: 1, unit_price: 0 },
  { description: "Impact Screen with setup and installation", qty: 1, unit_price: 2270 },
  { description: "Enclosure Protection materials assembly and installation", qty: 1, unit_price: 4426 },
  { description: "Installing artificial turf through the space with padding underneath", qty: 1, unit_price: 2947 },
  { description: "Help and Support", qty: 1, unit_price: 0 },
  { description: "Miscellaneous building materials", qty: 1, unit_price: 675 },
];

export default function NewQuotePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteDate, setQuoteDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(DEFAULT_LINE_ITEMS);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      setPassword(stored);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll validate the password on save
    sessionStorage.setItem("admin_pw", password);
    setAuthenticated(true);
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
          status: "draft",
        }),
      });

      if (res.status === 401) {
        setError("Invalid admin password");
        setSaving(false);
        return;
      }

      const quote = await res.json();
      if (quote.error) {
        setError(quote.error);
        setSaving(false);
        return;
      }

      if (sendToClient && quote.id) {
        await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password,
            action: "send",
            id: quote.id,
          }),
        });
      }

      router.push("/admin/quotes");
    } catch {
      setError("Failed to save quote");
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
            NEW QUOTE
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
            className="w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-bold text-[#C8973A]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            NEW QUOTE
          </h1>
          <button
            onClick={() => router.push("/admin/quotes")}
            className="px-4 py-2 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded text-sm hover:text-[#F0E8D2] transition-colors"
          >
            Back to Quotes
          </button>
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
                  <tr
                    key={index}
                    className="border-b border-[#F0E8D2]/5"
                  >
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
        <div className="flex gap-3 justify-end pb-8">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded font-semibold hover:text-[#F0E8D2] hover:border-[#F0E8D2]/40 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save & Send to Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
