"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Lock, FileIcon, ImageIcon, Loader2 } from "lucide-react";

interface ProUpgradeGateProps {
  typeName: string;
}

export function ProUpgradeGate({ typeName }: ProUpgradeGateProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const isImage = typeName === "image";
  const Icon = isImage ? ImageIcon : FileIcon;
  const label = isImage ? "Images" : "Files";

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
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto">
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
          <Lock className="h-3 w-3 text-white" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">
        {label} are a Pro feature
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Upgrade to Pro to upload and manage {label.toLowerCase()}. You&apos;ll also get unlimited items, collections, and AI features.
      </p>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => handleCheckout("monthly")}
          disabled={loading !== null}
        >
          {loading === "monthly" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Crown className="h-4 w-4 mr-2" />
          )}
          Upgrade — $8/mo
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCheckout("yearly")}
          disabled={loading !== null}
        >
          {loading === "yearly" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Crown className="h-4 w-4 mr-2" />
          )}
          $72/year
          <span className="ml-1 text-[10px] text-emerald-500 font-medium">
            save 25%
          </span>
        </Button>
      </div>
    </div>
  );
}
