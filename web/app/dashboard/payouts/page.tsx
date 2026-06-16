"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface Transaction {
  id: string;
  grossAmount: number;
  affiliateCommission: number;
  currency: string;
  status: string;
  createdAt: string;
  product: { title: string; slug: string };
  affiliateLink: { refCode: string; customLabel: string | null } | null;
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function releaseDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusBadge(status: string) {
  switch (status) {
    case "paid":
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#eefaf2", color: "#16602b" }}>
          Paid
        </span>
      );
    case "pending":
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff7e0", color: "#92650a" }}>
          Pending
        </span>
      );
    case "refunded":
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff0f0", color: "#8a2020" }}>
          Refunded
        </span>
      );
    default:
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--stone)", color: "var(--ash)" }}>
          {status}
        </span>
      );
  }
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function PayoutsPage() {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeReady, setStripeReady] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;

      const [txRes, meRes] = await Promise.all([
        fetch("/api/analytics/transactions?role=affiliate&limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const txData = await txRes.json();
      const meData = await meRes.json();

      setTransactions(txData.transactions ?? []);
      setStripeReady(meData.stripeOnboardingComplete ?? false);
      setLoading(false);
    }
    load();
  }, [getToken]);

  const lifetimeEarned = transactions
    .filter((t) => t.status === "paid")
    .reduce((s, t) => s + t.affiliateCommission, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((s, t) => s + t.affiliateCommission, 0);

  const currency = transactions[0]?.currency ?? "usd";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--midnight)" }}>
        Payouts
      </h1>

      {/* Stripe nudge */}
      {stripeReady === false && (
        <div
          className="flex items-center justify-between gap-4 p-4 rounded-2xl mb-6"
          style={{ background: "#fff7e0", border: "1px solid #f5d56b" }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "#92650a" }}>
              Connect your payout account
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#b5820c" }}>
              {pendingAmount > 0
                ? `You have ${formatCents(pendingAmount, currency)} waiting — complete Stripe onboarding to receive it.`
                : "Complete Stripe onboarding to receive commissions."}
            </p>
          </div>
          <Link
            href="/onboarding?role=affiliate"
            className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: "#92650a", color: "#fff" }}
          >
            Connect →
          </Link>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
          <div className="text-xs font-medium mb-2" style={{ color: "var(--ash)" }}>Lifetime earned</div>
          <div className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
            {formatCents(lifetimeEarned, currency)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--ash)" }}>All time</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
          <div className="text-xs font-medium mb-2" style={{ color: "var(--ash)" }}>Pending</div>
          <div className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
            {formatCents(pendingAmount, currency)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--ash)" }}>7-day hold</div>
        </div>
      </div>

      {/* Transaction table */}
      {loading ? (
        <div className="flex justify-center py-20" style={{ color: "var(--ash)" }}>
          <Spinner />
        </div>
      ) : transactions.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center border-dashed border-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="font-bold mb-1" style={{ color: "var(--midnight)" }}>No earnings yet</p>
          <p className="text-sm" style={{ color: "var(--ash)" }}>
            Commissions appear here after your links drive sales.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--stone)" }}>
                {["Date", "Product", "Commission", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold"
                    style={{ color: "var(--ash)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    background: i % 2 === 0 ? "var(--card)" : "var(--parchment)",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <td className="px-4 py-3" style={{ color: "var(--graphite)" }}>
                    <div>{new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    {t.status === "pending" && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--ash)" }}>
                        Releases {releaseDate(t.createdAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: "var(--midnight)" }}>
                      {t.product.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--earn)" }}>
                    +{formatCents(t.affiliateCommission, t.currency)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
