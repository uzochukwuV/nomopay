"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSafeClerk, useSafeSignIn } from "@/app/lib/use-safe-clerk";

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

export default function SignInForm() {
  const router = useRouter();
  const { signIn } = useSafeSignIn();
  const { setActive } = useSafeClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!signIn) {
      setError("Auth service unavailable. Please try again.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const result = (await signIn.create({
        identifier: email,
        password,
      })) as unknown as { status: string; createdSessionId?: string };

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Sign-in could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      if (clerkError?.errors?.[0]?.message) {
        setError(clerkError.errors[0].message);
      } else {
        setError("Invalid email or password.");
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
      className="rounded-3xl p-10 sm:p-12 flex flex-col gap-4 bg-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
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
          Welcome back.
        </strong>
      </div>

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

      <label className="grid gap-2">
        <span className="text-graphite text-[13px] font-bold">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-midnight outline-none"
          style={inputStyle}
          required
        />
      </label>

      {error && (
        <div
          className="p-3.5 rounded-2xl text-[13px] font-bold"
          style={{ background: "#fff0f0", color: "#8a2020" }}
        >
          {error}
        </div>
      )}

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
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowIcon />
          </>
        )}
      </button>

      <p className="text-center text-[12px] text-ash font-semibold">
        Forgot your password?{" "}
        <Link
          href="/sign-up"
          className="underline"
          style={{ color: "var(--accent)" }}
        >
          Create a new account
        </Link>
      </p>
    </form>
  );
}
