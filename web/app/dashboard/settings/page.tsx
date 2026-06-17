"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readApiResponse } from "@/app/lib/http";
import { useSafeAuth } from "@/app/lib/use-safe-clerk";

type ConnectStatus = {
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  stripeAccountId?: string;
};

function statusText(status: ConnectStatus | null) {
  if (!status?.stripeAccountId) return "Not connected";
  if (status.onboardingComplete) return "Ready";
  return "Action required";
}

export default function SettingsPage() {
  const { getToken } = useSafeAuth();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/connect/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse<ConnectStatus>(res);
        if (cancelled) return;
        setStatus(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load payment account status.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnPath: "/dashboard/settings?onboarding=true" }),
      });
      const data = await readApiResponse<{ url?: string }>(res);
      if (!data.url) throw new Error("Stripe onboarding URL was not returned.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Stripe onboarding.");
      setConnecting(false);
    }
  }

  const ready = Boolean(status?.onboardingComplete);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>
          Manage payout setup, account preferences, and notifications.
        </p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold mb-2" style={{ color: "var(--midnight)" }}>
              Payment account
            </h2>
            <p className="text-sm" style={{ color: "var(--ash)" }}>
              Connect Stripe so buyers can pay for your products and funds can be routed correctly.
            </p>
          </div>
          <span
            className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: ready ? "#eefaf2" : "#fff7e0",
              color: ready ? "#16602b" : "#92650a",
            }}
          >
            {loading ? "Checking..." : statusText(status)}
          </span>
        </div>

        {status?.stripeAccountId && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl p-3" style={{ background: "var(--stone)" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "var(--ash)" }}>
                Charges
              </div>
              <div className="text-sm font-bold" style={{ color: "var(--midnight)" }}>
                {status.chargesEnabled ? "Enabled" : "Pending"}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--stone)" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "var(--ash)" }}>
                Payouts
              </div>
              <div className="text-sm font-bold" style={{ color: "var(--midnight)" }}>
                {status.payoutsEnabled ? "Enabled" : "Pending"}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-3 text-sm font-bold mb-4" style={{ background: "#fff0f0", color: "#8a2020" }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleConnect}
          disabled={loading || connecting}
          className="inline-flex text-sm font-bold px-4 py-2.5 rounded-xl text-white disabled:opacity-60"
          style={{ background: "var(--midnight)" }}
        >
          {connecting ? "Opening Stripe..." : ready ? "Manage Stripe setup" : "Connect Stripe"}
        </button>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-bold mb-2" style={{ color: "var(--midnight)" }}>
          Sale notifications
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--ash)" }}>
          Add a phone number for upcoming WhatsApp and SMS sale alerts.
        </p>
        <Link
          href="/dashboard/settings/notifications"
          className="inline-flex text-sm font-bold px-4 py-2.5 rounded-xl text-white"
          style={{ background: "var(--midnight)" }}
        >
          Notification settings
        </Link>
      </div>
    </div>
  );
}
