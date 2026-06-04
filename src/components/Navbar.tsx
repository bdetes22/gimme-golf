"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/", label: "Home" },
  { href: "/locations", label: "Locations" },
  { href: "/book", label: "Book" },
  { href: "/memberships", label: "Memberships" },
  { href: "/shop", label: "Shop" },
  { href: "/build", label: "Build" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const mobileLinks = links;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) checkAdmin(session.user.email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) checkAdmin(session.user.email);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(email: string) {
    const { data } = await supabase
      .from("customers")
      .select("is_admin")
      .eq("email", email)
      .single();
    setIsAdmin(data?.is_admin === true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#F0E8D2]/10 bg-[#060A07] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <img src="/logos/logo-trimmed.png" alt="Gimme Golf" className="h-8 w-auto sm:h-10" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:text-[#2D6A47]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium uppercase tracking-wider text-[#2D6A47] transition-colors hover:text-[#2D6A47]/80"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="text-sm font-medium text-[#C8973A] transition-colors hover:text-[#C8973A]/80"
              >
                {user.user_metadata?.name || user.email}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/50 transition-colors hover:text-[#F0E8D2]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:text-[#2D6A47]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:text-[#2D6A47]"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            href="/book"
            className="rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-6 bg-[#F0E8D2] transition-all ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-[#F0E8D2] transition-all ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-[#F0E8D2] transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#F0E8D2]/10 bg-[#060A07] px-6 pb-6 md:hidden">
          <ul className="flex flex-col gap-4 pt-4">
            {mobileLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:text-[#2D6A47]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-[#F0E8D2]/10 pt-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold uppercase tracking-wider text-[#2D6A47]"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[#C8973A]"
              >
                {user.user_metadata?.name || user.email}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/50 transition-colors hover:text-[#F0E8D2]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 border-t border-[#F0E8D2]/10 pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:text-[#2D6A47]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-wider text-[#F0E8D2]/70 transition-colors hover:text-[#2D6A47]"
              >
                Sign Up
              </Link>
            </div>
          )}
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded bg-[#2D6A47] px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-[#F0E8D2]"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
