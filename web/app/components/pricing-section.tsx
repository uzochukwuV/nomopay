const FEE_ROWS = [
  { label: "Buyer pays", value: "$100.00", variant: "default" as const },
  { label: "Creator commission", value: "$15.00", variant: "accent" as const },
  { label: "SplitLink fee", value: "$2.00", variant: "default" as const },
  { label: "Merchant receives", value: "$83.00", variant: "total" as const },
];

export default function PricingSection() {
  return (
    <section
      id="fee"
      className="mx-auto grid gap-8 items-center"
      style={{
        width: "min(calc(100% - 32px), 1200px)",
        marginTop: "clamp(104px, 14vw, 168px)",
        gridTemplateColumns: "minmax(0, 0.85fr) minmax(320px, 0.65fr)",
      }}
    >
      {/* Copy */}
      <div
        className="max-w-[720px]"
        style={{ fontFamily: "var(--font-inter, sans-serif)" }}
      >
        <p
          className="m-0 mb-3 text-[14px] font-semibold tracking-[-0.18px]"
          style={{ color: "var(--accent)" }}
        >
          The model is simple
        </p>
        <h2
          className="m-0 text-midnight leading-[1.04] tracking-[-0.038em] font-semibold"
          style={{ fontSize: "clamp(40px, 5.4vw, 68px)" }}
        >
          No upfront creator spend.
          <br />
          We take{" "}
          <span style={{ color: "var(--accent)" }}>2%.</span>
        </h2>
        <p className="max-w-[590px] mt-4 text-[17px] leading-[1.5] tracking-[-0.22px] text-graphite">
          Creators earn from real customer payments, not promises. Merchants
          see the commission before the link goes live and the final split
          after each checkout.
        </p>
      </div>

      {/* Fee device */}
      <div
        className="rounded-3xl p-4 overflow-hidden"
        style={{
          background: "#000",
          boxShadow: "rgba(0,0,0,0.15) 0 0 24px",
          transform: "rotate(1.5deg)",
        }}
      >
        <div className="px-4 py-4 pb-5 text-white font-bold text-[15px]">
          Handmade Leather Tote
        </div>
        <div className="grid gap-1.5">
          {FEE_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-4 px-4 py-[17px] rounded-2xl font-semibold"
              style={
                row.variant === "accent"
                  ? { background: "var(--accent)", color: "#fff" }
                  : row.variant === "total"
                  ? { background: "#fff", color: "var(--midnight)" }
                  : { background: "#151515", color: "#c6c6c6" }
              }
            >
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
