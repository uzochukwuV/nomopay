"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

interface AffiliateLink {
  id: string;
  refCode: string;
  customLabel: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    commissionRate: string;
    currency: string;
    status: string;
    merchant: { name: string };
  };
  _count: { clicks: number; transactions: number };
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatEarned(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function conversionColor(rate: number) {
  if (rate >= 3) return "var(--earn)";
  if (rate >= 1) return "var(--sun)";
  return "var(--accent)";
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function LinkCard({ link, token }: { link: AffiliateLink; token: string }) {
  const [copied, setCopied] = useState(false);
  const [totalEarned, setTotalEarned] = useState<number | null>(null);

  const url = `${window.location.origin}/p/${link.product.slug}?ref=${link.refCode}`;
  const clicks = link._count.clicks;
  const conversions = link._count.transactions;
  const rate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const commissionRate = parseFloat(link.product.commissionRate);
  const commissionPerSale = (link.product.price * commissionRate) / 100;

  // Fetch total earned for this link
  useEffect(() => {
    fetch(`/api/affiliate-links/${link.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setTotalEarned(d.totalEarned ?? 0))
      .catch(() => setTotalEarned(0));
  }, [link.id, token]);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({ url, title: link.product.title });
    } else {
      copyLink();
    }
  }

  // Projected earnings insight
  const projectedClicks = 200;
  const projectedEarnings = (projectedClicks * (rate / 100) * commissionPerSale) / 100;

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Product image placeholder */}
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden"
          style={{ background: "var(--stone)" }}
        >
          {link.product.status !== "active" && (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: "var(--ash)" }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm truncate" style={{ color: "var(--midnight)" }}>
              {link.product.title}
            </h3>
            {link.product.status !== "active" && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#fff7e0", color: "#92650a" }}
              >
                Paused
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--ash)" }}>
            {link.product.merchant.name} · {formatPrice(link.product.price, link.product.currency)} ·{" "}
            <span style={{ color: "var(--earn)", fontWeight: 600 }}>
              {commissionRate}% commission
            </span>
          </p>
        </div>
      </div>

      {/* Link + copy */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: "var(--stone)" }}
      >
        <span className="text-xs font-medium flex-1 truncate" style={{ color: "var(--graphite)" }}>
          {url}
        </span>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: copied ? "var(--earn)" : "var(--midnight)",
            color: "#fff",
          }}
        >
          <CopyIcon />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Clicks", value: clicks.toLocaleString() },
          { label: "Sales", value: conversions.toLocaleString() },
          {
            label: "Earned",
            value:
              totalEarned !== null
                ? formatEarned(totalEarned, link.product.currency)
                : "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-lg font-bold" style={{ color: "var(--midnight)" }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "var(--ash)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Conversion rate */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--ash)" }}>
          Conversion rate
        </span>
        <span
          className="text-sm font-bold"
          style={{ color: conversionColor(rate) }}
        >
          {rate.toFixed(1)}%
        </span>
      </div>

      {/* Insight line */}
      {clicks > 0 && rate > 0 && (
        <p className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: "var(--parchment)", color: "var(--graphite)" }}>
          At your current {rate.toFixed(1)}% rate, {projectedClicks} more clicks would earn you{" "}
          <strong style={{ color: "var(--earn)" }}>
            {formatEarned(Math.round(projectedEarnings * 100), link.product.currency)}
          </strong>
          .
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={shareLink}
          className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "var(--stone)", color: "var(--graphite)" }}
        >
          <ShareIcon />
          Share
        </button>
      </div>
    </div>
  );
}

export default function LinksPage() {
  const { getToken } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const t = await getToken();
      if (!t) return;
      setToken(t);
      const res = await fetch("/api/affiliate-links", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setLinks(data.links ?? []);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
            My Links
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>
            {links.length} active affiliate link{links.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/dashboard/discover"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          + Find products
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-20" style={{ color: "var(--ash)" }}>
          <Spinner />
        </div>
      ) : links.length === 0 ? (
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
          <h2 className="font-bold text-lg mb-2" style={{ color: "var(--midnight)" }}>
            No links yet
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--ash)", maxWidth: "280px", margin: "0 auto 1.5rem" }}>
            Browse the marketplace to find products and generate your first affiliate link.
          </p>
          <a
            href="/dashboard/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--midnight)", color: "#fff" }}
          >
            Browse products
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
