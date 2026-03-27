"use client";

import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  maxHeight?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  readonly = false,
  maxHeight = 400,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">(
    readonly ? "preview" : "write"
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[oklch(0.18_0_0)] border-b border-border">
        <div className="flex items-center gap-1">
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
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            markdown
          </span>
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
      {activeTab === "write" ? (
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
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
