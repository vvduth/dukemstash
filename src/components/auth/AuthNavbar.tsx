import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AuthNavbar({ currentPage }: { currentPage: "sign-in" | "register" }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-slate-700/40 bg-slate-900/60">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-3.5">
        <Logo />

        <div className="flex items-center gap-3">
          {currentPage !== "sign-in" && (
            <Link
              href="/sign-in"
              className="px-4 py-2 text-slate-400 font-medium text-sm hover:text-slate-50 transition-colors rounded-md"
            >
              Sign In
            </Link>
          )}
          {currentPage !== "register" && (
            <Link
              href="/register"
              className="px-[18px] py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-[0.85rem] rounded-[10px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
