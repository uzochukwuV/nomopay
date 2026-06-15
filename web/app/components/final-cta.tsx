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

export default function FinalCta() {
  return (
    <section
      className="relative mx-auto rounded-3xl text-center overflow-hidden bg-card"
      style={{
        width: "min(calc(100% - 32px), 1200px)",
        marginTop: "clamp(104px, 14vw, 168px)",
        marginBottom: "60px",
        padding: "clamp(38px, 7vw, 84px) 24px",
        boxShadow: "var(--shadow-card)",
        fontFamily: "var(--font-inter, sans-serif)",
      }}
    >
      {/* Decorative blob */}
      <div
        className="floating-blob blob-yellow absolute right-[10%] top-[18%] w-[86px] h-[78px] hidden lg:grid"
        aria-hidden="true"
      >
        <span />
      </div>

      <p
        className="m-0 mb-3 text-[14px] font-semibold tracking-[-0.18px]"
        style={{ color: "var(--accent)" }}
      >
        Choose your path
      </p>
      <h2
        className="m-0 text-midnight leading-[1.04] tracking-[-0.038em] font-semibold"
        style={{ fontSize: "clamp(40px, 5.4vw, 68px)" }}
      >
        Start with the role you actually play.
      </h2>
      <p className="max-w-[570px] mx-auto mt-4 text-[17px] leading-[1.5] tracking-[-0.22px] text-graphite">
        The first click sets the journey: product control for merchants, earning
        control for affiliates.
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 mt-8">
        <Link
          href="/sign-up?role=merchant"
          className="flex items-center gap-2 min-h-[46px] px-5 rounded-full text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: "var(--midnight)" }}
        >
          Merchant signup
          <ArrowIcon />
        </Link>
        <Link
          href="/sign-up?role=affiliate"
          className="flex items-center gap-2 min-h-[46px] px-5 rounded-full text-[14px] font-semibold text-midnight transition-all hover:-translate-y-0.5"
          style={{ background: "#f6f4ef", boxShadow: "var(--shadow-card)" }}
        >
          Affiliate signup
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
