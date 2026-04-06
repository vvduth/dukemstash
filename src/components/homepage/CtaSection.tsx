import Link from "next/link";
import FadeIn from "./FadeIn";

export default function CtaSection() {
  return (
    <section className="py-[100px] px-6 bg-slate-950 text-center">
      <FadeIn className="max-w-[1100px] mx-auto">
        <div className="bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] border border-blue-500/20 rounded-3xl py-20 px-10">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold mb-4">
            Ready to Organize Your
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Developer Knowledge?
            </span>
          </h2>
          <p className="text-[1.05rem] text-slate-400 max-w-[560px] mx-auto mb-8">
            Join developers who stopped losing their best ideas. Free forever,
            upgrade anytime.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-[1.05rem] rounded-[10px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all"
          >
            Start Free &mdash; No Credit Card
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
