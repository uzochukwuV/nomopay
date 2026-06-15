const MERCHANT_STEPS = [
  {
    title: "List your product",
    copy: "Create a credible buyer page in minutes — image, description, price, and commission in one form.",
  },
  {
    title: "Set your commission",
    copy: "Choose a reward that makes sharing worth it. Watch the live fee breakdown update as you slide.",
  },
  {
    title: "Watch affiliates promote it",
    copy: "Every tracked sale shows the split clearly. No spreadsheets, no manual transfers, no trust issues.",
  },
];

const AFFILIATE_STEPS = [
  {
    title: "Browse products",
    copy: "Find products with visible payout math — dollar amounts, not just percentages.",
  },
  {
    title: "Generate your link",
    copy: "Get a tracked URL with QR code and share-ready caption made for your audience.",
  },
  {
    title: "Earn on every sale",
    copy: "Watch clicks turn into held and released earnings — all from one clean dashboard.",
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
          Two journeys, zero collisions
        </p>
        <h2
          className="m-0 text-midnight leading-[1.04] tracking-[-0.038em] font-semibold"
          style={{
            fontSize: "clamp(40px, 5.4vw, 68px)",
            fontFamily: "var(--font-inter, sans-serif)",
          }}
        >
          One page does one job.
        </h2>
        <p
          className="max-w-[590px] mx-auto mt-4 text-[17px] leading-[1.5] tracking-[-0.22px] text-graphite"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          A merchant thinks in products. An affiliate thinks in links. SplitLink
          keeps both mental models in their own lane.
        </p>
      </div>

      {/* Journey cards */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
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
              Products → Revenue
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
              Links → Commission
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
