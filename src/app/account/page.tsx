"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060A07]">
        <p className="text-[#F0E8D2]/50">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060A07] px-4">
      <div className="w-full max-w-md rounded-lg border border-[#F0E8D2]/10 bg-[#060A07] p-8">
        <h1
          className="mb-6 text-center text-3xl font-bold uppercase tracking-wider text-[#F0E8D2]"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          My Account
        </h1>

        <div className="mb-6 space-y-3">
          <div>
            <span className="text-sm text-[#F0E8D2]/50">Email</span>
            <p className="text-[#F0E8D2]">{user.email}</p>
          </div>
          {user.user_metadata?.name && (
            <div>
              <span className="text-sm text-[#F0E8D2]/50">Name</span>
              <p className="text-[#F0E8D2]">{user.user_metadata.name}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded border border-[#F0E8D2]/20 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
