const CARDS = [
  { color: "#3b82f6", tags: ["React", "Hooks"] },
  { color: "#f59e0b", tags: ["GPT", "Prompt"] },
  { color: "#06b6d4", tags: ["Docker", "AWS"] },
  { color: "#22c55e", tags: ["Next.js", "Notes"] },
  { color: "#6366f1", tags: ["Terraform"] },
  { color: "#ec4899", tags: ["DevOps"] },
];

const STATS = [
  { num: "142", label: "Snippets" },
  { num: "58", label: "Prompts" },
  { num: "23", label: "Collections" },
  { num: "12h", label: "Saved" },
];

export default function DashboardPreview() {
  return (
    <div className="relative flex-1 min-h-[320px] bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden animate-[float-preview_6s_ease-in-out_infinite]">
      <div className="absolute top-3 left-4 z-10 font-[family-name:var(--font-jetbrains-mono)] text-[0.7rem] text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded-md">
        ...with DukemStash
      </div>
      <div className="flex h-full pt-9 px-3 pb-3">
        {/* Sidebar */}
        <div className="w-12 flex flex-col gap-2 p-1.5 bg-slate-900/50 rounded-md mr-2.5">
          <div className="h-1.5 rounded-full bg-blue-500" />
          <div className="h-1.5 rounded-full bg-slate-700" />
          <div className="h-1.5 rounded-full bg-slate-700" />
          <div className="h-1.5 rounded-full bg-slate-700" />
          <div className="h-1.5 rounded-full bg-slate-700" />
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Search */}
          <div className="h-[22px] bg-slate-900/50 rounded-md border border-slate-700" />
          {/* Stats */}
          <div className="flex gap-2">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex-1 flex flex-col items-center py-1.5 px-1 bg-slate-900/40 rounded-md border border-slate-700/30"
              >
                <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-[0.8rem] text-slate-50">
                  {s.num}
                </span>
                <span className="text-[0.5rem] text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-3 gap-1.5 flex-1 max-[480px]:grid-cols-2">
            {CARDS.map((card) => (
              <div
                key={card.color}
                className="bg-slate-900/50 rounded-md border border-slate-700/30 p-2 flex flex-col gap-1"
                style={{ borderTopColor: card.color, borderTopWidth: 2 }}
              >
                <div className="h-1.5 w-[70%] bg-slate-700 rounded-full" />
                <div className="h-1 w-[90%] bg-slate-700/50 rounded-sm" />
                <div className="flex gap-1 mt-auto">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-[family-name:var(--font-jetbrains-mono)] text-[0.45rem] px-1.5 py-px bg-white/5 rounded-sm text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
