import { Suspense } from "react";
import Link from "next/link";
import BuyButton from "./buy-button";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  slug: string;
  status: string;
  commissionRate: string;
  merchant: { name: string };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `http://localhost:8080/api/products/by-slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string; success?: string; cancelled?: string }>;
}) {
  const { slug } = await params;
  const { success, cancelled } = await searchParams;
  const product = await getProduct(slug);

  // Product unavailable
  if (!product || product.status !== "active") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--canvas)" }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "var(--stone)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8" style={{ color: "var(--ash)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--midnight)" }}>
          Product unavailable
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--ash)", maxWidth: "280px" }}>
          This product is currently unavailable. It may have been paused or removed by the seller.
        </p>
        <Link
          href="/"
          className="text-sm font-semibold underline"
          style={{ color: "var(--accent)" }}
        >
          Browse SplitLink
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--canvas)" }}>
      {/* Success banner */}
      {success && (
        <div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-sm font-bold"
          style={{ background: "var(--earn)", color: "#fff" }}
        >
          Payment confirmed — you&apos;re all set!
        </div>
      )}

      {/* Cancelled banner */}
      {cancelled && (
        <div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-sm font-bold"
          style={{ background: "var(--sun)", color: "var(--midnight)" }}
        >
          Payment cancelled — your card was not charged.
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Product image — full width, 55vh on mobile */}
        <div
          className="w-full relative overflow-hidden"
          style={{ height: "55vmax", maxHeight: "420px", minHeight: "280px" }}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "var(--stone)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16" style={{ color: "var(--ash)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M12 3v18" />
              </svg>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="px-5 pt-5 pb-10">
          {/* Merchant name */}
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--ash)" }}>
            Sold by {product.merchant.name}
          </p>

          {/* Title + price */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <h1
              className="text-2xl font-bold leading-tight"
              style={{ color: "var(--midnight)", fontFamily: "var(--font-fraunces, serif)" }}
            >
              {product.title}
            </h1>
            <span
              className="text-xl font-bold shrink-0 pt-0.5"
              style={{ color: "var(--midnight)" }}
            >
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          {/* Buy button */}
          <Suspense fallback={
            <div className="w-full py-4 rounded-2xl text-center text-white font-bold" style={{ background: "var(--midnight)" }}>
              Buy Now
            </div>
          }>
            <BuyButton
              productId={product.id}
              price={product.price}
              currency={product.currency}
              productSlug={product.slug}
            />
          </Suspense>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mt-6"
            style={{ color: "var(--graphite)" }}
          >
            {product.description}
          </p>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                label: "Secure payment",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                ),
                label: "7-day returns",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                label: "Verified seller",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                style={{ background: "var(--stone)" }}
              >
                <span style={{ color: "var(--ash)" }}>{item.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "var(--graphite)" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Powered by footer */}
          <div className="mt-10 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--ash)" }}>
            <Link href="/" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "var(--midnight)" }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-white" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                </svg>
              </div>
              Powered by SplitLink
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
