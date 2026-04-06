"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2 } from "lucide-react";

interface BillingSectionProps {
  isPro: boolean;
  email: string;
}

export function BillingSection({ isPro, email }: BillingSectionProps) {
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

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  if (isPro) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Billing</CardTitle>
            <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 text-[10px] font-semibold tracking-wide">
              PRO
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            You have an active Pro subscription ({email})
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePortal}
            disabled={loading === "portal"}
          >
            {loading === "portal" && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-1">
          Upgrade to Pro for unlimited items, collections, file uploads, and AI features.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <Button
            size="sm"
            onClick={() => handleCheckout("monthly")}
            disabled={loading !== null}
          >
            {loading === "monthly" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Crown className="h-4 w-4 mr-2" />
            )}
            $8/month
          </Button>
          <Button
            size="sm"
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
      </CardContent>
    </Card>
  );
}
