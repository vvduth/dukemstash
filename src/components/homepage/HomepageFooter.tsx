import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "AI Features", href: "#ai" },
  { label: "Changelog", href: "#" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "#" },
  { label: "API", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Support", href: "#" },
];

const CONNECT_LINKS = [
  { label: "GitHub", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Discord", href: "#" },
  { label: "Email", href: "#" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-space-grotesk)] font-bold text-lg">
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="url(#logo-grad-footer)" />
        <path
          d="M8 9h12M8 14h8M8 19h10"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="logo-grad-footer" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <span>DukemStash</span>
    </Link>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="font-[family-name:var(--font-space-grotesk)] text-[0.85rem] font-semibold mb-1">
        {title}
      </h4>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-[0.85rem] text-slate-400 hover:text-slate-50 transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function HomepageFooter() {
  return (
    <footer className="bg-gray-900 border-t border-slate-700 pt-16 pb-8 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-lg:grid-cols-2 max-lg:gap-8 max-md:grid-cols-1">
          <div>
            <Logo />
            <p className="text-[0.85rem] text-slate-400 mt-3">
              One hub for all your developer knowledge.
            </p>
          </div>
          <FooterCol title="Product" links={PRODUCT_LINKS} />
          <FooterCol title="Resources" links={RESOURCE_LINKS} />
          <FooterCol title="Connect" links={CONNECT_LINKS} />
        </div>
        <div className="border-t border-slate-700 pt-6 text-center">
          <p className="text-[0.8rem] text-slate-400">
            &copy; {new Date().getFullYear()} DukemStash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
