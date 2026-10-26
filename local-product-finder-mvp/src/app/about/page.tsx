import Link from "next/link";
import { Store, ShieldCheck, Heart, Sparkles, Database, CheckCircle2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
      {/* Hero section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Store className="w-3.5 h-3.5" />
          <span>About Local Product Finder</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
          Connecting neighborhood shoppers with independent local merchants.
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          Too often, people order essentials online or drive across town without knowing that their local corner store or family-owned market has the exact item sitting on the shelf at an honest price.
        </p>
      </div>

      {/* Core Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-lg font-bold text-stone-900">Zero Guesswork</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Customers check live quantities, prices, and last-updated verification times before putting on their shoes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-lg font-bold text-stone-900">Data Integrity</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            We never guess stock, invent fake listings, or hallucinate store hours. If data is stale or missing, we disclose it plainly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            3
          </div>
          <h2 className="text-lg font-bold text-stone-900">Gemma AI Search</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Natural language understanding extracts sizes, brands, and preferences without forcing rigid database keywords.
          </p>
        </div>
      </div>

      {/* Technical Stack Architecture Details */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            Technical Architecture & Stack Rationale
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Built for Real-Time Accuracy & High Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-300">
          <div className="space-y-1.5 p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-white text-sm">Next.js App Router (React 19)</h3>
            <p className="text-stone-400">
              Provides streaming server-rendered pages, robust API route handlers, and zero-client-overhead for customer searching.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-white text-sm">PostgreSQL + Drizzle ORM</h3>
            <p className="text-stone-400">
              Persistent relational storage with strictly enforced foreign-key ownership, full-text case-insensitive indices, and zero raw SQL vulnerabilities.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-white text-sm">Gemma AI & Fallback NLP</h3>
            <p className="text-stone-400">
              Integrates Gemma AI model API with a resilient heuristic fallback engine that gracefully handles network drops or missing API keys.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-white text-sm">Haversine Geospatial Distances</h3>
            <p className="text-stone-400">
              Exact mathematical Great-Circle spherical distance computation between shopper coordinates and verified shop locations.
            </p>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="text-center pt-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
        >
          <span>Try Searching Local Stock</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
