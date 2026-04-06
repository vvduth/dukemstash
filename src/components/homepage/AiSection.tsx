import { Check, Sparkles } from "lucide-react";
import FadeIn from "./FadeIn";

const CHECKLIST = [
  "Auto-generate tags from content",
  "Summarize long notes instantly",
  "Suggest related content",
  "Convert messy notes into collections",
  "Find duplicate snippets",
  "Natural language search",
];

const CODE_LINES = [
  { num: 1, tokens: [{ type: "kw", text: "export" }, { type: "kw", text: " function" }, { type: "fn", text: " useDebounce" }, { type: "br", text: "(" }, { type: "param", text: "value" }, { type: "br", text: ", " }, { type: "param", text: "delay" }, { type: "br", text: ") {" }] },
  { num: 2, tokens: [{ type: "text", text: "  " }, { type: "kw", text: "const" }, { type: "text", text: " [debounced, setDebounced] = " }, { type: "fn", text: "useState" }, { type: "br", text: "(" }, { type: "param", text: "value" }, { type: "br", text: ");" }] },
  { num: 3, tokens: [{ type: "text", text: "  " }, { type: "fn", text: "useEffect" }, { type: "br", text: "(() => {" }] },
  { num: 4, tokens: [{ type: "text", text: "    " }, { type: "kw", text: "const" }, { type: "text", text: " t = " }, { type: "fn", text: "setTimeout" }, { type: "br", text: "(() =>" }, { type: "text", text: " " }, { type: "fn", text: "setDebounced" }, { type: "br", text: "(" }, { type: "param", text: "value" }, { type: "br", text: ")" }, { type: "text", text: ", " }, { type: "param", text: "delay" }, { type: "br", text: ");" }] },
  { num: 5, tokens: [{ type: "text", text: "    " }, { type: "kw", text: "return" }, { type: "br", text: " () =>" }, { type: "text", text: " " }, { type: "fn", text: "clearTimeout" }, { type: "br", text: "(" }, { type: "text", text: "t" }, { type: "br", text: ");" }] },
  { num: 6, tokens: [{ type: "text", text: "  " }, { type: "br", text: "}" }, { type: "text", text: ", [" }, { type: "param", text: "value" }, { type: "text", text: ", " }, { type: "param", text: "delay" }, { type: "br", text: "]);" }] },
  { num: 7, tokens: [{ type: "text", text: "  " }, { type: "kw", text: "return" }, { type: "text", text: " debounced;" }] },
  { num: 8, tokens: [{ type: "br", text: "}" }] },
];

const AI_TAGS = [
  { name: "react", color: "#3b82f6" },
  { name: "hooks", color: "#3b82f6" },
  { name: "debounce", color: "#06b6d4" },
  { name: "utility", color: "#22c55e" },
  { name: "performance", color: "#f59e0b" },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: "text-purple-400",
  fn: "text-blue-400",
  param: "text-amber-400",
  br: "text-slate-400",
  text: "text-slate-300",
};

export default function AiSection() {
  return (
    <section id="ai" className="py-[100px] px-6 bg-slate-950">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 gap-14 items-center max-lg:grid-cols-1 max-lg:gap-10">
          {/* Left: Info */}
          <FadeIn>
            <span className="inline-block px-3.5 py-1 font-[family-name:var(--font-jetbrains-mono)] text-[0.7rem] font-semibold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-full mb-5">
              Pro Feature
            </span>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold mb-4 text-left max-lg:text-center">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Knowledge Management
              </span>
            </h2>
            <p className="text-[1.05rem] text-slate-400 text-left max-w-[560px] mb-8 max-lg:text-center max-lg:mx-auto">
              Let AI handle the busywork so you can focus on building.
            </p>
            <ul className="flex flex-col gap-3.5 max-lg:items-center">
              {CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-[0.95rem] text-slate-400"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15">
                    <Check size={14} className="text-green-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Right: Code editor mock */}
          <FadeIn>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
              {/* Top bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-slate-400">snippet.tsx</span>
              </div>

              {/* Code body */}
              <div className="p-4 font-[family-name:var(--font-jetbrains-mono)] text-[0.8rem] leading-[1.8]">
                {CODE_LINES.map((line) => (
                  <div key={line.num} className="whitespace-nowrap">
                    <span className="text-slate-500/30 mr-4 select-none">
                      {line.num}
                    </span>
                    {line.tokens.map((token, i) => (
                      <span key={i} className={TOKEN_COLORS[token.type]}>
                        {token.text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              {/* AI Tags */}
              <div className="px-4 py-3.5 border-t border-slate-700 bg-slate-900/30">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2.5">
                  <Sparkles size={16} className="text-amber-400" />
                  AI Generated Tags
                </div>
                <div className="flex gap-2 flex-wrap">
                  {AI_TAGS.map((tag) => (
                    <span
                      key={tag.name}
                      className="font-[family-name:var(--font-jetbrains-mono)] text-[0.7rem] px-2.5 py-0.5 bg-white/5 rounded-full"
                      style={{
                        borderWidth: 1,
                        borderColor: tag.color,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

