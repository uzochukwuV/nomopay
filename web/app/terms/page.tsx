import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-16" style={{ background: "var(--canvas)" }}>
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold underline" style={{ color: "var(--accent)" }}>
          Back to SplitLink
        </Link>
        <h1 className="mt-8 text-4xl font-bold" style={{ color: "var(--midnight)" }}>
          Terms
        </h1>
        <div className="mt-8 space-y-5 text-sm leading-7" style={{ color: "var(--graphite)" }}>
          <p>
            SplitLink helps merchants create payment links and lets affiliates earn commissions from tracked sales.
          </p>
          <p>
            Users are responsible for accurate product, tax, payout, and compliance information. Stripe may require additional verification before payouts are enabled.
          </p>
          <p>
            Affiliate commissions, refunds, disputes, and payout timing depend on the merchant setup, Stripe account status, and platform rules.
          </p>
          <p>
            Use of the service must comply with applicable law and the terms of any connected providers.
          </p>
        </div>
      </section>
    </main>
  );
}
