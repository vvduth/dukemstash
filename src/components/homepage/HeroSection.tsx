"use client";

import Link from "next/link";
import ChaosCanvas from "./ChaosCanvas";
import DashboardPreview from "./DashboardPreview";
import FadeIn from "./FadeIn";

const TRUST_TAGS = ["React", "AWS", "AI", "DevOps", "Full-Stack"];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-[120px] pb-20 text-center overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Text content */}
      <FadeIn className="max-w-[720px] mb-16 relative z-[1]">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.15] mb-5">
          Stop Losing Your
          <br />
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Developer Knowledge
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-[560px] mx-auto mb-8">
          Your snippets, prompts, commands, docs, and links are scattered across
          too many tools. Bring them all into one fast, searchable hub.
        </p>
        <div className="flex gap-4 justify-center mb-7 max-md:flex-col max-md:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-[1.05rem] rounded-[10px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all max-md:w-full max-md:max-w-[280px]"
          >
            Start Free
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-slate-50 font-semibold text-[1.05rem] rounded-[10px] border border-slate-700 hover:bg-white/5 hover:border-slate-500 transition-all max-md:w-full max-md:max-w-[280px]"
          >
            Watch Demo
          </a>
        </div>
        <p className="text-[0.8rem] text-slate-400 mb-3">
          Built for developers, students, indie hackers, and startup teams
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {TRUST_TAGS.map((tag) => (
            <span
              key={tag}
              className="font-[family-name:var(--font-jetbrains-mono)] text-[0.7rem] px-2.5 py-0.5 bg-white/5 border border-slate-700 rounded-full text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </FadeIn>

      {/* Chaos → Order visual */}
      <FadeIn className="flex items-center gap-8 max-w-[1000px] w-full relative z-[1] max-md:flex-col max-md:gap-5">
        {/* Chaos box */}
        <div className="flex-1 min-h-[320px] relative bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden max-md:min-h-[240px] max-md:w-full">
          <div className="absolute top-3 left-4 z-10 font-[family-name:var(--font-jetbrains-mono)] text-[0.7rem] text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded-md">
            Your knowledge today...
          </div>
          <ChaosCanvas />
        </div>

        {/* Arrow */}
        <div className="flex-[0_0_80px] flex items-center justify-center max-md:rotate-90 max-md:flex-[0_0_60px]">
          <svg
            viewBox="0 0 60 24"
            fill="none"
            className="w-[60px] h-6 animate-[pulse-arrow_2s_ease-in-out_infinite]"
          >
            <path
              d="M0 12h50m0 0l-8-8m8 8l-8 8"
              stroke="url(#arrow-grad-hero)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="arrow-grad-hero"
                x1="0"
                y1="12"
                x2="60"
                y2="12"
              >
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Dashboard preview */}
        <DashboardPreview />
      </FadeIn>
    </section>
  );
}
