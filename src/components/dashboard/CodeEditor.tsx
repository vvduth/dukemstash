"use client";

import { useCallback, useRef, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { Check, Copy, Crown, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useEditorPreferences } from "@/contexts/editor-preferences";
import { explainCode } from "@/actions/ai";

export interface ExplainContext {
  title?: string;
  type: "snippet" | "command";
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readonly?: boolean;
  maxHeight?: number;
  /** Enables the AI Explain button in the header. Provide context for the prompt. */
  explainContext?: ExplainContext;
  /** Whether the user has Pro access. Required when explainContext is set. */
  isPro?: boolean;
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

/** Dropdown-friendly language options (value stored in DB, label shown in UI). */
export const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "shell", label: "Shell / Bash" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
  { value: "prisma", label: "Prisma" },
] as const;

function resolveLanguage(lang?: string): string {
  if (!lang) return "plaintext";
  const lower = lang.toLowerCase();
  return LANGUAGE_MAP[lower] ?? lower;
}

function defineCustomThemes(monaco: Monaco) {
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715E", fontStyle: "italic" },
      { token: "keyword", foreground: "F92672" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF", fontStyle: "italic" },
      { token: "function", foreground: "A6E22E" },
      { token: "variable", foreground: "F8F8F2" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editor.lineHighlightBackground": "#3E3D32",
      "editor.selectionBackground": "#49483E",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8B949E", fontStyle: "italic" },
      { token: "keyword", foreground: "FF7B72" },
      { token: "string", foreground: "A5D6FF" },
      { token: "number", foreground: "79C0FF" },
      { token: "type", foreground: "FFA657" },
      { token: "function", foreground: "D2A8FF" },
      { token: "variable", foreground: "C9D1D9" },
    ],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#C9D1D9",
      "editor.lineHighlightBackground": "#161B22",
      "editor.selectionBackground": "#264F78",
    },
  });
}

export function CodeEditor({
  value,
  onChange,
  language,
  readonly = false,
  maxHeight = 400,
  explainContext,
  isPro = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code");
  const themesDefinedRef = useRef(false);
  const { preferences } = useEditorPreferences();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    if (!themesDefinedRef.current) {
      defineCustomThemes(monaco);
      themesDefinedRef.current = true;
    }
  }, []);

  const handleExplain = useCallback(async () => {
    if (!explainContext || !value.trim()) return;
    setExplainLoading(true);
    try {
      const result = await explainCode({
        title: explainContext.title,
        content: value,
        type: explainContext.type,
        language,
      });
      if (result.success) {
        setExplanation(result.data);
        setActiveTab("explain");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to generate explanation");
    } finally {
      setExplainLoading(false);
    }
  }, [explainContext, value, language]);

  const monacoLanguage = resolveLanguage(language);
  const displayLanguage = language || "plain";

  const lineHeight = Math.round(preferences.fontSize * 1.46);
  const lineCount = value.split("\n").length;
  const padding = 16;
  const calculatedHeight = Math.min(
    Math.max(lineCount * lineHeight + padding, 80),
    maxHeight
  );

  const showExplainFeature = !!explainContext;
  const hasExplanation = explanation !== null;
  const showingExplain = hasExplanation && activeTab === "explain";

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
          {/* Code/Explain tabs (after explanation has been generated) */}
          {showExplainFeature && hasExplanation && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activeTab === "code"
                    ? "bg-[oklch(0.25_0_0)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("explain")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  activeTab === "explain"
                    ? "bg-[oklch(0.25_0_0)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Explain
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {displayLanguage}
          </span>
          {/* Explain button (snippet/command in drawer read view only) */}
          {showExplainFeature &&
            (isPro ? (
              <button
                type="button"
                onClick={handleExplain}
                disabled={explainLoading || !value.trim()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={hasExplanation ? "Regenerate explanation" : "Explain code"}
              >
                {explainLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{hasExplanation ? "Regenerate" : "Explain"}</span>
              </button>
            ) : (
              <span
                className="flex items-center gap-1 text-xs text-muted-foreground cursor-not-allowed opacity-70"
                title="AI features require Pro subscription"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Explain</span>
              </span>
            ))}
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

      {/* Body: code editor or explanation markdown */}
      {showingExplain ? (
        <div
          className="markdown-preview bg-[oklch(0.13_0_0)] p-4 overflow-y-auto text-sm"
          style={{ maxHeight }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation!}</ReactMarkdown>
        </div>
      ) : (
        <Editor
          height={calculatedHeight}
          language={monacoLanguage}
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          theme={preferences.theme}
          beforeMount={handleBeforeMount}
          options={{
            readOnly: readonly,
            minimap: { enabled: preferences.minimap },
            scrollBeyondLastLine: false,
            fontSize: preferences.fontSize,
            tabSize: preferences.tabSize,
            lineHeight: lineHeight,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: readonly ? "none" : "line",
            lineNumbers: readonly ? "off" : "on",
            folding: false,
            wordWrap: preferences.wordWrap ? "on" : "off",
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
      )}
    </div>
  );
}
