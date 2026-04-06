"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "AI", href: "#ai" },
];

export default function HomepageNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-slate-700/40 transition-colors duration-300 ${
        scrolled ? "bg-slate-900/92" : "bg-slate-900/60"
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-3.5">
        <Logo />

        {/* Desktop links */}
        <div className="hidden md:flex gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-400 font-medium text-sm hover:text-slate-50 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-slate-400 font-medium text-sm hover:text-slate-50 transition-colors rounded-md"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-[18px] py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-[0.85rem] rounded-[10px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="flex flex-col gap-[5px] md:hidden p-1 bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-[22px] h-0.5 bg-slate-400 rounded-sm transition-transform duration-300 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-[22px] h-0.5 bg-slate-400 rounded-sm transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-[22px] h-0.5 bg-slate-400 rounded-sm transition-transform duration-300 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/98 border-b border-slate-700">
          <div className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 text-slate-400 font-medium text-sm hover:text-slate-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex justify-center gap-3 px-6 py-3 border-t border-slate-700">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-slate-400 font-medium text-sm hover:text-slate-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-[18px] py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-[0.85rem] rounded-[10px]"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
