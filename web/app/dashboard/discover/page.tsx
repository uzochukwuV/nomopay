"use client";

import { useState, useEffect } from "react";
import { useSafeAuth } from "@/app/lib/use-safe-clerk";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  commissionRate: string;
  imageUrl: string | null;
  slug: string;
  status: string;
  merchant: { name: string; slug: string };
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function commissionDollars(price: number, rate: string) {
  return (price * parseFloat(rate)) / 100;
}

function Spinner({ size = 5 }: { size?: number }) {
  return (
    <svg className={`animate-spin w-${size} h-${size}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function GenerateLinkModal({
  product,
  onClose,
  token,
}: {
  product: Product;
  onClose: () => void;
  token: string;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [captionPlatform, setCaptionPlatform] = useState<"instagram" | "whatsapp">("instagram");

  useEffect(() => {
    async function generate() {
      const res = await fetch("/api/affiliate-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (data.url) {
        setLink(data.url);
      }
      setLoading(false);
    }
    generate();
  }, [product.id, token]);

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const captions = {
    instagram: `I just discovered ${product.title} by ${product.merchant.name} and it's incredible!\n\nGrab yours here: ${link ?? "…"}\n\n#affiliate #${product.merchant.slug}`,
    whatsapp: `Hey! Check out ${product.title} by ${product.merchant.name} — I think you'd love it!\n\n${link ?? "…"}`,
  };

  function copyCaption() {
    navigator.clipboard.writeText(captions[captionPlatform]);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(18,18,18,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 space-y-5"
        style={{ background: "var(--card)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-base" style={{ color: "var(--midnight)" }}>
              Your affiliate link
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--ash)" }}>
              {product.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "var(--stone)", color: "var(--ash)" }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8" style={{ color: "var(--ash)" }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* Link */}
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "var(--stone)" }}
            >
              <span className="text-xs font-medium flex-1 truncate" style={{ color: "var(--graphite)" }}>
                {link}
              </span>
              <button
                onClick={copyLink}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{
                  background: copied ? "var(--earn)" : "var(--midnight)",
                  color: "#fff",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Commission highlight */}
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "#eefaf2" }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: "#4a7c59" }}>
                  Your commission per sale
                </p>
                <p className="text-xl font-bold mt-0.5" style={{ color: "#16602b" }}>
                  {formatCents(commissionDollars(product.price, product.commissionRate), product.currency)}
                </p>
              </div>
              <p className="text-xs text-right" style={{ color: "#4a7c59", maxWidth: "100px" }}>
                At platform avg 2.1% conversion, 100 clicks ≈{" "}
                <strong>
                  {formatCents(
                    Math.round(commissionDollars(product.price, product.commissionRate) * 0.021),
                    product.currency
                  )}
                </strong>
              </p>
            </div>

            {/* Caption generator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold" style={{ color: "var(--ash)" }}>
                  Ready-to-post caption
                </p>
                <div className="flex gap-1">
                  {(["instagram", "whatsapp"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCaptionPlatform(p)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                      style={{
                        background: captionPlatform === p ? "var(--midnight)" : "var(--stone)",
                        color: captionPlatform === p ? "#fff" : "var(--graphite)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="p-3 rounded-xl text-xs leading-relaxed font-medium whitespace-pre-wrap"
                style={{ background: "var(--parchment)", color: "var(--graphite)" }}
              >
                {captions[captionPlatform]}
              </div>
              <button
                onClick={copyCaption}
                className="w-full text-xs font-bold py-2 rounded-xl"
                style={{ background: "var(--stone)", color: "var(--graphite)" }}
              >
                Copy caption
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onGenerate,
}: {
  product: Product;
  onGenerate: (p: Product) => void;
}) {
  const commissionAmt = commissionDollars(product.price, product.commissionRate);
  const estimatedEarnings = commissionAmt * 0.021; // platform avg 2.1% conversion

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Image */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ height: "160px", background: "var(--stone)" }}
      >
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-1">
        <p className="text-xs" style={{ color: "var(--ash)" }}>
          {product.merchant.name}
        </p>
        <h3 className="font-bold text-sm leading-tight" style={{ color: "var(--midnight)" }}>
          {product.title}
        </h3>
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--graphite)" }}>
          {product.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: "var(--midnight)" }}>
          {formatCents(product.price, product.currency)}
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--earn)" }}>
          +{formatCents(commissionAmt, product.currency)} / sale
        </span>
      </div>

      {/* Estimated */}
      <p className="text-xs" style={{ color: "var(--ash)" }}>
        Est.{" "}
        <span style={{ color: "var(--earn)", fontWeight: 600 }}>
          {formatCents(estimatedEarnings, product.currency)}
        </span>{" "}
        per 100 clicks (platform avg 2.1% conversion)
      </p>

      <button
        onClick={() => onGenerate(product)}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-colors"
        style={{ background: "var(--midnight)", color: "#fff" }}
      >
        Generate Link
      </button>
    </div>
  );
}

export default function DiscoverPage() {
  const { getToken } = useSafeAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        const t = await getToken();
        if (!t || cancelled) return;
        setToken(t);
        const res = await fetch("/api/products?view=marketplace&limit=50", {
          headers: { Authorization: `Bearer ${t}` },
        });
        const data = await res.json();
        const sorted = (data.products ?? []).sort(
          (a: Product, b: Product) =>
            commissionDollars(b.price, b.commissionRate) -
            commissionDollars(a.price, a.commissionRate)
        );
        if (!cancelled) setProducts(sorted);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.merchant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
          Discover Products
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>
          Sorted by commission earned per sale
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or merchants…"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: "var(--stone)", color: "var(--midnight)" }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20" style={{ color: "var(--ash)" }}>
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--ash)" }}>
          <p className="font-semibold">No products found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onGenerate={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <GenerateLinkModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          token={token}
        />
      )}
    </div>
  );
}
