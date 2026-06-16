"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { computeFeeBreakdown, formatCents } from "@/app/lib/fees";

// ─── Types ───────────────────────────────────────────────────────────────────

type ImportMethod = "url" | "pdf" | "manual";

type DraftProduct = {
  clientId: string;
  title: string;
  description: string;
  priceDisplay: string; // dollars, string for input
  imageUrl: string;
  commissionRate: number;
};

type ImportResult = {
  imported: number;
  total: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function blankProduct(): DraftProduct {
  return {
    clientId: uid(),
    title: "",
    description: "",
    priceDisplay: "",
    imageUrl: "",
    commissionRate: 15,
  };
}

function priceToApiCents(display: string): number {
  const n = parseFloat(display.replace(/[^0-9.]/g, ""));
  if (isNaN(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Spinner({ size = 4 }: { size?: number }) {
  return (
    <svg
      className={`animate-spin w-${size} h-${size}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? "bg-green-500 text-white"
                  : active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}
            >
              {done ? (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5z" />
                </svg>
              ) : (
                n
              )}
            </div>
            {n < total && (
              <div
                className={`h-px w-8 transition-all ${
                  done ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FeeCard({
  priceDisplay,
  commissionRate,
}: {
  priceDisplay: string;
  commissionRate: number;
}) {
  const cents = priceToApiCents(priceDisplay);
  if (cents < 100) return null;
  const b = computeFeeBreakdown(cents, commissionRate);
  return (
    <div className="bg-gray-50 rounded-xl p-3 mt-3 space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Buyer pays</span>
        <span className="font-medium text-gray-700">{formatCents(b.gross)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Platform fee (2%)</span>
        <span>−{formatCents(b.platformFee)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Affiliate earns ({commissionRate}%)</span>
        <span>−{formatCents(b.affiliateCommission)}</span>
      </div>
      <div className="border-t border-gray-200 pt-1.5 flex justify-between text-xs font-semibold text-gray-900">
        <span>You receive</span>
        <span className="text-green-600">{formatCents(b.merchantPayout)}</span>
      </div>
    </div>
  );
}

// ─── Method card ─────────────────────────────────────────────────────────────

function MethodCard({
  icon,
  title,
  description,
  badge,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all hover:shadow-sm ${
        selected
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            selected ? "bg-white/15" : "bg-gray-100"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-900"}`}>
              {title}
            </span>
            {badge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  selected
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className={`text-xs leading-relaxed ${selected ? "text-white/75" : "text-gray-500"}`}>
            {description}
          </p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-all ${
            selected
              ? "border-white bg-white"
              : "border-gray-300"
          }`}
        >
          {selected && (
            <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Product card in review grid ─────────────────────────────────────────────

function ProductCard({
  product,
  onChange,
  onRemove,
}: {
  product: DraftProduct;
  onChange: (updated: DraftProduct) => void;
  onRemove: () => void;
}) {
  const cents = priceToApiCents(product.priceDisplay);
  const validPrice = cents >= 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      {/* Image preview */}
      {product.imageUrl && (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Product name</label>
        <input
          type="text"
          value={product.title}
          onChange={(e) => onChange({ ...product, title: e.target.value })}
          placeholder="Product name"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
        <textarea
          value={product.description}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
          placeholder="What is this product and why should someone buy it?"
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Price + Commission */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={product.priceDisplay}
              onChange={(e) => onChange({ ...product, priceDisplay: e.target.value })}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Commission
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="80"
              step="1"
              value={product.commissionRate}
              onChange={(e) =>
                onChange({
                  ...product,
                  commissionRate: Math.min(80, Math.max(0, Number(e.target.value))),
                })
              }
              className="w-full border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Live fee breakdown */}
      {validPrice && (
        <FeeCard priceDisplay={product.priceDisplay} commissionRate={product.commissionRate} />
      )}

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        Remove product
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AiImportPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<ImportMethod | null>(null);

  // Step 2 state
  const [urlInput, setUrlInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 state
  const [products, setProducts] = useState<DraftProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  // Step 4 state
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // ── Auth fetch helpers ────────────────────────────────────────────────────

  async function authPost(path: string, body: object) {
    const token = await getToken();
    return fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }

  async function authPostFormData(path: string, formData: FormData) {
    const token = await getToken();
    return fetch(path, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  }

  // ── Step 1: choose method ─────────────────────────────────────────────────

  function handleChooseMethod(m: ImportMethod) {
    setMethod(m);
    if (m === "manual") {
      setProducts([blankProduct()]);
      setStep(3);
    } else {
      setStep(2);
    }
  }

  // ── Step 2: extract ───────────────────────────────────────────────────────

  const handleExtractUrl = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setExtractError("");
      setExtracting(true);
      try {
        const res = await authPost("/api/ai-import/extract-url", { url: urlInput });
        const data = await res.json();
        if (!res.ok) {
          setExtractError(data.error ?? "Failed to fetch URL");
          return;
        }
        const drafts: DraftProduct[] = (data.products ?? []).map(
          (p: { title: string; description: string; price: number | null; imageUrl: string | null }) => ({
            clientId: uid(),
            title: p.title ?? "",
            description: p.description ?? "",
            priceDisplay: p.price ? (p.price / 100).toFixed(2) : "",
            imageUrl: p.imageUrl ?? "",
            commissionRate: 15,
          })
        );
        if (drafts.length === 0) {
          setExtractError("No products found on this page. Try a different URL or use manual entry.");
          return;
        }
        setProducts(drafts);
        setStep(3);
      } finally {
        setExtracting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [urlInput]
  );

  const handleExtractPdf = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!pdfFile) return;
      setExtractError("");
      setExtracting(true);
      try {
        const fd = new FormData();
        fd.append("file", pdfFile);
        const res = await authPostFormData("/api/ai-import/extract-document", fd);
        const data = await res.json();
        if (!res.ok) {
          setExtractError(data.error ?? "Failed to parse document");
          return;
        }
        const drafts: DraftProduct[] = (data.products ?? []).map(
          (p: { title: string; description: string; price: number | null; imageUrl: string | null }) => ({
            clientId: uid(),
            title: p.title ?? "",
            description: p.description ?? "",
            priceDisplay: p.price ? (p.price / 100).toFixed(2) : "",
            imageUrl: "",
            commissionRate: 15,
          })
        );
        if (drafts.length === 0) {
          setExtractError("No products found in this document. Try adding them manually.");
          return;
        }
        setProducts(drafts);
        setStep(3);
      } finally {
        setExtracting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pdfFile]
  );

  // ── Step 3: import ────────────────────────────────────────────────────────

  const readyProducts = products.filter(
    (p) => p.title.trim() && priceToApiCents(p.priceDisplay) >= 100
  );

  async function handleImport() {
    if (readyProducts.length === 0) return;
    setImportError("");
    setImporting(true);
    try {
      const payload = readyProducts.map((p) => ({
        title: p.title.trim(),
        description: p.description.trim() || p.title.trim(),
        price: priceToApiCents(p.priceDisplay),
        commissionRate: p.commissionRate,
        imageUrl: p.imageUrl.trim() || undefined,
        currency: "usd",
      }));
      const res = await authPost("/api/ai-import/import", { products: payload });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Import failed");
        return;
      }
      setImportResult({ imported: data.imported, total: data.total });
      setStep(4);
    } finally {
      setImporting(false);
    }
  }

  function updateProduct(clientId: string, updated: DraftProduct) {
    setProducts((prev) =>
      prev.map((p) => (p.clientId === clientId ? updated : p))
    );
  }

  function removeProduct(clientId: string) {
    setProducts((prev) => prev.filter((p) => p.clientId !== clientId));
  }

  // ── Step 4: invite ────────────────────────────────────────────────────────

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setSending(true);
    setInviteError("");
    try {
      const res = await authPost("/api/invites/send", {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
      });
      if (!res.ok) {
        const d = await res.json();
        setInviteError(d.error ?? "Failed to send invite");
        return;
      }
      setInviteSent(true);
      setInviteName("");
      setInviteEmail("");
      setTimeout(() => setInviteSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  const storeSlug = user?.username ?? "";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl">
      {/* Onboarding context banner */}
      {isOnboarding && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Step 3 of 6 — Import your catalog</p>
            <p className="text-xs text-blue-600">Stripe is connected. Now let's add your products so affiliates can start promoting.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {step === 4 ? "Products imported!" : "Import your catalog"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {step === 4
            ? "Your products are live. Now share your store and invite creators."
            : "Paste a URL, upload a PDF, or add products manually. AI fills in the details."}
        </p>
      </div>

      <StepBar step={step} total={4} />

      {/* ── Step 1: Choose method ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-3">
          <MethodCard
            selected={method === "url"}
            onClick={() => handleChooseMethod("url")}
            badge="Recommended"
            title="Website or Instagram URL"
            description="Paste any public product page, online store, or Instagram profile. AI extracts products automatically."
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${method === "url" ? "text-white" : "text-gray-500"}`}>
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            }
          />
          <MethodCard
            selected={method === "pdf"}
            onClick={() => handleChooseMethod("pdf")}
            title="PDF or document"
            description="Upload a price list, product catalog, or brochure. AI reads the text and creates your product listing."
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${method === "pdf" ? "text-white" : "text-gray-500"}`}>
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            }
          />
          <MethodCard
            selected={method === "manual"}
            onClick={() => handleChooseMethod("manual")}
            title="Add manually"
            description="Type your products directly. Best for a small catalog or when you want full control from the start."
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${method === "manual" ? "text-white" : "text-gray-500"}`}>
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Step 2: Input + extract ────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {method === "url" ? (
            <form onSubmit={handleExtractUrl} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Website or store URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://yourstore.com/products"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Works best with product or catalog pages.{" "}
                  <span className="text-amber-600">Instagram support is limited</span> — dynamic content may not fully load.
                </p>
              </div>

              {extractError && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                  {extractError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={extracting || !urlInput.trim()}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {extracting ? (
                    <>
                      <Spinner />
                      AI is scanning your catalog…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Scan with AI
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3"
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleExtractPdf} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload PDF catalog
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    pdfFile
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  {pdfFile ? (
                    <div>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-gray-700 mx-auto mb-2">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(pdfFile.size / 1024).toFixed(0)} KB · click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-gray-300 mx-auto mb-2">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload PDF</p>
                      <p className="text-xs text-gray-400 mt-1">Max 10 MB · text-based PDFs only</p>
                    </div>
                  )}
                </div>
              </div>

              {extractError && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                  {extractError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={extracting || !pdfFile}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {extracting ? (
                    <>
                      <Spinner />
                      Extracting products…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Extract with AI
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Step 3: Review & configure ─────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Summary bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {products.length} product{products.length !== 1 ? "s" : ""} to review
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {readyProducts.length} ready to import · edit any details below
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setProducts((prev) => [...prev, blankProduct()]);
                }}
                className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Add product
              </button>
              <button
                onClick={handleImport}
                disabled={importing || readyProducts.length === 0}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                {importing ? (
                  <>
                    <Spinner />
                    Importing…
                  </>
                ) : (
                  `Import ${readyProducts.length} product${readyProducts.length !== 1 ? "s" : ""}`
                )}
              </button>
            </div>
          </div>

          {importError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm text-red-700">
              {importError}
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-500 mb-3">No products yet</p>
              <button
                onClick={() => setProducts([blankProduct()])}
                className="text-sm font-medium text-gray-900 underline underline-offset-2"
              >
                Add the first one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.clientId}
                  product={p}
                  onChange={(updated) => updateProduct(p.clientId, updated)}
                  onRemove={() => removeProduct(p.clientId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Success ────────────────────────────────────────────── */}
      {step === 4 && importResult && (
        <div className="space-y-5">
          {/* Success card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-green-600">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {importResult.imported} product{importResult.imported !== 1 ? "s" : ""} imported
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {importResult.total > importResult.imported
                ? `${importResult.total - importResult.imported} had errors and were skipped.`
                : "All products are live and ready to share."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                View my products →
              </Link>
              {isOnboarding && (
                <Link
                  href="/dashboard/settings/notifications"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Next: set up notifications →
                </Link>
              )}
            </div>
          </div>

          {/* Share your store */}
          {storeSlug && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Share your store</h3>
              <p className="text-xs text-gray-500 mb-3">This is your public storefront — send it to creators to promote.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 truncate font-mono">
                  splitlink.com/store/{storeSlug}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://splitlink.com/store/${storeSlug}`);
                  }}
                  className="shrink-0 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-2.5 rounded-xl transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Invite a creator */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-violet-600">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Invite a creator</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Send a personal invite to someone in your network. They'll get a link to sign up as an affiliate and start earning.
                </p>
              </div>
            </div>

            {inviteSent && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">
                Invite sent! They'll receive an email with your sign-up link.
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Creator's name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              {inviteError && (
                <p className="text-xs text-red-600">{inviteError}</p>
              )}

              <button
                type="submit"
                disabled={sending || !inviteName.trim() || !inviteEmail.trim()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                {sending ? (
                  <>
                    <Spinner />
                    Sending…
                  </>
                ) : (
                  "Send invite"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
