"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-9 h-9"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

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

function SuccessContent() {
  const params = useSearchParams();
  const role = params.get("role") === "affiliate" ? "affiliate" : "merchant";
  const dashboardHref = role === "affiliate" ? "/affiliate" : "/dashboard";

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--canvas)", fontFamily: "var(--font-inter, sans-serif)" }}
    >
      {/* Decorative blobs */}
      <div
        className="floating-blob blob-green absolute w-[100px] h-[90px] left-[16%] top-[18%] hidden lg:grid"
        aria-hidden="true"
      >
        <span />
      </div>
      <div
        className="floating-blob blob-orange absolute w-[100px] h-[90px] right-[15%] bottom-[20%] hidden lg:grid"
        style={{ animationDelay: "-1s" }}
        aria-hidden="true"
      >
        <span />
      </div>

      {/* Brand */}
      <Link
        href="/"
        className="fixed top-7 left-7 flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.02em] text-midnight z-10"
      >
        <span
          className="w-[28px] h-[28px] rounded-[9px] flex-shrink-0 inline-block"
          style={{
            background:
              "radial-gradient(circle at 64% 32%, #ffbb26 0 16%, transparent 17%), #121212",
          }}
          aria-hidden="true"
        />
        SplitLink
      </Link>

      {/* Card */}
      <section
        className="relative z-10 w-full max-w-[590px] rounded-3xl bg-card text-center overflow-hidden"
        style={{
          padding: "clamp(30px, 6vw, 58px)",
          boxShadow: "var(--shadow-card)",
          animation: "family-rise 0.8s cubic-bezier(0.19,1,0.22,1) both",
        }}
      >
        {/* Success mark */}
        <div
          className="w-20 h-20 rounded-3xl grid place-items-center mx-auto mb-6 text-midnight"
          style={{ background: "var(--earn)" }}
        >
          <CheckIcon />
        </div>

        <p
          className="m-0 mb-3 text-[14px] font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Stripe connected
        </p>
        <h1
          className="m-0 mb-4 text-midnight leading-[0.98] tracking-[-0.045em] font-medium"
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "clamp(38px, 5vw, 56px)",
          }}
        >
          You&apos;re ready for your{" "}
          {role === "affiliate" ? "earning hub" : "command center"}.
        </h1>
        <p className="text-graphite text-[16px] leading-[1.52] tracking-[-0.2px]">
          The payout rail is ready. SplitLink can now show the right dashboard
          without mixing roles or distracting you.
        </p>

        {/* Proof row */}
        <div className="flex flex-wrap justify-center gap-2 my-6">
          {["Profile ready", "Payouts linked", "Mode selected"].map((text) => (
            <span
              key={text}
              className="px-2.5 py-2 rounded-[10px] text-[12px] font-bold text-charcoal"
              style={{ background: "var(--parchment)", boxShadow: "var(--shadow-card)" }}
            >
              {text}
            </span>
          ))}
        </div>

        <Link
          href={dashboardHref}
          className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: "var(--midnight)" }}
        >
          Go to {role} dashboard
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
