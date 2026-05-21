"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

Client is responsible for the following:

1. Clear Work Area — The installation area must be cleared of furniture, personal items, equipment, and any obstructions prior to Contractor's arrival. Contractor is not responsible for moving or storing personal property.

2. Accurate Measurements — Client is responsible for confirming that the installation space meets the minimum height, width, depth, and clearance requirements necessary for the selected golf simulator system. Contractor is not liable for performance issues or restrictions caused by insufficient space.

3. Power Requirements — Client must ensure that appropriate and safe electrical outlets are available within the installation area. Contractor will not modify electrical systems or provide power infrastructure.

4. Internet & Network Access — If the system requires Wi-Fi or network connectivity, Client must ensure access is available for setup and calibration. Contractor is not responsible for network performance or connectivity issues outside the installation.

5. Environmental Conditions — Client must provide a clean, dry, and safe environment free of ongoing construction work, hazards, or debris that would obstruct installation or pose safety concerns.

6. Structural Readiness — Client is responsible for confirming that walls, ceilings, and floors are structurally capable of supporting mounts, enclosures, projectors, screens, turf, or other required components. Contractor is not responsible for reinforcing or modifying structural elements unless explicitly included in the Project scope.

7. Access to the Premises — Client must ensure Contractor has timely and unobstructed access to the premises, including any necessary keys, entry codes, parking, or gate permissions.

8. Use, Care & Safety — Client agrees to operate the golf simulator system safely and only for its intended purpose. Contractor is not responsible for damage caused by misuse, improper operation, or lack of maintenance.

Failure to meet any of the above responsibilities may result in delays, additional charges, rescheduling fees, or limitations in system performance.

Client Notice
Client acknowledges that installation of the golf simulator system—including, but not limited to, turf, flooring, wall padding, ceiling or wall enclosures, impact screens, mounting hardware, electrical components, and related materials—may cause unavoidable alterations or damage to the surfaces behind or beneath these items. This may include marks, holes, indentations, adhesive residue, impressions, or other cosmetic or structural impacts to existing walls, ceilings, and flooring.

Contractor is not responsible for any such damage, whether occurring during installation, normal use of the simulator, or upon removal of installed materials. Client accepts full responsibility for any necessary repairs or restoration.

Client is entitled to 3 complimentary support visits within the first 365 days following installation. These visits may include assistance with calibration, software setup, system adjustments, or general operational support. Any additional service visits requested after 365 days will be billed at a rate of $200 per visit, unless otherwise agreed in writing.

Cancellation Policy
If Client chooses to cancel the Project after the deposit has been paid, a non-refundable cancellation fee of $250 will be charged to cover administrative, scheduling, and resource allocation costs. This fee will be deducted from the deposit, and any remaining balance of the deposit, if applicable, will be refunded to Client.

Once the deposit is used to purchase materials, that portion of the deposit becomes non-refundable.

All cancellation requests must be submitted in writing.

Payment
Client agrees to pay Contractor the total agreed-upon amount for the services rendered. Payment terms shall be governed by the proposal or estimate provided by Contractor. Any additional costs resulting from unforeseen conditions or Client-requested changes must be approved in writing prior to the commencement of such additional work.

Residential Clients are required to pay a 50% deposit before any work or materials procurement begins. The remaining balance is due within fourteen (14) days of Project completion. Payment is required for the full scope of work outlined in the agreement, regardless of any conditions, preferences, or stipulations later introduced by Client.

If payment is not received within fourteen (14) days of Project completion, Contractor may pursue legal action to recover the outstanding balance. A 1% late fee will be added on the 14th day after completion, with an additional 1% per week applied thereafter on any unpaid balance.

Final payment must be made by card, ACH, or cash. Checks must clear prior to Project completion.

Rescheduling Policy
If Client requests to reschedule the scheduled work within forty-eight (48) hours of the agreed start date and time, a $250 rescheduling fee will apply. This fee covers administrative time, scheduling disruptions, and the reallocation of installation resources.

