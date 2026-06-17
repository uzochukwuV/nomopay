"use client";

import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
      <div className="text-xs font-medium mb-2" style={{ color: "var(--ash)" }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: "var(--ash)" }}>{sub}</div>
    </div>
  );
}

function MerchantOverview() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalMerchantPayout: number;
    totalCommissionsPaid: number;
    currentRevenue: number;
    previousRevenue: number;
    revenueDeltaPct: number | null;
    activeProducts: number;
    pausedProducts: number;
    activeAffiliateLinks: number;
    transactionCount: number;
    products: { id: string; title: string; status: string; _count: { affiliateLinks: number; transactions: number } }[];
    recentSales: {
      id: string;
      grossAmount: number;
      merchantPayout: number;
      currency: string;
      createdAt: string;
      product: { title: string };
      affiliate?: { name: string } | null;
      affiliateLink?: { refCode: string } | null;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch("/api/analytics/merchant", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      const token = await getToken();
      if (!token || cancelled) return;
      const res = await fetch("/api/analytics/merchant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (cancelled) return;
      setStats(data);
      setLoading(false);
    }
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let source: EventSource | null = null;
    async function connect() {
      const token = await getToken();
      if (!token) return;
      source = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);
      source.addEventListener("transaction.created", refreshStats);
      source.addEventListener("transaction.refunded", refreshStats);
      source.addEventListener("transaction.shipped", refreshStats);
      source.addEventListener("product.updated", refreshStats);
      source.onerror = () => {
        source?.close();
        timer = setInterval(refreshStats, 60000);
      };
    }
    connect();
    return () => {
      source?.close();
      if (timer) clearInterval(timer);
    };
  }, [getToken, refreshStats]);

  const activeAffiliates = stats?.activeAffiliateLinks ?? 0;
  const delta = stats?.revenueDeltaPct;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>Overview</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>Your merchant dashboard</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          style={{ background: "var(--accent)" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12" style={{ color: "var(--ash)" }}><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total revenue" value={formatCents(stats?.totalRevenue ?? 0)} sub="All time" />
            <StatCard label="Your payout" value={formatCents(stats?.totalMerchantPayout ?? 0)} sub="After fees & commissions" />
            <StatCard label="Commissions paid" value={formatCents(stats?.totalCommissionsPaid ?? 0)} sub="To affiliates" />
            <StatCard label="Active affiliates" value={String(activeAffiliates)} sub="Promoting your products" />
          </div>
          <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mb-8">
            <div className="rounded-2xl p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
              <h2 className="font-bold mb-4" style={{ color: "var(--midnight)" }}>Last 30 days</h2>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-3xl font-bold" style={{ color: "var(--midnight)" }}>{formatCents(stats?.currentRevenue ?? 0)}</div>
                  <div className="text-xs mt-1" style={{ color: "var(--ash)" }}>Previous: {formatCents(stats?.previousRevenue ?? 0)}</div>
                </div>
                <span className="text-sm font-bold" style={{ color: delta == null || delta >= 0 ? "var(--earn)" : "#8a2020" }}>
                  {delta == null ? "New" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
                </span>
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
              <h2 className="font-bold mb-4" style={{ color: "var(--midnight)" }}>Catalog health</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <StatCard label="Active" value={String(stats?.activeProducts ?? 0)} sub="Products" />
                <StatCard label="Paused" value={String(stats?.pausedProducts ?? 0)} sub="Products" />
                <StatCard label="Sales" value={String(stats?.transactionCount ?? 0)} sub="Orders" />
              </div>
            </div>
          </div>

          {(stats?.recentSales?.length ?? 0) > 0 && (
            <div className="rounded-2xl p-5 mb-8" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold" style={{ color: "var(--midnight)" }}>Recent sales</h2>
                <Link href="/dashboard/transactions" className="text-sm font-bold" style={{ color: "var(--accent)" }}>View all</Link>
              </div>
              <div className="space-y-3">
                {stats?.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between gap-4 rounded-xl p-3" style={{ background: "var(--stone)" }}>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--midnight)" }}>{sale.product.title}</div>
                      <div className="text-xs" style={{ color: "var(--ash)" }}>
                        {sale.affiliate ? `Affiliate: ${sale.affiliate.name}` : "Direct sale"} {sale.affiliateLink ? `· ${sale.affiliateLink.refCode}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCents(sale.grossAmount)}</div>
                      <div className="text-xs" style={{ color: "var(--earn)" }}>Payout {formatCents(sale.merchantPayout)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(stats?.products.length ?? 0) === 0 && (
            <div
              className="rounded-2xl p-16 text-center border-dashed border-2"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--stone)" }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7" style={{ color: "var(--ash)" }}>
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--midnight)" }}>No products yet</h3>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "var(--ash)" }}>
                Add your first product and start getting affiliates to promote it.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                  style={{ background: "var(--accent)" }}
                >
                  Add your first product →
                </Link>
                <span className="text-xs font-medium" style={{ color: "var(--ash)" }}>or</span>
                <Link
                  href="/dashboard/ai-import"
                  className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                  style={{ background: "var(--midnight)" }}
                >
                  AI Import Products
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AffiliateOverview() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<{
    totalEarned: number;
    totalClicks: number;
    totalConversions: number;
    conversionRate: string;
    links: { id: string; product: { title: string; slug: string } }[];
  } | null>(null);
  const [user, setUser] = useState<{ stripeOnboardingComplete: boolean; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      const [statsRes, meRes] = await Promise.all([
        fetch("/api/analytics/affiliate", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(await statsRes.json());
      setUser(await meRes.json());
      setLoading(false);
    }
    load();
  }, [getToken]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
            Hey {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>Here&apos;s how your links are doing</p>
        </div>
        <Link
          href="/dashboard/discover"
          className="text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          style={{ background: "var(--accent)" }}
        >
          + Find products
        </Link>
      </div>

      {/* Stripe onboarding nudge */}
      {user && !user.stripeOnboardingComplete && (
        <div
          className="flex items-center justify-between gap-4 p-4 rounded-2xl mb-6"
          style={{ background: "#fff7e0", border: "1px solid #f5d56b" }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "#92650a" }}>Set up your payout account</p>
            <p className="text-xs mt-0.5" style={{ color: "#b5820c" }}>
              Connect Stripe to receive your commissions — only takes 2 minutes.
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

      {loading ? (
        <div className="flex justify-center py-12" style={{ color: "var(--ash)" }}><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total earned" value={formatCents(stats?.totalEarned ?? 0)} sub="All time" />
            <StatCard label="Total clicks" value={(stats?.totalClicks ?? 0).toLocaleString()} sub="Across all links" />
            <StatCard label="Conversions" value={(stats?.totalConversions ?? 0).toLocaleString()} sub="Sales driven" />
            <StatCard label="Conversion rate" value={`${stats?.conversionRate ?? "0.0"}%`} sub="Clicks to sales" />
          </div>

          {(stats?.links.length ?? 0) === 0 ? (
            <div
              className="rounded-2xl p-16 text-center border-dashed border-2"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--stone)" }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7" style={{ color: "var(--ash)" }}>
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--midnight)" }}>
                Find your first product to promote
              </h3>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "var(--ash)" }}>
                Browse the marketplace, generate a link, and start earning commissions on every sale.
              </p>
              <Link
                href="/dashboard/discover"
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: "var(--midnight)" }}
              >
                Browse products →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm" style={{ color: "var(--midnight)" }}>Recent links</h2>
                <Link href="/dashboard/links" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  View all →
                </Link>
              </div>
              {stats?.links.slice(0, 3).map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--midnight)" }}>
                    {link.product.title}
                  </span>
                  <Link
                    href="/dashboard/links"
                    className="text-xs font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function loadRole() {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRole(data.role ?? "merchant");
    }
    loadRole();
  }, [getToken]);

  if (role === null) {
    return (
      <div className="flex justify-center py-20" style={{ color: "var(--ash)" }}>
        <Spinner />
      </div>
    );
  }

  if (role === "affiliate") return <AffiliateOverview />;
  return <MerchantOverview />;
}
