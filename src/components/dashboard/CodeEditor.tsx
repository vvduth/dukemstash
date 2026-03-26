"use client";

import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { Check, Copy } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readonly?: boolean;
  maxHeight?: number;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  java: "java",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  sql: "sql",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  md: "markdown",
  dockerfile: "dockerfile",
  graphql: "graphql",
  prisma: "prisma",
};

function resolveLanguage(lang?: string): string {
  if (!lang) return "plaintext";
  const lower = lang.toLowerCase();
  return LANGUAGE_MAP[lower] ?? lower;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readonly = false,
  maxHeight = 400,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const monacoLanguage = resolveLanguage(language);
  const displayLanguage = language || "plain";

  // Calculate height based on line count, clamped to maxHeight
  const lineCount = value.split("\n").length;
  const lineHeight = 19;
  const padding = 16;
  const calculatedHeight = Math.min(
    Math.max(lineCount * lineHeight + padding, 80),
    maxHeight
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[oklch(0.18_0_0)] border-b border-border">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {displayLanguage}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={calculatedHeight}
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        theme="vs-dark"
        options={{
          readOnly: readonly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineHeight: lineHeight,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: readonly ? "none" : "line",
          lineNumbers: readonly ? "off" : "on",
          folding: false,
          wordWrap: "on",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
            useShadows: false,
          },
          contextmenu: false,
          domReadOnly: readonly,
          cursorStyle: readonly ? "underline-thin" : "line",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
