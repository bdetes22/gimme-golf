"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "ready" | "error">("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let resolved = false;

    // The recovery link drops a session token in the URL; the Supabase client
    // parses it on load and fires PASSWORD_RECOVERY / SIGNED_IN. Once we have a
    // session, the user can set a new password.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION"))) {
        resolved = true;
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resolved = true;
        setStatus("ready");
      } else {
        // Give the URL-hash parsing a moment before declaring the link bad.
        setTimeout(() => {
          if (!resolved) setStatus("error");
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/account"), 1800);
  }

  const inputClass =
    "w-full px-4 py-3 rounded bg-[#060A07] border border-[#F0E8D2]/20 text-[#F0E8D2] placeholder-[#F0E8D2]/40 focus:outline-none focus:border-[#C8973A]";

  return (
    <div className="min-h-screen bg-[#060A07] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-sm border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] rounded-lg p-8">
        <h1
          className="text-2xl font-bold text-[#F0E8D2] text-center mb-6"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          SET YOUR PASSWORD
        </h1>

        {status === "verifying" && (
          <p className="text-center text-[#F0E8D2]/60 text-sm">Verifying your link…</p>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <p className="text-red-400 text-sm">
              This link is invalid or has expired. Password links are only good for a
              short time.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors"
            >
              Request a new link
            </Link>
          </div>
        )}

        {status === "ready" && !done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[#F0E8D2]/60 text-sm text-center">
              Choose a password for your Gimme Golf account.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className={inputClass}
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              className={inputClass}
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#2D6A47] text-[#F0E8D2] rounded font-semibold hover:bg-[#2D6A47]/80 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Set Password"}
            </button>
          </form>
        )}

        {done && (
          <div className="text-center space-y-2">
            <p className="text-green-300 font-semibold">Password set!</p>
            <p className="text-[#F0E8D2]/60 text-sm">Taking you to your account…</p>
          </div>
        )}
      </div>
    </div>
  );
}
