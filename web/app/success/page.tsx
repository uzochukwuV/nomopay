import Link from "next/link";
import { backendApiUrl } from "@/app/lib/api";

function formatCents(cents: number | null | undefined, currency: string | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  }).format((cents ?? 0) / 100);
}

async function getSession(sessionId: string) {
  try {
    const res = await fetch(backendApiUrl(`/api/checkout/session/${encodeURIComponent(sessionId)}`), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const data = sessionId ? await getSession(sessionId) : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--canvas)" }}>
      <section className="w-full max-w-md rounded-2xl p-6 text-center" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 grid place-items-center" style={{ background: "var(--earn)", color: "#fff" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--midnight)" }}>Payment confirmed</h1>
        <p className="text-sm mb-6" style={{ color: "var(--ash)" }}>You&apos;re all set. The merchant has received your order.</p>

        {data?.product && (
          <div className="rounded-xl p-4 text-left mb-5" style={{ background: "var(--stone)" }}>
            <div className="text-xs font-bold mb-1" style={{ color: "var(--ash)" }}>Order summary</div>
            <div className="font-bold" style={{ color: "var(--midnight)" }}>{data.product.title}</div>
            <div className="text-sm mt-1" style={{ color: "var(--graphite)" }}>
              {formatCents(data.session?.amountTotal, data.session?.currency)} · Sold by {data.product.merchantName}
            </div>
            <div className="text-xs mt-3" style={{ color: "var(--ash)" }}>
              {data.product.merchantName} will contact {data.session?.buyerEmail ?? "you"} with delivery details.
            </div>
          </div>
        )}

        <Link href="/" className="inline-flex justify-center w-full rounded-xl py-3 text-sm font-bold text-white" style={{ background: "var(--midnight)" }}>
          Done
        </Link>
      </section>
    </main>
  );
}
