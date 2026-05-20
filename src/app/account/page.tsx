"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Booking {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
}

interface Membership {
  id: string;
  type: string;
  sessions_remaining: number | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function membershipLabel(type: string) {
  const labels: Record<string, string> = {
    walkin: "Walk-In",
    punchpass: "Punch Pass",
    monthly: "Monthly Member",
    annual: "Annual Member",
  };
  return labels[type] || type;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Fetch customer record to get customer ID
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (!customer) {
        setLoading(false);
        return;
      }

      // Fetch membership
      const { data: mem } = await supabase
        .from("memberships")
        .select("*")
        .eq("customer_id", customer.id)
        .eq("active", true)
        .limit(1)
        .single();
      setMembership(mem);

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", customer.id)
        .neq("status", "cancelled")
        .order("start_time", { ascending: true });

      const now = new Date().toISOString();
      const upcoming = (bookings || []).filter((b) => b.start_time > now);
      const past = (bookings || []).filter((b) => b.start_time <= now).reverse().slice(0, 5);
      setUpcomingBookings(upcoming);
      setPastBookings(past);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleCancel(bookingId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!customer) return;

    setCancelling(bookingId);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, customerId: customer.id }),
      });
      if (res.ok) {
        setUpcomingBookings((prev) => prev.filter((b) => b.id !== bookingId));
      }
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#F0E8D2]/50">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.name || user.email;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.25em] text-[#C8973A]">
              Welcome back
            </p>
            <h1
              className="text-3xl font-bold uppercase text-[#F0E8D2] sm:text-4xl"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {userName}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start rounded border border-[#F0E8D2]/20 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/50 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            Sign Out
          </button>
        </div>

        {/* Membership Card */}
        <div className="mb-8 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F0E8D2]/40">
                Membership
              </p>
              {membership ? (
                <>
                  <h3
                    className="text-2xl font-bold uppercase text-[#F0E8D2]"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {membershipLabel(membership.type)}
                  </h3>
                  <p className="mt-1 text-sm text-[#2D6A47]">Active</p>
                </>
              ) : (
                <>
                  <h3
                    className="text-2xl font-bold uppercase text-[#F0E8D2]/50"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    No Active Membership
                  </h3>
                  <p className="mt-1 text-sm text-[#F0E8D2]/40">
                    You&apos;re currently paying per session
                  </p>
                </>
              )}
            </div>
            {membership && membership.type === "punchpass" && membership.sessions_remaining !== null ? (
              <div className="text-center">
                <span
                  className="text-5xl font-bold text-[#2D6A47]"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {membership.sessions_remaining}
                </span>
                <p className="text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/40">
                  Sessions Left
                </p>
              </div>
            ) : !membership ? (
              <Link
                href="/#pricing"
                className="rounded bg-[#2D6A47] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
              >
                View Plans
              </Link>
            ) : null}
          </div>
        </div>

        {/* Book a Session CTA */}
        <Link
          href="/book"
          className="mb-8 block rounded bg-[#2D6A47] px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
        >
          Book a Session
        </Link>

        {/* Upcoming Bookings */}
        <div className="mb-8">
          <h2
            className="mb-4 text-xl font-bold uppercase text-[#F0E8D2]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Upcoming Bookings
          </h2>
          {upcomingBookings.length === 0 ? (
            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6 text-center">
              <p className="text-sm text-[#F0E8D2]/40">No upcoming bookings</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize text-[#F0E8D2]">
                      {b.location}
                    </p>
                    <p className="text-sm text-[#F0E8D2]/50">
                      {formatDate(b.start_time)} &middot; {formatTime(b.start_time)} – {formatTime(b.end_time)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="self-start shrink-0 rounded border border-[#F0E8D2]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[#F0E8D2]/40 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                  >
                    {cancelling === b.id ? "..." : "Cancel"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        <div>
          <h2
            className="mb-4 text-xl font-bold uppercase text-[#F0E8D2]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Past Bookings
          </h2>
          {pastBookings.length === 0 ? (
            <div className="rounded-lg border border-[#F0E8D2]/10 bg-[#F0E8D2]/[0.03] p-6 text-center">
              <p className="text-sm text-[#F0E8D2]/40">No past bookings</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pastBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-[#F0E8D2]/5 bg-[#F0E8D2]/[0.02] p-5"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize text-[#F0E8D2]/60">
                      {b.location}
                    </p>
                    <p className="text-sm text-[#F0E8D2]/30">
                      {formatDate(b.start_time)} &middot; {formatTime(b.start_time)} – {formatTime(b.end_time)}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[#F0E8D2]/20">
                    {b.payment_status === "membership" ? "Member" : "Paid"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
