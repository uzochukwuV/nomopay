"use client";

import { useState } from "react";
import { useSafeAuth } from "@/app/lib/use-safe-clerk";
import { readApiResponse } from "@/app/lib/http";
import Link from "next/link";

export default function NotificationsPage() {
  const { getToken } = useSafeAuth();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!res.ok) {
        const d = await readApiResponse<{ error?: string }>(res).catch((err) => ({
          error: err instanceof Error ? err.message : "Failed to save",
        }));
        setError(d.error ?? "Failed to save");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sale notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Get notified instantly when a sale comes in.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {saved ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-600">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Number saved</h3>
            <p className="text-sm text-gray-500 mb-6">
              Email alerts are active now. WhatsApp/SMS alerts are coming soon.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                WhatsApp / phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Include country code. We&apos;ll send a ping here when you make a sale.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex gap-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-amber-800">Email notifications are already active</p>
                  <p className="text-xs text-amber-700 mt-0.5">WhatsApp/SMS alerts are coming soon — saving your number now means you&apos;ll be first when it ships.</p>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !phone.trim()}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save number"
                )}
              </button>
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Skip for now
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
