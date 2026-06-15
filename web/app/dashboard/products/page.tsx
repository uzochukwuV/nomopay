import Link from "next/link";

export default function ProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the products you sell through SplitLink.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-gray-400">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">No products yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
          Create your first product to start receiving affiliate-driven sales.
        </p>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Add your first product →
        </Link>
      </div>
    </div>
  );
}
