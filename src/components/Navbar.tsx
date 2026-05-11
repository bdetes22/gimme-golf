"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/locations", label: "Locations" },
  { href: "/book", label: "Book" },
  { href: "/shop", label: "Shop" },
  { href: "/build", label: "Build" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#F0E8D2]/10 bg-[#060A07] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <img src="/logos/logo-trimmed.png" alt="Gimme Golf" style={{height: '44px', width: 'auto'}} />
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

        <Link
          href="/book"
          className="hidden rounded bg-[#2D6A47] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F0E8D2] transition-colors hover:bg-[#2D6A47]/90 md:block"
        >
          Book Now
        </Link>

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
            {links.map((link) => (
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
