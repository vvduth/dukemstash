import { Code, Sparkles, Search, Terminal, File, FolderOpen } from "lucide-react";
import FadeIn from "./FadeIn";

const FEATURES = [
  {
    icon: Code,
    title: "Code Snippets",
    description:
      "Save and organize reusable code blocks with syntax highlighting and language detection.",
    preview: "const [state, setState] = useState()",
    accent: "#3b82f6",
  },
  {
    icon: Sparkles,
    title: "AI Prompts",
    description:
      "Store, version, and reuse your best prompts for ChatGPT, Claude, and other AI tools.",
    preview: "Act as a senior React developer...",
    accent: "#f59e0b",
  },
  {
    icon: Search,
    title: "Instant Search",
    description:
      "Find anything in milliseconds. Full-text search across all your content, tags, and titles.",
    preview: '\u2318K \u2192 "useEffect cleanup"',
    accent: "#6366f1",
  },
  {
    icon: Terminal,
    title: "Commands",
    description:
      "Never forget a CLI command again. Save Docker, Git, AWS, and Kubernetes commands.",
    preview: "docker compose up -d --build",
    accent: "#06b6d4",
  },
  {
    icon: File,
    title: "Files & Docs",
    description:
      "Upload configuration files, documents, and images. Everything stored securely in the cloud.",
    preview: ".env \u00b7 docker-compose.yml \u00b7 README",
    accent: "#64748b",
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description:
      "Group related items into smart collections. Mix snippets, prompts, and notes in one place.",
    preview: "React Patterns \u00b7 Interview Prep \u00b7 DevOps",
    accent: "#22c55e",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-[100px] px-6 bg-gray-900">
      <div className="max-w-[1100px] mx-auto">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold mb-4 text-center">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              One Place
            </span>
          </h2>
        </FadeIn>
        <FadeIn>
          <p className="text-[1.05rem] text-slate-400 text-center max-w-[560px] mx-auto mb-12">
            Stop context switching. All your developer knowledge, organized and
            searchable.
          </p>
        </FadeIn>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {FEATURES.map((feature) => (
            <FadeIn key={feature.title}>
              <div
                className="bg-slate-800 border border-slate-700 rounded-2xl p-7 transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] group"
                style={
                  {
                    "--accent": feature.accent,
                  } as React.CSSProperties
                }
              >
                <div
                  className="w-11 h-11 flex items-center justify-center bg-white/[0.04] rounded-xl mb-4"
                  style={{ color: feature.accent }}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="bg-slate-900/60 border border-slate-700/40 rounded-md px-3 py-2">
                  <code
                    className="font-[family-name:var(--font-jetbrains-mono)] text-xs"
                    style={{ color: feature.accent }}
                  >
                    {feature.preview}
                  </code>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
