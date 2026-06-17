"use client";

import { useCallback, useEffect, useState } from "react";
import { useSafeAuth } from "@/app/lib/use-safe-clerk";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  commissionRate: string;
  status: "active" | "paused" | "archived";
  _count: { affiliateLinks: number; transactions: number };
};

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}
export default function ProductsPage() {
  const { getToken } = useSafeAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch("/api/products?limit=100", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      const token = await getToken();
      if (!token || cancelled) return;
      const res = await fetch("/api/products?limit=100", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (cancelled) return;
      setProducts(data.products ?? []);
      setLoading(false);
    }
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  async function updateStatus(product: Product, status: Product["status"]) {
    const token = await getToken();
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>Products</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>Manage buyer pages, commissions, and product availability.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/ai-import" className="text-sm font-bold px-4 py-2.5 rounded-xl" style={{ background: "var(--stone)", color: "var(--midnight)" }}>AI import</Link>
          <Link href="/dashboard/products/new" className="text-sm font-bold px-4 py-2.5 rounded-xl text-white" style={{ background: "var(--accent)" }}>Add product</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--ash)" }}>Loading products...</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl p-16 text-center border-dashed border-2" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="font-semibold mb-1" style={{ color: "var(--midnight)" }}>No products yet</h3>
          <p className="text-sm mb-6" style={{ color: "var(--ash)" }}>Add manually or let AI prefill a draft catalog for review.</p>
          <Link href="/dashboard/ai-import" className="inline-flex text-white text-sm font-bold px-5 py-2.5 rounded-xl" style={{ background: "var(--midnight)" }}>Start with AI import</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--stone)" }}>
                {["Product", "Price", "Commission", "Affiliates", "Sales", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: "var(--ash)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const rate = Number(product.commissionRate);
                const commission = Math.round(product.price * (rate / 100));
                return (
                  <tr key={product.id} style={{ background: index % 2 ? "var(--parchment)" : "var(--card)", borderTop: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3">
                      <div className="font-bold" style={{ color: "var(--midnight)" }}>{product.title}</div>
                      <Link href={`/p/${product.slug}`} className="text-xs underline" style={{ color: "var(--accent)" }}>/{product.slug}</Link>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCents(product.price, product.currency)}</td>
                    <td className="px-4 py-3">{rate}% · {formatCents(commission, product.currency)}</td>
                    <td className="px-4 py-3">{product._count.affiliateLinks}</td>
                    <td className="px-4 py-3">{product._count.transactions}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: product.status === "active" ? "#eefaf2" : "#fff7e0", color: product.status === "active" ? "#16602b" : "#92650a" }}>{product.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/products/${product.id}/edit`} className="text-xs font-bold underline">Edit</Link>
                        {product.status === "active" ? (
                          <button onClick={() => updateStatus(product, "paused")} className="text-xs font-bold underline">Pause</button>
                        ) : (
                          <button onClick={() => updateStatus(product, "active")} className="text-xs font-bold underline">Activate</button>
                        )}
                        <button onClick={() => updateStatus(product, "archived")} className="text-xs font-bold underline" style={{ color: "#8a2020" }}>Archive</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
