import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

// Icons
function OverviewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
    </svg>
  );
}
function LinksIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>
  );
}
function DiscoverIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
  );
}
function TransactionsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  );
}
function PayoutsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}
function AiImportIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const MERCHANT_NAV = [
  { href: "/dashboard", label: "Overview", icon: <OverviewIcon /> },
  { href: "/dashboard/products", label: "Products", icon: <ProductsIcon /> },
  { href: "/dashboard/transactions", label: "Transactions", icon: <TransactionsIcon /> },
  { href: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
  { href: "/dashboard/ai-import", label: "AI Import", icon: <AiImportIcon /> },
];

const AFFILIATE_NAV = [
  { href: "/dashboard", label: "Overview", icon: <OverviewIcon /> },
  { href: "/dashboard/links", label: "My Links", icon: <LinksIcon /> },
  { href: "/dashboard/discover", label: "Discover", icon: <DiscoverIcon /> },
  { href: "/dashboard/payouts", label: "Payouts", icon: <PayoutsIcon /> },
];

const BOTH_NAV = [
  { href: "/dashboard", label: "Overview", icon: <OverviewIcon /> },
  { href: "/dashboard/products", label: "Products", icon: <ProductsIcon /> },
  { href: "/dashboard/links", label: "My Links", icon: <LinksIcon /> },
  { href: "/dashboard/discover", label: "Discover", icon: <DiscoverIcon /> },
  { href: "/dashboard/payouts", label: "Payouts", icon: <PayoutsIcon /> },
  { href: "/dashboard/transactions", label: "Transactions", icon: <TransactionsIcon /> },
  { href: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
  { href: "/dashboard/ai-import", label: "AI Import", icon: <AiImportIcon /> },
];

async function getUserRole(): Promise<{ role: string; name: string }> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) return { role: "merchant", name: "" };

    const res = await fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { role: "merchant", name: "" };
    const user = await res.json();
    return { role: user.role ?? "merchant", name: user.name ?? "" };
  } catch {
    return { role: "merchant", name: "" };
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, name } = await getUserRole();

  const navItems =
    role === "affiliate"
      ? AFFILIATE_NAV
      : role === "both"
      ? BOTH_NAV
      : MERCHANT_NAV;

  const roleLabel =
    role === "affiliate" ? "Affiliate" : role === "both" ? "Merchant & Affiliate" : "Merchant";

  const initial = name ? name[0].toUpperCase() : roleLabel[0];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--canvas)" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r flex-col shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--midnight)" }}>SplitLink</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: "var(--graphite)" }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "var(--ash)" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--stone)", color: "var(--graphite)" }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: "var(--charcoal)" }}>
                {name || roleLabel}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--ash)" }}>
                {roleLabel}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden bg-white border-b px-4 h-14 flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--midnight)" }}>SplitLink</span>
          </Link>
          {/* Mobile nav would go here as a hamburger — omitted for MVP */}
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
