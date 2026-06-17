import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--midnight)" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ash)" }}>
          Manage account preferences and notifications.
        </p>
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
