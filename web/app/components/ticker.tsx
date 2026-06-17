const STEPS = [
  "Add a product",
  "Set the commission",
  "Invite a creator",
  "Creator shares link",
  "Buyer pays",
  "Commission is tracked",
  "Merchant sees proof",
];

export default function Ticker() {
  // Duplicate for seamless loop
  const items = [...STEPS, ...STEPS];

  return (
    <div
      className="w-full overflow-hidden border-y mt-1"
      style={{
        borderColor: "var(--stone)",
        background: "#fff",
      }}
      aria-label="Platform loop"
    >
      <div className="ticker-track">
        {items.map((text, i) => (
          <span
            key={i}
            className="px-3 py-2.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap"
            style={{
              background: "var(--parchment)",
              color: "var(--charcoal)",
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