Rescheduled work will be booked on the next available date based on Contractor's scheduling availability.

All rescheduling requests must be submitted in writing via email or text message and will only be considered confirmed once Contractor has acknowledged and accepted the request in writing.

Job Site Readiness Fee
If the job site is not prepared, accessible, or workable at the scheduled time of service due to conditions outside of Contractor's control—including, but not limited to: no one present to grant access, locked or inaccessible premises, missing keys or entry codes, vehicles or equipment blocking the installation area, other contractors occupying the workspace, or ongoing construction creating obstructions—a $250 rescheduling fee will be charged.

This fee covers lost time, labor disruption, and the need to reschedule the installation.

Project Timeline & Delays
All Project timelines are estimates and may be affected by factors including, but not limited to, supplier delays, backordered products, shipping issues, weather conditions, or unforeseen job-site conditions. Contractor shall not be held liable for delays caused by third-party vendors, manufacturers, shipping carriers, or conditions outside Contractor's control. Any delay does not constitute a breach of this Agreement, nor does it entitle the Client to damages, refunds, or withholding of payment.

Changes, Termination
Contractor may amend or modify this quotation at any time if unforeseen circumstances arise, including, without limitation, issues affecting the integrity or safety of any structure, or the Client's failure to complete responsibilities necessary for the Project. Client acknowledges and agrees that any work performed in addition to the original scope of the Project will result in additional charges, and that all change orders or requests for extra work will incur added costs to be included in the Project price. Any such additional costs will be disclosed to the Client at the time the change order or request for additional work is made.

Either party may terminate this Agreement in the event of a material breach of any term or condition by the other party, or if Client fails to pay Contractor any amounts due under this Agreement.

Client may terminate this Agreement at any time and receive a refund of the Deposit, except when termination occurs within forty-eight (48) hours of the scheduled installation date, in which case the Deposit shall be non-refundable. If Client terminates this Agreement after Contractor has arrived on-site for the Project, Contractor shall be entitled to payment for all expenditures, commitments, liabilities, overhead, and other costs incurred in connection with preparing for or performing the Project, as determined in accordance with standard accounting practices.

Photo/Video Rights
Client grants Contractor the right to photograph or video the installation and finished simulator for marketing, portfolio, and advertising use unless client requests otherwise in writing.

Indemnification
Client shall indemnify, defend, and hold harmless Contractor, its officers, employees, agents, and representatives from and against any and all claims, demands, actions, liabilities, losses, damages, judgments, attorney's fees, costs, and expenses of any kind arising out of, relating to, or resulting from the installation, use, or operation of the golf simulator system, components, or related products installed for the Project.

Contractor Damages
In the event of Client's breach of this Agreement or any resulting contract, Contractor's damages shall include, but are not limited to: all expenditures incurred in preparation for or performance of the Project; the pro rata share of Contractor's overhead attributable to the Project; Contractor's lost profits; and any other incidental, consequential, or out-of-pocket damages sustained as a result of the breach.

Relationship of the Parties
Contractor and Client are independent contracting parties. Nothing in this Agreement shall be construed to create a partnership, joint venture, employer-employee relationship, agency, or legal representation of any kind.

Governing Law
This Agreement shall be governed by and construed in accordance with the laws of the State of Utah, without regard to its conflict of law principles.

