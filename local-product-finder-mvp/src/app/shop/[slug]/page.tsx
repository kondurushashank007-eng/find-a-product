"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatCurrency, formatDistance, getStockStatus, timeAgo } from "@/lib/utils";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  Loader2,
  Package
} from "lucide-react";

interface ShopDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  openingHours: string;
  latitude: number;
  longitude: number;
  isDemo: boolean;
  distanceKm?: number | null;
}

interface Product {
  id: number;
  name: string;
  brand?: string;
  category: string;
  size?: string;
  barcode?: string;
  description?: string;
  price: number;
  currency: string;
  stockQuantity: number;
  lowStockThreshold: number;
  lastStockUpdated: string;
  isDemo: boolean;
}

export default function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        // Pass demo coordinates to calculate distance if available
        const res = await fetch(`/api/shops/${slug}?lat=40.7282&lon=-73.9980`);
        if (!res.ok) {
          throw new Error("Shop not found or failed to load");
        }
        const data = await res.json();
        setShop(data.shop);
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message || "Could not load shop information.");
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Shop Not Found</h2>
        <p className="text-stone-600 text-sm">{error || "This shop does not exist or has been removed."}</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Product Search</span>
        </Link>
      </div>
    );
  }

  // Filter products within shop
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>
      </div>

      {/* Shop Profile Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
                {shop.category}
              </span>
              {shop.isDemo && (
                <span className="text-[11px] font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                  DEMO SHOP
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Merchant</span>
              </span>
            </div>

            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              {shop.name}
            </h1>

            {shop.description && (
              <p className="text-stone-600 text-sm leading-relaxed">
                {shop.description}
              </p>
            )}

            {/* Address & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-stone-700">
              <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-900">Address</span>
                  <span>{shop.address}, {shop.city}, {shop.state} {shop.postalCode}</span>
                  {shop.distanceKm !== null && shop.distanceKm !== undefined && (
                    <span className="block font-bold text-emerald-700 mt-0.5">
                      {formatDistance(shop.distanceKm)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-900">Opening Hours</span>
                  <span>{shop.openingHours || "Hours not specified"}</span>
                </div>
              </div>

              {shop.phone && (
                <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <Phone className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-stone-900">Phone</span>
                    <a href={`tel:${shop.phone}`} className="hover:text-emerald-700 hover:underline">
                      {shop.phone}
                    </a>
                  </div>
                </div>
              )}

              {shop.email && (
                <div className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  <Mail className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-stone-900">Email</span>
                    <a href={`mailto:${shop.email}`} className="hover:text-emerald-700 hover:underline">
                      {shop.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Location Card / Open in Maps */}
          <div className="shrink-0 w-full md:w-72 bg-stone-100 rounded-2xl border border-stone-200 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Map Location</span>
              </div>
              <div className="bg-stone-200/80 rounded-xl h-28 flex flex-col items-center justify-center p-3 text-center border border-stone-300">
                <span className="text-xs font-mono text-stone-600">
                  Lat: {shop.latitude.toFixed(4)}, Lon: {shop.longitude.toFixed(4)}
                </span>
                <span className="text-[11px] text-stone-500 mt-1">
                  {shop.city}, {shop.state}
                </span>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${shop.name} ${shop.address} ${shop.city}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Shop Inventory Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>Current In-Store Inventory ({filteredProducts.length} items)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live stock counts verified directly by store manager.
            </p>
          </div>

          {/* Quick search inside shop */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search this shop's stock..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-60"
              />
            </div>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const stock = getStockStatus(p.stockQuantity, p.lowStockThreshold);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col justify-between hover:border-emerald-300 transition shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      {p.brand && <span className="text-stone-600 font-medium">{p.brand}</span>}
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm line-clamp-2">
                      {p.name}
                    </h3>

                    {p.size && (
                      <span className="inline-block mt-1 text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        {p.size}
                      </span>
                    )}

                    {p.description && (
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-end justify-between">
                    <div>
                      <span className="text-xl font-black text-stone-900">
                        {formatCurrency(p.price, p.currency)}
                      </span>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Verified {timeAgo(p.lastStockUpdated)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${stock.badgeClass}`}
                      >
                        {stock.color === "emerald" && <CheckCircle2 className="w-3 h-3" />}
                        {stock.color === "amber" && <AlertTriangle className="w-3 h-3" />}
                        {stock.color === "rose" && <XCircle className="w-3 h-3" />}
                        {stock.status}
                      </span>
                      <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                        {p.stockQuantity > 0 ? `${p.stockQuantity} on shelf` : "Out of stock"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
            <Package className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="text-sm font-medium">No items match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
