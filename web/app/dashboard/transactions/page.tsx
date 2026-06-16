"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface Transaction {
  id: string;
  grossAmount: number;
  merchantPayout: number;
  affiliateCommission: number;
  platformFee: number;
  currency: string;
  status: string;
  buyerEmail: string | null;
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

function statusBadge(status: string) {
  switch (status) {
    case "paid":
      return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#eefaf2", color: "#16602b" }}>Paid</span>;
    case "pending":
      return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff7e0", color: "#92650a" }}>Pending</span>;
    case "refunded":
      return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff0f0", color: "#8a2020" }}>Refunded</span>;
    default:
      return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--stone)", color: "var(--ash)" }}>{status}</span>;
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

export default function TransactionsPage() {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/analytics/transactions?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      setLoading(false);
    }
    load();
  }, [getToken]);

  const totalRevenue = transactions.filter((t) => t.status === "paid").reduce((s, t) => s + t.grossAmount, 0);
  const currency = transactions[0]?.currency ?? "usd";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>
            All sales through your products
          </p>
        </div>
        {transactions.length > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
              {formatCents(totalRevenue, currency)}
            </div>
            <div className="text-xs" style={{ color: "var(--ash)" }}>Total revenue</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20" style={{ color: "var(--ash)" }}><Spinner /></div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl p-16 text-center border-dashed border-2" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="font-bold mb-1" style={{ color: "var(--midnight)" }}>No transactions yet</p>
          <p className="text-sm" style={{ color: "var(--ash)" }}>Sales will appear here once buyers purchase through your products.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--stone)" }}>
                {["Date", "Product", "Gross", "Your payout", "Commission", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: "var(--ash)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--parchment)", borderTop: "1px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--graphite)" }}>
                    {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--midnight)" }}>{t.product.title}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--midnight)" }}>{formatCents(t.grossAmount, t.currency)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--earn)" }}>{formatCents(t.merchantPayout, t.currency)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--ash)" }}>
                    {t.affiliateLink ? `${formatCents(t.affiliateCommission, t.currency)} (ref: ${t.affiliateLink.refCode})` : "—"}
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
