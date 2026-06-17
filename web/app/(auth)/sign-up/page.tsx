import SignUpForm from "./sign-up-form";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; inviterSlug?: string; inviterName?: string }>;
}) {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const { role, inviterSlug, inviterName } = await searchParams;

  // Invite links lock the role to affiliate
  const isInvite = Boolean(inviterSlug);
  const initialRole = isInvite
    ? "affiliate"
    : role === "affiliate"
    ? "affiliate"
    : role === "both"
    ? "both"
    : "merchant";

  const title =
    initialRole === "affiliate"
      ? "Create your affiliate identity."
      : "Create your merchant storefront.";

  const urlBase =
    initialRole === "merchant" ? "splitlink.com/store/" : "splitlink.com/a/";

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--canvas)", fontFamily: "var(--font-inter, sans-serif)" }}
    >
      {/* Decorative blobs */}
      <div
        className="floating-blob blob-orange absolute w-[clamp(78px,10vw,120px)] h-[clamp(74px,9vw,110px)] left-[7%] top-[18%] -rotate-[11deg] hidden lg:grid"
        aria-hidden="true"
      >
        <span />
      </div>
      <div
        className="floating-blob blob-green absolute w-[clamp(78px,10vw,120px)] h-[clamp(74px,9vw,110px)] right-[8%] bottom-[13%] hidden lg:grid"
        style={{ animationDelay: "-1.5s" }}
        aria-hidden="true"
      >
        <span />
      </div>
      <div
        className="floating-coin absolute left-[17%] bottom-[16%] w-[62px] h-[62px] text-sm hidden xl:grid"
        style={{ animationDelay: "-2s" }}
        aria-hidden="true"
      >
        {initialRole === "merchant" ? "$" : "%"}
      </div>

      {/* Brand (fixed top-left) */}
      <Link
        href="/"
        className="fixed top-7 left-7 flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.02em] text-midnight z-10"
      >
        <span
          className="w-[28px] h-[28px] rounded-[9px] flex-shrink-0 inline-block"
          style={{
            background:
              "radial-gradient(circle at 64% 32%, #ffbb26 0 16%, transparent 17%), #121212",
          }}
          aria-hidden="true"
        />
        SplitLink
      </Link>

      {/* Two-column card */}
      <section
        className="relative z-10 w-full grid gap-3.5"
        style={{
          maxWidth: "1060px",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(320px, 0.8fr)",
        }}
      >
        {/* Story panel (hidden on mobile) */}
        <div
          className="auth-story-card rounded-3xl p-12 flex-col justify-between min-h-[580px] hidden md:flex"
          style={{ background: "var(--parchment)", color: "var(--graphite)" }}
        >
          {/* Role switcher — hidden when arriving via invite */}
          {!isInvite && (
            <div
              className="flex gap-2 p-1.5 rounded-full w-fit"
              style={{ background: "#fff", boxShadow: "var(--shadow-card)" }}
            >
              <Link
                href="/sign-up?role=merchant"
                className="px-3.5 py-2.5 rounded-full text-[13px] font-bold transition-colors"
                style={
                  initialRole === "merchant"
                    ? { background: "var(--midnight)", color: "#fff" }
                    : { color: "var(--graphite)" }
                }
              >
                Merchant
              </Link>
              <Link
                href="/sign-up?role=affiliate"
                className="px-3.5 py-2.5 rounded-full text-[13px] font-bold transition-colors"
                style={
                  initialRole === "affiliate"
                    ? { background: "var(--midnight)", color: "#fff" }
                    : { color: "var(--graphite)" }
                }
              >
                Affiliate
              </Link>
              <Link
                href="/sign-up?role=both"
                className="px-3.5 py-2.5 rounded-full text-[13px] font-bold transition-colors"
                style={
                  initialRole === "both"
                    ? { background: "var(--midnight)", color: "#fff" }
                    : { color: "var(--graphite)" }
                }
              >
                Both
              </Link>
            </div>
          )}

          {/* Invite banner on story panel */}
          {isInvite && inviterName && (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "#eefaf2", border: "1px solid #a3dab5" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                style={{ background: "var(--earn)", color: "#fff" }}
              >
                {inviterName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#16602b" }}>
                  You&apos;ve been invited by {inviterName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4a7c59" }}>
                  Sign up to start earning commissions promoting their products.
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center py-8">
            <p
              className="m-0 mb-3 text-[14px] font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {initialRole === "merchant"
                ? "Merchant path selected"
                : initialRole === "affiliate"
                ? "Affiliate path selected"
                : "Both roles selected"}
            </p>
            <h1
              className="m-0 mb-4 text-midnight leading-[0.98] tracking-[-0.045em] font-medium"
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(44px, 5.8vw, 72px)",
              }}
            >
              {title}
            </h1>
            <p className="text-[16px] leading-[1.52] tracking-[-0.2px] m-0">
              Pick your role, claim your public URL, then land on one focused
              Stripe step before any dashboard appears.
            </p>

            {/* Path preview */}
            <div
              className="relative z-10 mt-7 p-4 rounded-2xl bg-card"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span
                className="block text-[12px] font-bold mb-2"
                style={{ color: "var(--accent)" }}
              >
                Your public path
              </span>
              <strong
                className="block text-midnight text-[18px] break-all"
                style={{ fontFamily: "var(--font-inter, sans-serif)" }}
              >
                {urlBase}
                <em
                  className="not-italic"
                  style={{ color: "var(--accent)" }}
                >
                  your-slug
                </em>
              </strong>
            </div>
          </div>

          <p className="text-[13px] text-graphite">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-bold"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form panel */}
        <SignUpForm
          initialRole={initialRole as "merchant" | "affiliate" | "both"}
          lockRole={isInvite}
          inviterName={inviterName}
        />
      </section>
    </main>
  );
}
