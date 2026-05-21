"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  total: number;
  deposit_amount: number;
  status: string;
  created_at: string;
  sent_at: string | null;
  signed_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#F0E8D2]/10 text-[#F0E8D2]/60",
  sent: "bg-blue-900/40 text-blue-300",
  accepted: "bg-[#2D6A47]/40 text-green-300",
  "accepted-pending": "bg-amber-900/40 text-amber-300",
  paid: "bg-[#2D6A47]/60 text-green-200",
};

export default function AdminQuotesPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const fetchQuotes = async (pw: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quotes?password=${encodeURIComponent(pw)}`
      );
      if (res.status === 401) {
        setError("Invalid password");
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setQuotes(data);
      setAuthenticated(true);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchQuotes(password);
  };

  // Check if password was stored in sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      setPassword(stored);
      fetchQuotes(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            QUOTE BUILDER
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#060A07] text-[#F0E8D2] px-4 py-8 pt-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-bold text-[#C8973A]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            QUOTES
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 border border-[#F0E8D2]/20 text-[#F0E8D2]/60 rounded text-sm hover:text-[#F0E8D2] hover:border-[#F0E8D2]/40 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/quotes/new"
              onClick={() => sessionStorage.setItem("admin_pw", password)}
              className="px-4 py-2 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors text-sm"
            >
              New Quote
            </Link>
          </div>
        </div>

        <div className="border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-[#F0E8D2]/10 text-[#F0E8D2]/60 text-xs uppercase">
                <th className="text-left p-3">Quote #</th>
                <th className="text-left p-3">Client</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Total</th>
                <th className="text-center p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => {
                    sessionStorage.setItem("admin_pw", password);
                    window.location.href = `/admin/quotes/${q.id}`;
                  }}
                  className="border-b border-[#F0E8D2]/5 hover:bg-[#F0E8D2]/[0.02] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono text-[#C8973A]">
                    #{q.quote_number}
                  </td>
                  <td className="p-3">
                    <div>{q.client_name}</div>
                    <div className="text-xs text-[#F0E8D2]/40">
                      {q.client_email}
                    </div>
                  </td>
                  <td className="p-3 text-[#F0E8D2]/60">
                    {formatDate(q.created_at)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    $
                    {Number(q.total).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        STATUS_STYLES[q.status] || STATUS_STYLES.draft
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-[#F0E8D2]/40"
                  >
                    No quotes yet. Create your first quote to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
