"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@clerk/nextjs";

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

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <path d="M4 7h16v13H4z" />
      <path d="M16 12h4v4h-4z" />
      <path d="M4 7l12-3 2 3" />
    </svg>
  );
}

function OnboardingContent() {
  const params = useSearchParams();
  const role = params.get("role") === "affiliate" ? "affiliate" : "merchant";
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error ?? "Stripe onboarding URL was not returned.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start Stripe onboarding. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--canvas)", fontFamily: "var(--font-inter, sans-serif)" }}
    >
      {/* Decorative blobs */}
      <div
        className="floating-blob blob-blue absolute w-[100px] h-[90px] left-[16%] top-[18%] hidden lg:grid"
        aria-hidden="true"
      >
        <span />
      </div>
      <div
        className="floating-blob blob-yellow absolute w-[100px] h-[90px] right-[15%] bottom-[16%] hidden lg:grid"
        style={{ animationDelay: "-1.7s" }}
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
        }}
      >
        {/* Green corner decoration */}
        <div
          className="absolute -right-14 -top-14 w-40 h-40 -z-10"
          style={{
            borderRadius: "50% 48% 54% 46% / 48% 58% 42% 52%",
            background: "var(--earn)",
          }}
          aria-hidden="true"
        />

        {/* Brand inside card */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span
            className="w-[28px] h-[28px] rounded-[9px] flex-shrink-0 inline-block"
            style={{
              background:
                "radial-gradient(circle at 64% 32%, #ffbb26 0 16%, transparent 17%), #121212",
            }}
            aria-hidden="true"
          />
          <span className="text-[15px] font-extrabold tracking-[-0.02em] text-midnight">
            SplitLink
          </span>
        </div>

        {/* Wallet scene */}
        <div className="wallet-scene mx-auto mb-6 flex flex-col items-center gap-1">
          <div
            className="w-[58px] h-[58px] rounded-[22px] bg-card grid place-items-center text-midnight"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <WalletIcon />
          </div>
          <span
            className="text-[11px] font-bold"
            style={{ color: "var(--accent)" }}
          >
            Stripe
          </span>
        </div>

        <p
          className="m-0 mb-3 text-[14px] font-semibold"
          style={{ color: "var(--accent)" }}
        >
          One more step
        </p>
        <h1
          className="m-0 mb-4 text-midnight leading-[0.98] tracking-[-0.045em] font-medium"
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "clamp(38px, 5vw, 56px)",
          }}
        >
          Connect your payment account.
        </h1>
        <p className="text-graphite text-[16px] leading-[1.52] tracking-[-0.2px]">
          {role === "merchant"
            ? "Stripe lets product revenue move automatically after the 2% platform fee and affiliate commissions are calculated."
            : "Stripe lets commissions move securely after the 7-day pending period clears, so earnings never feel mysterious."}
        </p>

        {/* Config card */}
        <div
          className="mt-6 mb-4 p-4 rounded-2xl text-left"
          style={{ background: "var(--parchment)", boxShadow: "var(--shadow-card)" }}
        >
          <strong className="block text-[13px] text-midnight font-bold mb-1">
            Profile ready
          </strong>
          <span className="text-[12px] text-graphite leading-[1.45] font-semibold">
            Your account is created. This step links your Stripe payout account
            so transfers can fire automatically.
          </span>
        </div>

        {/* Connect button */}
        <button
          type="button"
          onClick={handleConnect}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{ background: "var(--midnight)" }}
        >
          {loading ? "Opening Stripe…" : "Connect with Stripe"}
          {!loading && <ArrowIcon />}
        </button>

        {error && (
          <div
            className="mt-3 p-3.5 rounded-2xl text-[13px] font-bold text-left"
            style={{ background: "#fff0f0", color: "#8a2020" }}
          >
            {error}
          </div>
        )}

        {/* Proof row */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {["No nav", "No dashboard", "No distractions"].map((text) => (
            <span
              key={text}
              className="px-2.5 py-2 rounded-[10px] text-[12px] font-bold text-charcoal"
              style={{ background: "var(--parchment)", boxShadow: "var(--shadow-card)" }}
            >
              {text}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
