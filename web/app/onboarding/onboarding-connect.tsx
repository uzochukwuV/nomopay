"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingConnect({ isBoth }: { isBoth: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleConnect() {
    setIsLoading(true);
    // TODO: Call POST /api/connect/onboard → redirect to Stripe Account Link URL
    // For now, simulate the redirect back from Stripe and go to success
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push("/onboarding/success");
  }

  return (
    <div className="w-full max-w-md">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-accent" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Connect your payment account
        </h1>
        <p className="text-gray-500 leading-relaxed">
          To receive{" "}
          {isBoth
            ? "product revenue and affiliate commissions"
            : "revenue from your product sales"}
          , connect your Stripe account. This takes about 2 minutes.
        </p>
      </div>

      {/* What you'll need */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-4">
          You&apos;ll need:
        </p>
        <ul className="space-y-3">
          {[
            "A valid government-issued ID",
            "Your bank account details (for payouts)",
            "Business information if applicable",
            "About 2–3 minutes",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-accent shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Commission hold notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>7-day commission hold:</strong> Commissions are held for 7 days
          before being released to your bank — this protects against refunds. You can
          see your pending balance in your dashboard at any time.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base shadow-sm"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting to Stripe…
          </>
        ) : (
          <>
            <StripeIcon />
            Connect with Stripe
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
        You&apos;ll be redirected to Stripe&apos;s secure onboarding page. Your
        information is encrypted and handled by Stripe, not stored on our servers.
      </p>
    </div>
  );
}

function StripeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}
