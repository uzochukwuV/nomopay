"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { computeFeeBreakdown, formatCents } from "../../lib/fees";

type ProductInput = {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: "usd" | "eur";
  commissionRate: number;
  imageUrl?: string | null;
  slug: string;
  status?: "active" | "paused" | "archived";
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function ProductForm({ mode, initial }: { mode: "create" | "edit"; initial?: ProductInput }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(((initial?.price ?? 1000) / 100).toFixed(2));
  const [currency, setCurrency] = useState<"usd" | "eur">(initial?.currency ?? "usd");
  const [commissionRate, setCommissionRate] = useState(String(initial?.commissionRate ?? 15));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [status, setStatus] = useState<ProductInput["status"]>(initial?.status ?? "active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const priceCents = Math.max(0, Math.round(Number(price || 0) * 100));
  const rate = Math.min(80, Math.max(0, Number(commissionRate || 0)));
  const fees = useMemo(() => computeFeeBreakdown(priceCents, rate), [priceCents, rate]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const body = {
        title,
        description,
        price: priceCents,
        currency,
        commissionRate: rate,
        imageUrl: imageUrl.trim() || undefined,
        slug: slug || slugify(title),
        status,
      };
      const res = await fetch(mode === "create" ? "/api/products" : `/api/products/${initial?.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.code === "ONBOARDING_INCOMPLETE" ? "Complete Stripe onboarding before creating products." : data.error?.message ?? data.error ?? "Could not save product.");
        return;
      }
      router.push("/dashboard/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Product name</span>
          <input value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} className="mt-2 w-full rounded-xl px-4 py-3 border" required />
        </label>
        <label className="block">
          <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Slug</span>
          <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="mt-2 w-full rounded-xl px-4 py-3 border" required />
        </label>
        <label className="block">
          <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-xl px-4 py-3 border min-h-32" required />
        </label>
        <label className="block">
          <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Image URL</span>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-2 w-full rounded-xl px-4 py-3 border" placeholder="https://..." />
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Price</span>
            <input type="number" min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full rounded-xl px-4 py-3 border" required />
          </label>
          <label className="block">
            <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as "usd" | "eur")} className="mt-2 w-full rounded-xl px-4 py-3 border">
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Commission %</span>
            <input type="number" min="0" max="80" step="0.5" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} className="mt-2 w-full rounded-xl px-4 py-3 border" required />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-bold" style={{ color: "var(--midnight)" }}>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProductInput["status"])} className="mt-2 w-full rounded-xl px-4 py-3 border">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        {error && <p className="rounded-xl p-3 text-sm font-bold" style={{ background: "#fff0f0", color: "#8a2020" }}>{error}</p>}
        <button disabled={saving} className="rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60" style={{ background: "var(--midnight)" }}>
          {saving ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
      <aside className="rounded-2xl p-5 h-fit" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-bold mb-4" style={{ color: "var(--midnight)" }}>Payout math</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span>Buyer pays</span><strong>{formatCents(fees.gross)}</strong></div>
          <div className="flex justify-between"><span>Platform fee</span><strong>{formatCents(fees.platformFee)}</strong></div>
          <div className="flex justify-between"><span>Affiliate earns</span><strong>{formatCents(fees.affiliateCommission)}</strong></div>
          <div className="flex justify-between pt-3 border-t"><span>You receive</span><strong style={{ color: "var(--earn)" }}>{formatCents(fees.merchantPayout)}</strong></div>
        </div>
      </aside>
    </form>
  );
}

