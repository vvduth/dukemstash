"use client";

import { useState } from "react";
import Link from "next/link";
import FadeIn from "./FadeIn";

const FREE_FEATURES = [
  "50 items total",
  "3 collections",
  "Snippets, prompts, notes, commands, links",
  "Basic search",
  "Dark mode",
];

const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "File & image uploads",
  "AI auto-tagging",
  "AI code explanation",
  "AI prompt optimizer",
  "Export data (JSON/ZIP)",
  "Priority support",
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-[100px] px-6 bg-gray-900">
      <div className="max-w-[1100px] mx-auto">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold mb-4 text-center">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
        </FadeIn>
        <FadeIn>
          <p className="text-[1.05rem] text-slate-400 text-center max-w-[560px] mx-auto mb-12">
            Start free. Upgrade when you need more power.
          </p>
        </FadeIn>

        {/* Toggle */}
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-12">
            <span
              className={`text-sm font-medium transition-colors ${
                !isYearly ? "text-slate-50" : "text-slate-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-[26px] rounded-[13px] border-none cursor-pointer transition-colors ${
                isYearly ? "bg-blue-500" : "bg-slate-700"
              }`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full transition-transform ${
                  isYearly ? "translate-x-[22px]" : ""
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                isYearly ? "text-slate-50" : "text-slate-400"
              }`}
            >
              Yearly
            </span>
            <span className="text-[0.7rem] px-2.5 py-0.5 bg-green-500/15 text-green-500 rounded-full font-semibold">
              Save 25%
            </span>
          </div>
        </FadeIn>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-6 max-w-[760px] mx-auto max-md:grid-cols-1">
          {/* Free */}
          <FadeIn>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-9 transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-2">
                Free
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[2.8rem] font-bold">
                  $0
                </span>
                <span className="text-sm text-slate-400">/month</span>
              </div>
              <p className="text-[0.85rem] text-slate-400 mb-6">
                Perfect for getting started
              </p>
              <ul className="list-none mb-7">
                {FREE_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="py-2 text-sm text-slate-400 border-b border-slate-700/30 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="flex w-full items-center justify-center px-6 py-2.5 bg-transparent text-slate-50 font-semibold text-[0.95rem] rounded-[10px] border border-slate-700 hover:bg-white/5 hover:border-slate-500 transition-all"
              >
                Get Started
              </Link>
            </div>
          </FadeIn>

          {/* Pro */}
          <FadeIn>
            <div className="relative bg-gradient-to-b from-blue-500/[0.08] to-slate-800 border border-blue-500 rounded-2xl p-9 transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full whitespace-nowrap">
                Most Popular
              </span>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold mb-2">
                Pro
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[2.8rem] font-bold">
                  {isYearly ? "$72" : "$8"}
                </span>
                <span className="text-sm text-slate-400">
                  {isYearly ? "/year" : "/month"}
                </span>
              </div>
              <p className="text-[0.85rem] text-slate-400 mb-6">
                {isYearly
                  ? "Save 25% with annual billing"
                  : "For power users and teams"}
              </p>
              <ul className="list-none mb-7">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="py-2 text-sm text-slate-400 border-b border-slate-700/30 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="flex w-full items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-[0.95rem] rounded-[10px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
