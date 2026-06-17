import SignInForm from "./sign-in-form";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

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
        className="floating-blob blob-blue absolute w-[clamp(78px,10vw,120px)] h-[clamp(74px,9vw,110px)] right-[8%] bottom-[13%] hidden lg:grid"
        style={{ animationDelay: "-1.5s" }}
        aria-hidden="true"
      >
        <span />
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
          className="auth-story-card rounded-3xl p-12 flex-col justify-between min-h-[480px] hidden md:flex"
          style={{ background: "var(--parchment)", color: "var(--graphite)" }}
        >
          <div className="flex-1 flex flex-col justify-center py-8">
            <p
              className="m-0 mb-3 text-[14px] font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </p>
            <h1
              className="m-0 mb-4 text-midnight leading-[0.98] tracking-[-0.045em] font-medium"
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(44px, 5.8vw, 72px)",
              }}
            >
              Back to your storefront.
            </h1>
            <p className="text-[16px] leading-[1.52] tracking-[-0.2px] m-0">
              Your products, commissions, and payouts are right where you left
              them.
            </p>
          </div>

          <p className="text-[13px] text-graphite">
            No account yet?{" "}
            <Link
              href="/sign-up"
              className="font-bold"
              style={{ color: "var(--accent)" }}
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Form panel */}
        <SignInForm />
      </section>
    </main>
  );
}
