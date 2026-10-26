"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import {
  Store,
  Sparkles,
  MapPin,
  TrendingDown,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Search
} from "lucide-react";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        // Load popular essentials around demo area
        const res = await fetch("/api/products/search?limit=6&lat=40.7282&lon=-73.9980");
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const popularSearches = [
    { label: "Jasmine Rice 1 kg", query: "jasmine rice 1 kg" },
    { label: "Organic Milk", query: "organic milk" },
    { label: "Sourdough Loaf", query: "sourdough bread" },
    { label: "Olive Oil", query: "olive oil" },
    { label: "Coffee Beans", query: "coffee beans" },
    { label: "Brown Eggs", query: "eggs" },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Real-time neighborhood inventory & price comparison</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            Find items at nearby shops. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Compare prices before you leave.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-base sm:text-lg leading-relaxed">
            Search local bodegas, farm markets, and independent grocery stores.
            See on-shelf quantities, verified prices, and exact walking distances in seconds.
          </p>

          {/* Search Bar Component */}
          <div className="pt-4 max-w-3xl mx-auto text-left">
            <SearchBar />
          </div>

          {/* Popular searches quick pills */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-300">
            <span className="text-stone-400 font-medium">Popular:</span>
            {popularSearches.map((item) => (
              <Link
                key={item.label}
                href={`/search?q=${encodeURIComponent(item.query)}&lat=40.7282&lon=-73.9980`}
                className="px-3 py-1 rounded-full bg-stone-800/80 hover:bg-stone-700 border border-stone-700/80 text-stone-200 transition flex items-center gap-1.5"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Demo disclaimer banner */}
          <div className="pt-6">
            <div className="inline-block bg-stone-800/60 border border-stone-700 rounded-xl p-3 text-xs text-stone-300 text-left sm:text-center">
              <span className="font-semibold text-amber-300">⚡ Live Demo Ready:</span> Demo shops in Downtown / Greenwich Village are pre-seeded with real products and prices. No registration required to search!
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-12 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">True Price Comparison</h2>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Compare unit prices across neighboring independent grocers. Discover which local store has jasmine rice, milk, or coffee at the best price.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">Verified Live Stock Counts</h2>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  See exact quantities in stock (In stock, Low stock, or Out of stock) with timestamps showing when the merchant last updated their inventory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">Gemma AI Natural Search</h2>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Ask naturally like &ldquo;cheap 1 kg rice near me&rdquo; or &ldquo;fresh sourdough bread&rdquo;. Gemma AI extracts product, brand, size, and intent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Nearby Sample Products */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Available in demo neighborhood</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Trending Local Groceries
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Real-time prices and on-shelf quantities at local participating grocers.
            </p>
          </div>

          <Link
            href="/search?lat=40.7282&lon=-73.9980"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 group"
          >
            <span>Explore all local stock</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-stone-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
            <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-700 font-medium">No products found yet.</p>
          </div>
        )}
      </section>

      {/* Shop Owner CTA Section */}
      <section className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              For Independent Grocers & Bodegas
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Bring your local foot traffic back. List your shop stock in 2 minutes.
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Let nearby shoppers see that what they need is already on your shelves. Bulk import inventory from CSV, track low-stock warnings, and review changes before going live.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                No app installation required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                CSV spreadsheet import
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Free merchant account
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/auth/register"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-sm transition shadow-md"
            >
              Register Your Shop Free
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-xl text-center text-sm transition border border-stone-600"
            >
              Merchant Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
