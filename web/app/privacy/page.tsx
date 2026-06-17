import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16" style={{ background: "var(--canvas)" }}>
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold underline" style={{ color: "var(--accent)" }}>
          Back to SplitLink
        </Link>
        <h1 className="mt-8 text-4xl font-bold" style={{ color: "var(--midnight)" }}>
          Privacy Policy
        </h1>
        <div className="mt-8 space-y-5 text-sm leading-7" style={{ color: "var(--graphite)" }}>
          <p>
            SplitLink collects account, product, transaction, and payout information needed to run affiliate payment links.
          </p>
          <p>
            Authentication is handled by Clerk, payments and connected accounts are handled by Stripe, and file storage may be handled by Supabase.
          </p>
          <p>
            Do not enter sensitive personal information unless it is required by Stripe or another trusted provider during their secure flow.
          </p>
          <p>
            Contact the SplitLink team for privacy or data deletion requests.
          </p>
        </div>
      </section>
    </main>
  );
}
