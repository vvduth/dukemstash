"use client";

import { useState } from "react";
import { Crown, Check, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(interval: "monthly" | "yearly") {
    setLoading(interval);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Upgrade to{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              Pro
            </span>
          </h1>
          <p className="text-muted-foreground">
            Unlock unlimited items, file uploads, and AI-powered features.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            className={`text-sm font-medium transition-colors ${
              !isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 h-[26px] rounded-full cursor-pointer transition-colors ${
              isYearly
                ? "bg-violet-500"
                : "bg-muted-foreground/30"
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
              isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Yearly
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-emerald-500/15 text-emerald-500 rounded-full font-semibold">
            Save 25%
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-xl border border-border p-7">
            <h2 className="text-lg font-semibold mb-1">Free</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Perfect for getting started
            </p>
            <ul className="space-y-3 mb-7">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Current plan
            </Button>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border-2 border-violet-500/50 bg-violet-500/[0.04] p-7">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full">
              Recommended
            </span>
            <h2 className="text-lg font-semibold mb-1">Pro</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">
                {isYearly ? "$72" : "$8"}
              </span>
              <span className="text-sm text-muted-foreground">
                {isYearly ? "/year" : "/month"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {isYearly
                ? "Save 25% with annual billing"
                : "For power users"}
            </p>
            <ul className="space-y-3 mb-7">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              onClick={() => handleCheckout(isYearly ? "yearly" : "monthly")}
              disabled={loading !== null}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              Upgrade to Pro — {isYearly ? "$72/year" : "$8/month"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
