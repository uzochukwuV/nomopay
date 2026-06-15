"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type ShopifyProduct = {
  shopifyId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  currency: string;
};

type SelectedProduct = ShopifyProduct & {
  commissionRate: number;
  enhancing: boolean;
};

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
      style={{
        background: done ? "var(--accent)" : active ? "var(--midnight)" : "var(--parchment)",
        color: done || active ? "#fff" : "var(--graphite)",
        border: active ? "none" : done ? "none" : "1.5px solid var(--graphite)",
      }}
    >
      {done ? (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5z" />
        </svg>
      ) : (
        n
      )}
    </div>
  );
}

export default function ShopifyImportPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [shopUrl, setShopUrl] = useState("");
  const [storefrontToken, setStorefrontToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [previewProducts, setPreviewProducts] = useState<SelectedProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [importResult, setImportResult] = useState<{
    imported: number;
    total: number;
  } | null>(null);

  async function authFetch(path: string, body: object) {
    const token = await getToken();
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return res;
  }

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authFetch("/api/shopify/preview", { shopUrl, storefrontToken });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch products");
        return;
      }
      const products: SelectedProduct[] = (data.products as ShopifyProduct[]).map((p) => ({
        ...p,
        commissionRate: 15,
        enhancing: false,
      }));
      setPreviewProducts(products);
      setSelected(new Set(products.map((p) => p.shopifyId)));
      setStep(2);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateCommission(shopifyId: string, rate: number) {
    setPreviewProducts((prev) =>
      prev.map((p) => (p.shopifyId === shopifyId ? { ...p, commissionRate: rate } : p))
    );
  }

  function updateDescription(shopifyId: string, description: string) {
    setPreviewProducts((prev) =>
      prev.map((p) => (p.shopifyId === shopifyId ? { ...p, description } : p))
    );
  }

  async function handleEnhance(shopifyId: string) {
    const product = previewProducts.find((p) => p.shopifyId === shopifyId);
    if (!product) return;

    setPreviewProducts((prev) =>
      prev.map((p) => (p.shopifyId === shopifyId ? { ...p, enhancing: true } : p))
    );

    try {
      const res = await authFetch("/api/shopify/enhance", {
        title: product.title,
        description: product.description,
      });
      const data = await res.json();
      if (res.ok && data.enhanced) {
        updateDescription(shopifyId, data.enhanced);
      }
    } finally {
      setPreviewProducts((prev) =>
        prev.map((p) => (p.shopifyId === shopifyId ? { ...p, enhancing: false } : p))
      );
    }
  }

  async function handleImport() {
    setError("");
    setLoading(true);
    const toImport = previewProducts.filter((p) => selected.has(p.shopifyId));

    try {
      const res = await authFetch("/api/shopify/import", {
        products: toImport.map((p) => ({
          title: p.title,
          description: p.description,
          price: p.price,
          commissionRate: p.commissionRate,
          imageUrl: p.imageUrl ?? undefined,
        })),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }
      setImportResult({ imported: data.imported, total: data.total });
      setStep(3);
    } catch {
      setError("Network error during import. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedCount = selected.size;
  const totalPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div style={{ fontFamily: "var(--font-inter, sans-serif)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              color: "var(--midnight)",
            }}
          >
            Import from Shopify
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--graphite)" }}>
            Pull your Shopify products in and let AI write affiliate-ready descriptions.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: "Connect store" },
          { n: 2, label: "Select & enhance" },
          { n: 3, label: "Done" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <StepDot n={s.n} active={step === s.n} done={step > s.n} />
              <span
                className="text-sm font-semibold hidden sm:block"
                style={{ color: step === s.n ? "var(--midnight)" : "var(--graphite)" }}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className="w-8 h-px" style={{ background: "var(--parchment)", opacity: 0.6 }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Connect */}
      {step === 1 && (
        <div
          className="rounded-3xl p-8 max-w-lg"
          style={{ background: "var(--parchment)" }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "var(--sun)" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: "var(--midnight)" }}>
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--midnight)" }}>
            Connect your Shopify store
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--graphite)" }}>
            You&apos;ll need a Storefront API access token. In Shopify admin, go to{" "}
            <strong>Apps → Develop apps → Your app → API credentials</strong>.
          </p>

          <form onSubmit={handlePreview} className="flex flex-col gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold" style={{ color: "var(--graphite)" }}>
                Store URL
              </span>
              <input
                type="text"
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
                placeholder="my-store.myshopify.com"
                required
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
                style={{
                  background: "#fff",
                  color: "var(--midnight)",
                  border: "1.5px solid transparent",
                }}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold" style={{ color: "var(--graphite)" }}>
                Storefront Access Token
              </span>
              <input
                type="password"
                value={storefrontToken}
                onChange={(e) => setStorefrontToken(e.target.value)}
                placeholder="shpat_xxxxxxxxxxxxxxxx"
                required
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
                style={{
                  background: "#fff",
                  color: "var(--midnight)",
                }}
              />
            </label>

            {error && (
              <div
                className="px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "#fff0f0", color: "#8a2020" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ background: "var(--midnight)" }}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Fetching products…
                </>
              ) : (
                "Fetch products →"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Select & Enhance */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--midnight)" }}>
                {previewProducts.length} products found — {selectedCount} selected
              </p>
              <p className="text-xs" style={{ color: "var(--graphite)" }}>
                Click a product to toggle selection. Use ✦ AI to enhance descriptions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors hover:bg-gray-50"
                style={{ borderColor: "var(--parchment)", color: "var(--graphite)" }}
              >
                ← Back
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: "var(--midnight)" }}
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    Importing…
                  </>
                ) : (
                  `Import ${selectedCount} product${selectedCount !== 1 ? "s" : ""} →`
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-2xl text-sm font-semibold mb-4"
              style={{ background: "#fff0f0", color: "#8a2020" }}
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {previewProducts.map((p) => {
              const isSelected = selected.has(p.shopifyId);
              return (
                <div
                  key={p.shopifyId}
                  className="rounded-3xl overflow-hidden transition-all cursor-pointer"
                  style={{
                    background: isSelected ? "var(--parchment)" : "#f5f5f0",
                    border: isSelected
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    opacity: isSelected ? 1 : 0.6,
                  }}
                  onClick={() => toggleSelect(p.shopifyId)}
                >
                  {/* Product image */}
                  {p.imageUrl ? (
                    <div className="h-36 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-36 flex items-center justify-center"
                      style={{ background: "var(--canvas)" }}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8" style={{ color: "var(--graphite)", opacity: 0.3 }}>
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className="font-semibold text-sm leading-tight"
                        style={{ color: "var(--midnight)" }}
                      >
                        {p.title}
                      </h3>
                      <span
                        className="text-sm font-bold shrink-0"
                        style={{ color: "var(--accent)" }}
                      >
                        {totalPrice(p.price)}
                      </span>
                    </div>

                    <p
                      className="text-xs leading-relaxed mb-3 line-clamp-3"
                      style={{ color: "var(--graphite)" }}
                    >
                      {p.description}
                    </p>

                    {/* Commission rate */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold" style={{ color: "var(--graphite)" }}>
                        Commission
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={80}
                        value={p.commissionRate}
                        onChange={(e) =>
                          updateCommission(
                            p.shopifyId,
                            Math.min(80, Math.max(0, Number(e.target.value)))
                          )
                        }
                        className="w-16 px-2 py-1 rounded-lg text-xs font-bold text-center outline-none"
                        style={{ background: "#fff", color: "var(--midnight)" }}
                      />
                      <span className="text-xs font-semibold" style={{ color: "var(--graphite)" }}>
                        %
                      </span>
                    </div>

                    {/* AI Enhance button */}
                    <button
                      onClick={() => handleEnhance(p.shopifyId)}
                      disabled={p.enhancing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                      style={{
                        background: "var(--sun)",
                        color: "var(--midnight)",
                      }}
                    >
                      {p.enhancing ? (
                        <>
                          <SpinnerIcon />
                          Enhancing…
                        </>
                      ) : (
                        <>
                          ✦ AI Enhance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ background: "var(--midnight)" }}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Importing…
                </>
              ) : (
                `Import ${selectedCount} product${selectedCount !== 1 ? "s" : ""} →`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && importResult && (
        <div
          className="rounded-3xl p-12 max-w-md text-center"
          style={{ background: "var(--parchment)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--accent)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2
            className="text-2xl font-medium mb-2 tracking-tight"
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              color: "var(--midnight)",
            }}
          >
            Import complete
          </h2>
          <p className="text-sm mb-2" style={{ color: "var(--graphite)" }}>
            <strong style={{ color: "var(--accent)" }}>{importResult.imported}</strong> of{" "}
            {importResult.total} products imported successfully.
          </p>
          <p className="text-xs mb-8" style={{ color: "var(--graphite)" }}>
            Your products are now live and ready for affiliates to promote.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/dashboard/products")}
              className="w-full min-h-[48px] rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "var(--midnight)" }}
            >
              View products →
            </button>
            <button
              onClick={() => {
                setStep(1);
                setShopUrl("");
                setStorefrontToken("");
                setPreviewProducts([]);
                setSelected(new Set());
                setImportResult(null);
                setError("");
              }}
              className="w-full min-h-[44px] rounded-full text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ color: "var(--graphite)", border: "1.5px solid var(--parchment)" }}
            >
              Import another store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
