"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { generateAutoTags } from "@/actions/ai";
import type { GenerateAutoTagsInput } from "@/actions/ai";
import { toast } from "sonner";

interface SuggestTagsButtonProps {
  /** Current item data for generating suggestions */
  itemData: GenerateAutoTagsInput;
  /** Current tags (comma-separated string) */
  currentTags: string;
  /** Callback to update the tags string */
  onTagsChange: (tags: string) => void;
  /** Whether the user has Pro access */
  isPro: boolean;
}

export function SuggestTagsButton({
  itemData,
  currentTags,
  onTagsChange,
  isPro,
}: SuggestTagsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!isPro) return null;

  const handleSuggest = async () => {
    setLoading(true);
    setSuggestions([]);

    try {
      const result = await generateAutoTags(itemData);
      if (result.success) {
        // Filter out tags that already exist
        const existingTags = currentTags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        const newSuggestions = result.data.filter(
          (tag) => !existingTags.includes(tag.toLowerCase())
        );
        if (newSuggestions.length === 0) {
          toast.info("No new tag suggestions — all suggested tags already exist");
        } else {
          setSuggestions(newSuggestions);
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to generate tag suggestions");
    } finally {
      setLoading(false);
    }
  };

  const acceptTag = (tag: string) => {
    const existing = currentTags.trim();
    const newTags = existing ? `${existing}, ${tag}` : tag;
    onTagsChange(newTags);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  const rejectTag = (tag: string) => {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

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
        {loading ? "Suggesting..." : "Suggest Tags"}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded border border-dashed border-primary/40 bg-primary/5 text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => acceptTag(tag)}
                className="p-0.5 rounded hover:bg-primary/20 transition-colors"
                title="Accept tag"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => rejectTag(tag)}
                className="p-0.5 rounded hover:bg-destructive/20 transition-colors"
                title="Reject tag"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
