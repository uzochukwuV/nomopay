"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";

type Role = "merchant" | "affiliate" | "both";

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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export default function SignUpForm({
  initialRole,
  lockRole = false,
  inviterName,
}: {
  initialRole: Role;
  lockRole?: boolean;
  inviterName?: string;
}) {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const slugBase =
    role === "merchant" ? "splitlink.com/store/" : "splitlink.com/a/";

  function cleanSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .slice(0, 30);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 30)
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password || !slug) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!signUp) {
      setError("Auth service unavailable. Please try again.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // Create Clerk account
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name,
      });

      // Activate the session immediately (test keys skip email verification)
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });

        // Register in our DB
        await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: result.createdUserId,
            email,
            name,
            role,
            slug,
          }),
        });

        router.push(`/onboarding?role=${role}`);
      } else if (result.status === "missing_requirements") {
        // Email verification required
        setError(
          "Please verify your email address. Check your inbox for a verification link."
        );
      } else {
        setError("Sign-up incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      if (clerkError?.errors?.[0]?.message) {
        setError(clerkError.errors[0].message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--parchment)",
    boxShadow: "var(--shadow-card)",
    fontFamily: "var(--font-inter, sans-serif)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl p-10 sm:p-12 flex flex-col gap-3.5 bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Invite banner or header note */}
      {inviterName ? (
        <div
          className="flex items-center gap-3 p-3.5 rounded-2xl mb-1"
          style={{ background: "#eefaf2" }}
        >
          <span
            className="w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 text-base font-bold"
            style={{ background: "var(--earn)", color: "#fff" }}
          >
            {inviterName[0].toUpperCase()}
          </span>
          <strong className="text-[13px] font-bold" style={{ color: "#16602b" }}>
            You&apos;ve been invited by {inviterName} to earn commissions.
          </strong>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 p-3.5 rounded-2xl mb-1"
          style={{ background: "var(--parchment)" }}
        >
          <span
            className="w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 text-base"
            style={{ background: "var(--sun)" }}
            aria-hidden="true"
          >
            ✦
          </span>
          <strong className="text-midnight text-[13px] font-bold">
            Keep it light. Four fields, then payouts.
          </strong>
        </div>
      )}

      {/* Role selector (mobile only, hidden when role is locked) */}
      {!lockRole && (
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {(["merchant", "affiliate", "both"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="px-2 py-2.5 rounded-2xl text-[12px] font-bold capitalize transition-colors"
              style={
                role === r
                  ? { background: "var(--midnight)", color: "#fff" }
                  : {
                      background: "var(--parchment)",
                      color: "var(--graphite)",
                      boxShadow: "var(--shadow-card)",
                    }
              }
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Name */}
      <label className="grid gap-2">
        <span className="text-graphite text-[13px] font-bold">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Alex Morgan"
          className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-midnight outline-none focus:ring-2 focus:ring-offset-0"
          style={inputStyle}
          required
        />
      </label>

      {/* Email */}
      <label className="grid gap-2">
        <span className="text-graphite text-[13px] font-bold">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@example.com"
          className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-midnight outline-none"
          style={inputStyle}
          required
        />
      </label>

      {/* Password */}
      <label className="grid gap-2">
        <span className="text-graphite text-[13px] font-bold">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-midnight outline-none"
          style={inputStyle}
          required
          minLength={8}
        />
      </label>

      {/* Slug */}
      <label className="grid gap-2">
        <span className="text-graphite text-[13px] font-bold">
          Public slug
        </span>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(cleanSlug(e.target.value));
          }}
          placeholder="your-store"
          className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-midnight outline-none"
          style={inputStyle}
          required
        />
      </label>

      {/* URL preview */}
      <div
        className="flex items-center px-4 py-3 rounded-2xl overflow-hidden"
        style={{ background: "var(--midnight)" }}
      >
        <span className="text-ash text-[13px] font-bold whitespace-nowrap">
          {slugBase}
        </span>
        <strong className="text-white text-[13px] font-bold truncate">
          {slug || "your-slug"}
        </strong>
      </div>

      {/* Availability */}
      {slug && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-bold"
          style={{ background: "#eefaf2", color: "#16602b" }}
        >
          <CheckIcon />
          Available instantly
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="p-3.5 rounded-2xl text-[13px] font-bold"
          style={{ background: "#fff0f0", color: "#8a2020" }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full text-[14px] font-semibold text-white mt-1 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ background: "var(--midnight)" }}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Creating account…
          </>
        ) : (
          <>
            Create account
            <ArrowIcon />
          </>
        )}
      </button>

      <p className="text-center text-[12px] text-ash font-semibold leading-relaxed">
        Next step: connect your Stripe payout account. By continuing you agree
        to our{" "}
        <Link
          href="/terms"
          className="underline"
          style={{ color: "var(--accent)" }}
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline"
          style={{ color: "var(--accent)" }}
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
