"use client";

import Link from "next/link";
import Image from "next/image";
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
    <nav className="fixed top-0 z-50 w-full border-b border-cream/10 bg-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/logo-main.png"
            alt="Gimme Golf"
            width={44}
            height={44}
            className="h-11 w-auto"
            priority
          />
          <span
            className="text-xl font-bold uppercase tracking-widest text-cream"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Gimme Golf
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium uppercase tracking-wider text-cream/70 transition-colors hover:text-green-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/book"
          className="hidden rounded bg-green-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-dark transition-colors hover:bg-green-accent/90 md:block"
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
            className={`h-0.5 w-6 bg-cream transition-all ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-cream transition-all ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-cream transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-cream/10 bg-dark px-6 pb-6 md:hidden">
          <ul className="flex flex-col gap-4 pt-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium uppercase tracking-wider text-cream/70 transition-colors hover:text-green-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded bg-green-accent px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-dark"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
