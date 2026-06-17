function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M5 12h13m-5-5 5 5-5 5" />
    </svg>
  );
}

export default function ProductPreview() {
  return (
    <section
      id="preview"
      className="mx-auto"
      style={{
        width: "min(calc(100% - 32px), 1200px)",
        marginTop: "clamp(104px, 14vw, 168px)",
      }}
    >
      {/* Section heading */}
      <div
        className="max-w-[720px] mx-auto text-center mb-8"
        style={{ fontFamily: "var(--font-inter, sans-serif)" }}
      >
        <p
          className="m-0 mb-3 text-[14px] font-semibold tracking-[-0.18px]"
          style={{ color: "var(--accent)" }}
        >
          Buyer checkout page
        </p>
        <h2
          className="m-0 text-midnight leading-[1.04] tracking-[-0.038em] font-semibold"
          style={{ fontSize: "clamp(40px, 5.4vw, 68px)" }}
        >
          A creator link should lead straight to the sale.
        </h2>
        <p className="max-w-[590px] mx-auto mt-4 text-[17px] leading-[1.5] tracking-[-0.22px] text-graphite">
          Buyers do not need a marketplace account or a merchant dashboard.
          They need the product, the price, the seller, and one secure way to pay.
        </p>
      </div>

      {/* Preview card */}
      <div
        className="grid rounded-3xl overflow-hidden bg-card lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.72fr)]"
        style={{
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Product visual */}
        <div
          className="min-h-[500px] p-6 relative flex items-center justify-center overflow-hidden"
          style={{ background: "var(--parchment)" }}
        >
          <div
            className="w-[min(72%,420px)] aspect-square relative"
            style={{
              borderRadius: "47% 53% 48% 52% / 54% 45% 55% 46%",
              background:
                "radial-gradient(circle at 35% 37%, #121212 0 2.3%, transparent 2.4%), radial-gradient(circle at 60% 37%, #121212 0 2.3%, transparent 2.4%), linear-gradient(var(--accent), var(--accent))",
              animation: "bobble 4.6s ease-in-out infinite",
            }}
            aria-hidden="true"
          >
            <div
              className="absolute"
              style={{
                left: "42%",
                top: "49%",
                width: "18%",
                height: "8%",
                border: "5px solid var(--midnight)",
                borderTop: 0,
                borderRadius: "0 0 999px 999px",
              }}
            />
          </div>
          <span
            className="absolute left-6 bottom-6 px-2.5 py-2 rounded-[10px] text-[12px] font-bold text-charcoal"
            style={{ background: "var(--parchment)", boxShadow: "var(--shadow-card)" }}
          >
            Creator checkout link
          </span>
        </div>

        {/* Checkout content */}
        <div
          className="flex flex-col justify-center px-10 py-12"
          style={{ fontFamily: "var(--font-inter, sans-serif)" }}
        >
          <span className="text-ash text-[13px] font-bold">
            Ada Studio · Verified merchant
          </span>
          <h3
            className="mt-3 mb-3 text-midnight leading-[1] tracking-[-0.04em] font-semibold"
            style={{ fontSize: "clamp(36px, 4.6vw, 58px)" }}
          >
            Handmade Leather Tote
          </h3>
          <p className="text-graphite text-[15px] leading-[1.47]">
            A structured everyday tote made in small batches for independent
            boutiques and creator-led campaigns.
          </p>
          <div className="mt-5 mb-6 grid gap-1.5">
            <strong className="text-midnight text-[34px] font-bold tracking-[-0.05em]">
              $100.00
            </strong>
            <span className="text-ash text-[13px] font-semibold">
              Secure checkout powered by Stripe
            </span>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full text-[14px] font-semibold text-white cursor-default"
            style={{ background: "var(--midnight)" }}
          >
            Buy Now — $100.00
            <ArrowIcon />
          </button>
          <p className="mt-4 text-[12px] text-ash text-center font-semibold">
            Stripe-secured · Sold by Ada Studio · Powered by SplitLink
          </p>
        </div>
      </div>
    </section>
  );
}
