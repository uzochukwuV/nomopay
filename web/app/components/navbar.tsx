import Link from "next/link";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[14px] h-[14px]"
      aria-hidden="true"
    >
      <path d="M5 12h13m-5-5 5 5-5 5" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header
      className="sticky top-4 z-20 mx-auto"
      style={{ width: "min(calc(100% - 32px), 1200px)" }}
    >
      <div
        className="flex items-center justify-between gap-4 rounded-full min-h-[58px] px-2.5 py-2 pl-[18px]"
        style={{
          background: "rgba(251,250,249,0.86)",
          backdropFilter: "blur(16px)",
          boxShadow: "rgba(0,0,0,0.04) 0 0 0 1px",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.02em] text-midnight"
        >
          <span
            className="w-[30px] h-[30px] rounded-[10px] flex-shrink-0 inline-block"
            style={{
              background:
                "radial-gradient(circle at 64% 32%, #ffbb26 0 16%, transparent 17%), #121212",
            }}
            aria-hidden="true"
          />
          SplitLink
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 px-1" aria-label="Primary">
          {[
            ["#how-it-works", "How it works"],
            ["#fee", "2% fee"],
            ["#preview", "Preview"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="px-3.5 py-2.5 rounded-full text-graphite text-[13px] font-semibold hover:bg-stone transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/sign-up?role=merchant"
          className="flex items-center gap-2 min-h-[44px] px-4 rounded-full text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--midnight)" }}
        >
          Start selling
          <ArrowIcon />
        </Link>
      </div>
    </header>
  );
}
