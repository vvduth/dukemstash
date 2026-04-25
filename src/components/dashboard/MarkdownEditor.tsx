"use client";

import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Crown, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { optimizePrompt } from "@/actions/ai";

export interface OptimizeContext {
  title?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  maxHeight?: number;
  /** Enables the AI Optimize button in the header. Provide context for the prompt. */
  optimizeContext?: OptimizeContext;
  /** Whether the user has Pro access. Required when optimizeContext is set. */
  isPro?: boolean;
  /** Called when the user accepts the optimized prompt. Parent should update the underlying value. */
  onOptimizedAccept?: (optimized: string) => void;
}

export function MarkdownEditor({
  value,
  onChange,
  readonly = false,
  maxHeight = 400,
  optimizeContext,
  isPro = false,
  onOptimizedAccept,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">(
    readonly ? "preview" : "write"
  );
  const [copied, setCopied] = useState(false);
  const [optimized, setOptimized] = useState<string | null>(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeView, setOptimizeView] = useState<"original" | "optimized">(
    "original"
  );

  const handleCopy = useCallback(async () => {
    const text =
      optimizeView === "optimized" && optimized !== null ? optimized : value;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value, optimized, optimizeView]);

  const handleOptimize = useCallback(async () => {
    if (!optimizeContext || !value.trim()) return;
    setOptimizeLoading(true);
    try {
      const result = await optimizePrompt({
        title: optimizeContext.title,
        content: value,
      });
      if (result.success) {
        if (!result.data.changed) {
          toast.info("Prompt looks good — no changes suggested");
          setOptimized(null);
          setOptimizeView("original");
        } else {
          setOptimized(result.data.optimized);
          setOptimizeView("optimized");
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to optimize prompt");
    } finally {
      setOptimizeLoading(false);
    }
  }, [optimizeContext, value]);

  const handleAcceptOptimized = useCallback(() => {
    if (optimized === null) return;
    onOptimizedAccept?.(optimized);
    setOptimized(null);
    setOptimizeView("original");
    toast.success("Optimized prompt applied");
  }, [optimized, onOptimizedAccept]);

  const handleRejectOptimized = useCallback(() => {
    setOptimized(null);
    setOptimizeView("original");
  }, []);

  const showOptimizeFeature = !!optimizeContext && readonly;
  const hasOptimization = optimized !== null;
  const showingOptimized = hasOptimization && optimizeView === "optimized";
  const displayValue = showingOptimized ? optimized! : value;

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[oklch(0.18_0_0)] border-b border-border">
        <div className="flex items-center gap-1">
          {/* Original/Optimized tabs (after optimization is generated) */}
          {showOptimizeFeature && hasOptimization ? (
            <>
              <button
                type="button"
                onClick={() => setOptimizeView("original")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  optimizeView === "original"
                    ? "bg-[oklch(0.25_0_0)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setOptimizeView("optimized")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  optimizeView === "optimized"
                    ? "bg-[oklch(0.25_0_0)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Optimized
              </button>
            </>
          ) : (
            <>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                    activeTab === "write"
                      ? "bg-[oklch(0.25_0_0)] text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Write
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-[oklch(0.25_0_0)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            markdown
          </span>
          {/* Optimize button (prompt type in drawer read view only) */}
          {showOptimizeFeature &&
            (isPro ? (
              <button
                type="button"
                onClick={handleOptimize}
                disabled={optimizeLoading || !value.trim()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={hasOptimization ? "Regenerate optimization" : "Optimize prompt"}
              >
                {optimizeLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{hasOptimization ? "Regenerate" : "Optimize"}</span>
              </button>
            ) : (
              <span
                className="flex items-center gap-1 text-xs text-muted-foreground cursor-not-allowed opacity-70"
                title="AI features require Pro subscription"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Optimize</span>
              </span>
            ))}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy content"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!readonly && activeTab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown content..."
          className="w-full bg-[oklch(0.13_0_0)] text-sm font-mono text-foreground p-3 outline-none resize-none placeholder:text-muted-foreground"
          style={{ height: maxHeight, maxHeight }}
        />
      ) : (
        <div
          className="markdown-preview bg-[oklch(0.13_0_0)] p-4 overflow-y-auto text-sm"
          style={{ maxHeight }}
        >
          {displayValue ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayValue}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Accept/Reject bar (when viewing optimized version) */}
      {showingOptimized && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[oklch(0.18_0_0)] border-t border-border">
          <span className="text-xs text-muted-foreground">
            Replace your prompt with this optimized version?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRejectOptimized}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:bg-[oklch(0.25_0_0)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
            <button
              type="button"
              onClick={handleAcceptOptimized}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
