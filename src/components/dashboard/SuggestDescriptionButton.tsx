"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { generateDescription } from "@/actions/ai";
import type { GenerateDescriptionInput } from "@/actions/ai";
import { toast } from "sonner";

interface SuggestDescriptionButtonProps {
  itemData: GenerateDescriptionInput;
  currentDescription: string;
  onDescriptionChange: (description: string) => void;
  isPro: boolean;
}

export function SuggestDescriptionButton({
  itemData,
  currentDescription,
  onDescriptionChange,
  isPro,
}: SuggestDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  if (!isPro) return null;

  const handleSuggest = async () => {
    setLoading(true);
    setSuggestion(null);

    try {
      const result = await generateDescription(itemData);
      if (result.success) {
        setSuggestion(result.data);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setLoading(false);
    }
  };

  const accept = () => {
    if (suggestion) {
      onDescriptionChange(suggestion);
      setSuggestion(null);
    }
  };

  const reject = () => {
    setSuggestion(null);
  };

  const buttonLabel = currentDescription.trim() ? "Regenerate" : "Suggest Description";

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSuggest}
        disabled={loading || !itemData.title.trim()}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 mr-1" />
        )}
        {loading ? "Generating..." : buttonLabel}
      </Button>

      {suggestion && (
        <div className="flex items-start gap-2 rounded border border-dashed border-primary/40 bg-primary/5 p-2">
          <p className="flex-1 text-xs text-primary leading-relaxed">{suggestion}</p>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={accept}
              className="p-1 rounded hover:bg-primary/20 transition-colors text-primary"
              title="Accept description"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={reject}
              className="p-1 rounded hover:bg-destructive/20 transition-colors text-muted-foreground"
              title="Reject description"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
