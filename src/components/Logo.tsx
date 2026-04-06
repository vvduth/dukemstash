import Link from "next/link";

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 font-[family-name:var(--font-space-grotesk)] font-bold text-xl ${className}`}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="url(#logo-grad)" />
        <path
          d="M8 9h12M8 14h8M8 19h10"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <span>DukemStash</span>
    </Link>
  );
}
