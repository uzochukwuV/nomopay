"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface BuyButtonProps {
  productId: string;
  price: number;
  currency: string;
  productSlug: string;
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function BuyButton({ productId, price, currency, productSlug }: BuyButtonProps) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track click when component mounts with a refCode
  useEffect(() => {
    if (!refCode) return;
    const referrer = document.referrer || undefined;
    fetch("/api/analytics/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refCode, referrer }),
    }).catch(() => {});
  }, [refCode]);

  async function handleBuy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, refCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: loading ? "var(--graphite)" : "var(--midnight)",
          fontSize: "1rem",
          letterSpacing: "-0.01em",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting…
          </span>
        ) : (
          `Buy Now — ${formatPrice(price, currency)}`
        )}
      </button>
      {error && (
        <p className="text-sm text-center font-medium" style={{ color: "var(--accent)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