Entire Agreement
This Agreement, together with all attachments, exhibits, supplements, or documents referenced herein, constitutes the entire agreement between the parties and is the complete and exclusive statement of the terms governing the Project. It supersedes all prior and contemporaneous oral or written negotiations, representations, or agreements.`;

export default function PublicQuotePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signing, setSigning] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [showAltPayment, setShowAltPayment] = useState(false);
  const [altPaymentDone, setAltPaymentDone] = useState(false);

  // Check for ?paid=true
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("paid") === "true") {
        setIsPaid(true);
      }
    }
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuote(data);
      }
    } catch {
      setError("Failed to load quote");
    }
    setLoading(false);
  };

  const handleSign = async () => {
    if (!signatureName.trim()) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_name: signatureName.trim(),
          signed_at: new Date().toISOString(),
          status: "accepted",
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setQuote(data);
      }
    } catch {
      setError("Failed to sign quote");
    }
    setSigning(false);
  };

  const handleCheckout = async (method: "ach" | "card") => {
    setCheckoutLoading(method);
    try {
      const res = await fetch(`/api/quotes/${id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
      }
    } catch {
      setError("Failed to initiate payment");
    }
    setCheckoutLoading(null);
  };

  const handleAltPayment = async () => {
    try {
      await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted-pending" }),
      });
      setAltPaymentDone(true);
      await fetchQuote();
    } catch {
      setError("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center">
        <p className="text-[#F0E8D2]/60">Loading quote...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#060A07] flex items-center justify-center">
        <p className="text-red-400">{error || "Quote not found"}</p>
      </div>
    );
  }

  const depositAmount = Number(quote.deposit_amount);
  const cardFee = depositAmount * 0.03;
  const cardTotal = depositAmount + cardFee;
  const isSigned = !!quote.signature_name;
  const isAccepted =
    quote.status === "accepted" ||
    quote.status === "accepted-pending" ||
    quote.status === "paid";

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Payment Success */}
        {isPaid && (
          <div className="border border-[#2D6A47] bg-[#2D6A47]/20 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">&#10003;</div>
            <h2
              className="text-2xl font-bold text-green-300"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              PAYMENT RECEIVED
            </h2>
            <p className="text-[#F0E8D2]/60 mt-2">
              Thank you! Your deposit payment has been received. We will be in
              touch shortly to schedule your installation.
            </p>
          </div>
        )}

        {/* Company Header */}
        <div className="text-center space-y-3">
          <Image
            src="/logos/logo-main.png"
            alt="Gimme Golf"
            width={200}
            height={60}
            className="mx-auto"
          />
          <div className="text-sm text-[#F0E8D2]/60 space-y-0.5">
            <p className="font-semibold text-[#F0E8D2]/80">
              Deters Birrell Golf LLC
            </p>
            <p>(801) 513-3538</p>
            <p>info@gimmegolfsimulators.com</p>
            <p>140 N Main St, Kaysville, UT 84037</p>
          </div>
        </div>

        {/* Quote Header */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-bold text-[#C8973A]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                QUOTE #{quote.quote_number}
              </h1>
              <p className="text-sm text-[#F0E8D2]/60 mt-1">
                Date:{" "}
                {new Date(quote.quote_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{quote.client_name}</p>
              {quote.client_address && (
                <p className="text-sm text-[#F0E8D2]/60">
                  {quote.client_address}
                </p>
              )}
              {quote.client_phone && (
                <p className="text-sm text-[#F0E8D2]/60">
                  {quote.client_phone}
                </p>
              )}
              <p className="text-sm text-[#F0E8D2]/60">{quote.client_email}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase bg-[#F0E8D2]/[0.02]">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Description</th>
                <th className="text-center p-3">Qty</th>
                <th className="text-right p-3">Unit Price</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {(quote.line_items || []).map((item: LineItem, index: number) => (
                <tr key={index} className="border-b border-[#F0E8D2]/5">
                  <td className="p-3 text-[#F0E8D2]/30">{index + 1}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3 text-right font-mono text-[#F0E8D2]/60">
                    ${fmt(item.unit_price)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ${fmt(item.qty * item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-[#F0E8D2]/10 p-4 space-y-2">
            <div className="flex justify-end gap-8">
              <span className="text-[#F0E8D2]/60 uppercase text-sm">
                Subtotal
              </span>
              <span className="font-mono w-32 text-right">
                ${fmt(Number(quote.subtotal))}
              </span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-[#C8973A] font-bold uppercase text-sm">
                Total
              </span>
              <span className="font-mono font-bold text-[#C8973A] w-32 text-right text-lg">
                ${fmt(Number(quote.total))}
              </span>
            </div>
          </div>
        </div>

        {/* Deposit */}
        <div className="border border-[#C8973A]/30 bg-[#C8973A]/10 rounded-lg p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-[#C8973A]/60 mb-1">
            50% Deposit Due Upon Acceptance
          </p>
          <p
            className="text-3xl font-bold text-[#C8973A]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            ${fmt(depositAmount)}
          </p>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6">
            <h3
              className="text-sm font-bold text-[#F0E8D2]/60 uppercase mb-2"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Notes
            </h3>
            <p className="text-sm text-[#F0E8D2]/80 whitespace-pre-wrap">
              {quote.notes}
            </p>
          </div>
        )}

        {/* Validity Notice */}
        <p className="text-center text-sm text-[#F0E8D2]/40">
          This quote is valid for 14 days from the date above.
        </p>

        {/* Agreement & Signature Section - Only show if not yet signed */}
        {!isSigned && quote.status !== "paid" && (
          <div className="space-y-6">
            {/* Service Agreement */}
            <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-3">
              <h3
                className="text-lg font-bold text-[#C8973A] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Service & Payment Agreement
              </h3>
              <div
                id="agreement"
                className="max-h-80 overflow-y-auto border border-[#F0E8D2]/10 rounded p-4 text-xs text-[#F0E8D2]/70 whitespace-pre-wrap leading-relaxed"
              >
                {SERVICE_AGREEMENT}
              </div>
            </div>

            {/* E-Signature */}
            <div className="border border-[#C8973A]/20 bg-[#C8973A]/5 rounded-lg p-6 space-y-4">
              <h3
                className="text-lg font-bold text-[#C8973A] uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Electronic Signature
              </h3>
              <p className="text-sm text-[#F0E8D2]/60">
                By typing your full name below and clicking accept, you agree to
                all terms and conditions in the Service Agreement above.
              </p>
              <div>
                <label className="block text-xs text-[#F0E8D2]/60 mb-1 uppercase">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Type your full name"
                  className="w-full px-4 py-3 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] text-lg placeholder-[#F0E8D2]/30 focus:outline-none focus:border-[#C8973A]"
                  style={{ fontFamily: "cursive" }}
                />
              </div>
              <button
                onClick={handleSign}
                disabled={!signatureName.trim() || signing}
                className="w-full py-4 bg-[#2D6A47] text-[#F0E8D2] rounded-lg font-bold text-lg hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {signing
                  ? "Signing..."
                  : "I ACCEPT THIS QUOTE AND AGREEMENT"}
              </button>
            </div>
          </div>
        )}

        {/* Signed confirmation */}
        {isSigned && (
          <div className="border border-[#2D6A47]/30 bg-[#2D6A47]/10 rounded-lg p-6">
            <h3
              className="text-lg font-bold text-green-300 uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Quote Accepted
            </h3>
            <p className="text-sm text-green-300/80 mt-1">
              Signed by{" "}
              <span className="font-semibold">{quote.signature_name}</span> on{" "}
              {quote.signed_at
                ? new Date(quote.signed_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        )}

        {/* Payment Options - show after signing, if not yet paid */}
        {isAccepted && quote.status !== "paid" && !isPaid && (
          <div className="space-y-4">
            <h3
              className="text-xl font-bold text-[#C8973A] text-center uppercase"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              PAY YOUR 50% DEPOSIT
            </h3>

            {/* ACH */}
            <button
              onClick={() => handleCheckout("ach")}
              disabled={checkoutLoading !== null}
              className="w-full py-4 bg-[#2D6A47] text-[#F0E8D2] rounded-lg font-bold text-lg hover:bg-[#2D6A47]/80 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {checkoutLoading === "ach"
                ? "Redirecting..."
                : `PAY $${fmt(depositAmount)} VIA ACH BANK TRANSFER`}
            </button>
            <p className="text-center text-xs text-[#F0E8D2]/40 -mt-2">
              Lowest fees — no added cost
            </p>

            {/* Card */}
            <button
              onClick={() => handleCheckout("card")}
              disabled={checkoutLoading !== null}
              className="w-full py-4 border-2 border-[#F0E8D2]/20 text-[#F0E8D2] rounded-lg font-bold text-lg hover:border-[#F0E8D2]/40 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {checkoutLoading === "card"
                ? "Redirecting..."
                : `PAY VIA CREDIT/DEBIT CARD`}
            </button>
            <p className="text-center text-xs text-[#F0E8D2]/40 -mt-2">
              ${fmt(depositAmount)} + ${fmt(cardFee)} (3% fee) = $
              {fmt(cardTotal)}
            </p>

            {/* Alt payment */}
            {!showAltPayment && !altPaymentDone && (
              <button
                onClick={() => setShowAltPayment(true)}
                className="w-full text-center text-sm text-[#C8973A]/70 hover:text-[#C8973A] transition-colors py-2"
              >
                Pay via Check / Zelle / Venmo
              </button>
            )}

            {showAltPayment && !altPaymentDone && (
              <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-6 space-y-3">
                <h4
                  className="text-base font-bold text-[#F0E8D2] uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Alternative Payment Instructions
                </h4>
                <div className="text-sm text-[#F0E8D2]/70 space-y-2">
                  <p>
                    <span className="text-[#C8973A] font-semibold">
                      Check:
                    </span>{" "}
                    Make payable to{" "}
                    <span className="text-[#F0E8D2]">
                      Deters Birrell Golf LLC
                    </span>
                    . Mail to 140 N Main St, Kaysville, UT 84037.
                  </p>
                  <p>
                    <span className="text-[#C8973A] font-semibold">
                      Zelle:
                    </span>{" "}
                    Send to{" "}
                    <span className="text-[#F0E8D2]">
                      info@gimmegolfsimulators.com
                    </span>
                  </p>
                  <p>
                    <span className="text-[#C8973A] font-semibold">
                      Venmo:
                    </span>{" "}
                    Contact us at (801) 513-3538 for Venmo details.
                  </p>
                </div>
                <p className="text-xs text-[#F0E8D2]/40">
                  Amount due: ${fmt(depositAmount)}
                </p>
                <button
                  onClick={handleAltPayment}
                  className="w-full py-3 bg-[#C8973A] text-[#060A07] rounded font-semibold hover:bg-[#C8973A]/80 transition-colors"
                >
                  I Will Pay via Check/Zelle/Venmo
                </button>
              </div>
            )}

            {altPaymentDone && (
              <div className="border border-amber-500/30 bg-amber-900/10 rounded-lg p-4 text-center">
                <p className="text-amber-300 font-semibold">
                  Payment method noted
                </p>
                <p className="text-sm text-[#F0E8D2]/50 mt-1">
                  Please send your deposit of ${fmt(depositAmount)} using one of
                  the methods above. We will confirm receipt and schedule your
                  installation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Already paid */}
        {quote.status === "paid" && !isPaid && (
          <div className="border border-[#2D6A47] bg-[#2D6A47]/20 rounded-lg p-6 text-center">
            <h2
              className="text-2xl font-bold text-green-300"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              PAYMENT RECEIVED
            </h2>
            <p className="text-[#F0E8D2]/60 mt-2">
              Thank you! Your deposit has been received. We will be in touch
              shortly.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-[#F0E8D2]/30 pb-8 space-y-1">
          <p>Deters Birrell Golf LLC | Gimme Golf</p>
          <p>140 N Main St, Kaysville, UT 84037 | (801) 513-3538</p>
          <p>gimmegolfsimulators.com</p>
        </div>
      </div>
    </div>
  );
}
