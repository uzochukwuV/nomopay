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
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M5 12h13m-5-5 5 5-5 5" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section
      className="relative mx-auto flex items-center justify-center min-h-[calc(100vh-96px)] pt-20 pb-16 px-6"
      style={{ width: "min(calc(100% - 32px), 1200px)" }}
    >
      {/* Floating blob characters */}
      <div
        className="floating-blob blob-orange absolute w-[clamp(78px,10vw,130px)] h-[clamp(74px,9vw,118px)] left-[8%] top-[22%] -rotate-[11deg] hidden lg:grid"
        aria-hidden="true"
      >
        <span />
      </div>
      <div
        className="floating-blob blob-green absolute w-[clamp(78px,10vw,130px)] h-[clamp(74px,9vw,118px)] right-[9%] top-[18%] rotate-[9deg] hidden lg:grid"
        style={{ animationDelay: "-1.3s" }}
        aria-hidden="true"
      >
        <span />
      </div>
      <div
        className="floating-blob blob-blue absolute w-[clamp(78px,10vw,130px)] h-[clamp(74px,9vw,118px)] left-[16%] bottom-[18%] rotate-[7deg] hidden xl:grid"
        style={{ animationDelay: "-2.4s" }}
        aria-hidden="true"
      >
        <span />
      </div>

      {/* Floating coins */}
      <div
        className="floating-coin absolute right-[18%] bottom-[20%] w-[74px] h-[74px] text-base hidden lg:grid"
        style={{ animationDelay: "-0.8s" }}
        aria-hidden="true"
      >
        2%
      </div>
      <div
        className="floating-coin absolute left-[25%] top-[16%] w-[54px] h-[54px] text-sm hidden xl:grid"
        style={{ animationDelay: "-1.9s" }}
        aria-hidden="true"
      >
        $
      </div>

      {/* Hero centerpiece */}
      <div
        className="relative z-10 text-center max-w-[760px]"
        style={{ animation: "family-rise 0.9s cubic-bezier(0.19,1,0.22,1) both" }}
      >
        {/* Social proof pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["2% fee", "Stripe-powered split", "No storefront needed"].map((text) => (
            <span
              key={text}
              className="px-2.5 py-2 rounded-[10px] text-[12px] font-semibold bg-card text-charcoal"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {text}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1
          className="m-0 text-charcoal leading-[0.95] tracking-[-0.047em] font-medium"
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "clamp(58px, 9.2vw, 112px)",
          }}
        >
          Sell more.
          <br />
          Share the reward.
        </h1>

        {/* Subheadline */}
        <p
          className="max-w-[590px] mx-auto mt-6 text-[17px] leading-[1.52] tracking-[-0.01em] text-graphite"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          SplitLink turns every product into an affiliate-ready checkout link —
          merchants list once, affiliates share instantly, buyers see a page
          that only wants the sale.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          <Link
            href="/sign-up?role=merchant"
            className="flex items-center gap-2 min-h-[46px] px-5 rounded-full text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "var(--midnight)" }}
          >
            I&apos;m a Merchant
            <ArrowIcon />
          </Link>
          <Link
            href="/sign-up?role=affiliate"
            className="flex items-center gap-2 min-h-[46px] px-5 rounded-full text-[14px] font-semibold text-midnight transition-all hover:-translate-y-0.5"
            style={{ background: "#f6f4ef", boxShadow: "var(--shadow-card)" }}
          >
            I&apos;m an Affiliate
            <ArrowIcon />
          </Link>
        </div>
      </div>

      {/* Mini floating info cards */}
      <div
        className="absolute left-2 bottom-[28%] w-[210px] p-4 rounded-2xl bg-card hidden xl:block"
        style={{
          boxShadow: "var(--shadow-card)",
          animation:
            "family-rise 1s cubic-bezier(0.19,1,0.22,1) 0.18s both, float-card 6s ease-in-out infinite",
        }}
      >
        <span className="text-[12px] font-bold" style={{ color: "var(--accent)" }}>
          Merchant
        </span>
        <strong className="block mt-1.5 text-charcoal text-[23px] tracking-[-0.44px] font-semibold">
          Set 20%
        </strong>
        <small className="block mt-1.5 text-ash text-sm leading-snug">
          Affiliates earn $16.80
        </small>
      </div>

      <div
        className="absolute right-1 bottom-[34%] w-[210px] p-4 rounded-2xl bg-card hidden xl:block"
        style={{
          boxShadow: "var(--shadow-card)",
          animation:
            "family-rise 1s cubic-bezier(0.19,1,0.22,1) 0.3s both, float-card 6s ease-in-out 0.3s infinite",
        }}
      >
        <span className="text-[12px] font-bold" style={{ color: "var(--accent)" }}>
          Affiliate
        </span>
        <strong className="block mt-1.5 text-charcoal text-[23px] tracking-[-0.44px] font-semibold">
          Link ready
        </strong>
        <small className="block mt-1.5 text-ash text-sm leading-snug">
          split.link/ceramic?ref=K39V8
        </small>
      </div>
    </section>
  );
}
