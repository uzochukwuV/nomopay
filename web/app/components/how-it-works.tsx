const MERCHANT_STEPS = [
  {
    title: "Add the product you already sell",
    copy: "Create a clean checkout page with name, image, price, and the commission you are willing to pay.",
  },
  {
    title: "Invite creators you already know",
    copy: "Send a creator a signup link tied to your business. They get their own tracked link without asking you for a manual code.",
  },
  {
    title: "Pay only when buyers show up",
    copy: "Every sale records the product, creator, commission, and payout. You can see who actually brought customers.",
  },
];

const AFFILIATE_STEPS = [
  {
    title: "Accept the merchant invite",
    copy: "Join as a creator and see the products you have been asked to promote first.",
  },
  {
    title: "Generate your own link",
    copy: "Copy a unique checkout link that proves which buyers came from your audience.",
  },
  {
    title: "See the same truth",
    copy: "Clicks, conversions, and commissions show in your dashboard so the merchant is not the only source of truth.",
  },
];

function Step({ step, index }: { step: { title: string; copy: string }; index: number }) {
  return (
    <div
      className="grid gap-4 pt-6"
      style={{
        gridTemplateColumns: "54px 1fr",
        borderTop: "1px solid var(--stone)",
      }}
    >
      <b
        className="w-11 h-11 grid place-items-center rounded-2xl text-charcoal font-bold text-[14px]"
        style={{ background: "var(--parchment)" }}
      >
        0{index + 1}
      </b>
      <div>
        <h3
          className="m-0 mb-1.5 text-charcoal text-[22px] leading-[1.16] tracking-[-0.44px] font-semibold"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          {step.title}
        </h3>
        <p
          className="m-0 text-graphite text-[15px] leading-[1.47] tracking-[-0.2px]"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          {step.copy}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto"
      style={{
        width: "min(calc(100% - 32px), 1200px)",
        marginTop: "clamp(104px, 14vw, 168px)",
      }}
    >
      {/* Section heading */}
      <div className="max-w-[720px] mx-auto text-center mb-8">
        <p
          className="m-0 mb-3 text-[14px] font-semibold tracking-[-0.18px]"
          style={{ color: "var(--accent)", fontFamily: "var(--font-inter, sans-serif)" }}
        >
          Built for trust, not reach promises
        </p>
        <h2
          className="m-0 text-midnight leading-[1.04] tracking-[-0.038em] font-semibold"
          style={{
            fontSize: "clamp(40px, 5.4vw, 68px)",
            fontFamily: "var(--font-inter, sans-serif)",
          }}
        >
          Three steps from content to confirmed sale.
        </h2>
        <p
          className="max-w-[590px] mx-auto mt-4 text-[17px] leading-[1.5] tracking-[-0.22px] text-graphite"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          Independent merchants should not pay for creator reach and hope it
          turns into customers. Creators should not chase merchants for
          commission proof. SplitLink gives both sides the same record.
        </p>
      </div>

      {/* Journey cards */}
      <div
        className="grid gap-4 grid-cols-1 lg:grid-cols-2"
      >
        {/* Merchant card */}
        <article
          className="relative min-h-[520px] p-8 rounded-3xl bg-card overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="journey-character blob-orange absolute right-7 top-7" aria-hidden="true" />
          <div className="flex items-center justify-between gap-4 mb-8">
            <span
              className="text-[13px] font-bold"
              style={{ color: "var(--accent)", fontFamily: "var(--font-inter, sans-serif)" }}
            >
              For merchants
            </span>
            <strong
              className="text-[17px] text-charcoal font-semibold"
              style={{ fontFamily: "var(--font-inter, sans-serif)" }}
            >
              Product to proof
            </strong>
          </div>
          {MERCHANT_STEPS.map((step, i) => (
            <Step key={step.title} step={step} index={i} />
          ))}
        </article>

        {/* Affiliate card */}
        <article
          className="relative min-h-[520px] p-8 rounded-3xl bg-card overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="journey-character blob-blue absolute right-7 top-7"
            aria-hidden="true"
            style={{ animationDelay: "-1s" }}
          />
          <div className="flex items-center justify-between gap-4 mb-8">
            <span
              className="text-[13px] font-bold"
              style={{ color: "var(--accent)", fontFamily: "var(--font-inter, sans-serif)" }}
            >
              For affiliates
            </span>
            <strong
              className="text-[17px] text-charcoal font-semibold"
              style={{ fontFamily: "var(--font-inter, sans-serif)" }}
            >
              Link to commission
            </strong>
          </div>
          {AFFILIATE_STEPS.map((step, i) => (
            <Step key={step.title} step={step} index={i} />
          ))}
        </article>
      </div>
    </section>
  );
}
