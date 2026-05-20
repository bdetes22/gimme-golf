"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-[#F0E8D2]/10 bg-[#060A07] p-8">
      <h1
        className="mb-6 text-center text-3xl font-bold uppercase tracking-wider text-[#F0E8D2]"
        style={{ fontFamily: "var(--font-barlow-condensed)" }}
      >
        Log In
      </h1>

      {registered && (
        <div className="mb-4 rounded border border-[#2D6A47]/30 bg-[#2D6A47]/10 px-4 py-2 text-sm text-[#2D6A47]">
          Account created successfully! Please log in.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-4 py-2.5 text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#F0E8D2]/70">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-[#F0E8D2]/20 bg-[#060A07] px-4 py-2.5 text-[#F0E8D2] placeholder-[#F0E8D2]/30 outline-none transition-colors focus:border-[#2D6A47]"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 disabled:opacity-50"
        >
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#F0E8D2]/50">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#C8973A] hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060A07] px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
