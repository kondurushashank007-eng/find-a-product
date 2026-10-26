"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import {
  Filter,
  ArrowUpDown,
  Sparkles,
  HelpCircle,
  MapPin,
  PackageX,
  RefreshCw,
  Loader2,
  Check,
  ChevronDown,
  Info
} from "lucide-react";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const brandParam = searchParams.get("brand") || "";
  const categoryParam = searchParams.get("category") || "";
  const inStockOnlyParam = searchParams.get("inStockOnly") === "true";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const sortByParam = searchParams.get("sortBy") || "distance";
  const maxDistanceParam = searchParams.get("maxDistance") || "";
  const latParam = searchParams.get("lat") || "";
  const lonParam = searchParams.get("lon") || "";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalCount: 0, totalPages: 1, hasMore: false });
  const [aiInterpretation, setAiInterpretation] = useState<any>(null);
  const [facets, setFacets] = useState<{ categories: string[]; brands: string[] }>({ categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local filter states
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [inStockOnly, setInStockOnly] = useState(inStockOnlyParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [sortBy, setSortBy] = useState(sortByParam);
  const [maxDistance, setMaxDistance] = useState(maxDistanceParam);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch results
  const fetchProducts = async (pageToFetch: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (selectedBrand) params.set("brand", selectedBrand);
      if (selectedCategory) params.set("category", selectedCategory);
      if (inStockOnly) params.set("inStockOnly", "true");
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (maxDistance) params.set("maxDistance", maxDistance);
      if (sortBy) params.set("sortBy", sortBy);
      if (latParam) params.set("lat", latParam);
      if (lonParam) params.set("lon", lonParam);

      params.set("page", pageToFetch.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch product inventory.");
      }
      const data = await res.json();

      if (append) {
        setProducts((prev) => [...prev, ...data.items]);
      } else {
        setProducts(data.items || []);
      }

      setPagination(data.pagination);
      setAiInterpretation(data.aiInterpretation);
      if (data.facets) {
        setFacets(data.facets);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while searching.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setSelectedBrand(brandParam);
    setSelectedCategory(categoryParam);
    setInStockOnly(inStockOnlyParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setSortBy(sortByParam);
    setMaxDistance(maxDistanceParam);
  }, [brandParam, categoryParam, inStockOnlyParam, minPriceParam, maxPriceParam, sortByParam, maxDistanceParam]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [q, selectedBrand, selectedCategory, inStockOnly, minPrice, maxPrice, sortBy, maxDistance, latParam, lonParam]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedBrand) params.set("brand", selectedBrand); else params.delete("brand");
    if (selectedCategory) params.set("category", selectedCategory); else params.delete("category");
    if (inStockOnly) params.set("inStockOnly", "true"); else params.delete("inStockOnly");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (maxDistance) params.set("maxDistance", maxDistance); else params.delete("maxDistance");
    if (sortBy) params.set("sortBy", sortBy);
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSelectedBrand("");
    setSelectedCategory("");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setMaxDistance("");
    setSortBy("distance");
    router.push(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}${latParam ? `&lat=${latParam}&lon=${lonParam}` : ""}`);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchProducts(pagination.page + 1, true);
    }
  };

  // Find lowest price item to highlight
  const minPriceFound = products.length > 0 ? Math.min(...products.map((p) => p.price)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Search Header Bar */}
      <div className="mb-6">
        <SearchBar
          initialQuery={q}
          initialInStockOnly={inStockOnly}
          compact
        />
      </div>

      {/* AI Query Interpretation banner */}
      {aiInterpretation && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200/70 text-stone-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Gemma AI Query Understanding
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {aiInterpretation.source === "gemma-ai" ? "Gemini/Gemma API" : "Semantic NLP Heuristic"}
                </span>
              </div>
              <p className="text-sm text-stone-700">
                Searching for: <strong className="text-stone-900">&ldquo;{aiInterpretation.interpretedQuery}&rdquo;</strong>
                {aiInterpretation.brand && <span> • Brand: <strong>{aiInterpretation.brand}</strong></span>}
                {aiInterpretation.pricePreference === "cheap" && <span> • Prioritizing budget / lowest price</span>}
                {aiInterpretation.inStockOnly && <span> • Filtering for in-stock items</span>}
              </p>

              {/* Clarifying question if query is ambiguous */}
              {aiInterpretation.clarifyingQuestion && (
                <div className="mt-2 pt-2 border-t border-emerald-200/50 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/70 p-2 rounded-lg">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Clarification suggestion: </span>
                    {aiInterpretation.clarifyingQuestion}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main layout: Filters sidebar + Results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-base">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
              >
                Reset all
              </button>
            </div>

            {/* In stock toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-stone-50 border border-stone-200/80">
                <span className="text-sm font-semibold text-stone-800">In stock only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                  }}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                {facets.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            {facets.brands.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Brands</option>
                  {facets.brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Max Distance */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Max Distance
              </label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any distance</option>
                <option value="1">Within 1 km (walking)</option>
                <option value="3">Within 3 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
              </select>
              {!latParam && (
                <p className="text-[11px] text-stone-400 mt-1">
                  Note: Distance requires location permission or GPS.
                </p>
              )}
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Price Range ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-800"
                  min="0"
                  step="0.5"
                />
                <span className="text-stone-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-800"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-2xs"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Sort, Count, Mobile Filter Trigger */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900">
                {pagination.totalCount} product{pagination.totalCount === 1 ? "" : "s"} found
              </span>
              {q && (
                <span className="text-xs text-stone-500">
                  matching &ldquo;<strong className="text-stone-700">{q}</strong>&rdquo;
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("sortBy", e.target.value);
                    router.push(`/search?${params.toString()}`);
                  }}
                  className="text-xs font-medium bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="distance">Distance (Closest First)</option>
                  <option value="price_asc">Lowest Price ($ - $$$)</option>
                  <option value="price_desc">Highest Price ($$$ - $)</option>
                  <option value="stock_desc">Highest Stock Available</option>
                  <option value="updated_desc">Recently Updated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Collapsible Filters */}
          {filtersOpen && (
            <div className="lg:hidden bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-bold text-stone-900 text-sm">Refine Results</span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-700 underline"
                >
                  Reset
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-stone-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>In stock items only</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-stone-50"
                  >
                    <option value="">All Categories</option>
                    {facets.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Max Distance</label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-stone-50"
                  >
                    <option value="">Any distance</option>
                    <option value="1">Within 1 km</option>
                    <option value="3">Within 3 km</option>
                    <option value="5">Within 5 km</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  applyFilters();
                  setFiltersOpen(false);
                }}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Apply
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 bg-stone-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-900 space-y-2">
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={() => fetchProducts(1, false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Search</span>
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    highlightLowestPrice={minPriceFound !== null && product.price === minPriceFound}
                  />
                ))}
              </div>

              {/* Pagination / Load more */}
              {pagination.hasMore && (
                <div className="text-center pt-6 pb-4">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-300 hover:border-emerald-500 rounded-xl text-stone-800 font-semibold text-sm transition shadow-2xs hover:shadow-xs disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Loading more products...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Products ({pagination.totalCount - products.length} remaining)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State with Broadening Suggestions */
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <PackageX className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-stone-900">
                  No matching items found
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  We couldn&apos;t find any products matching your current filters and query in this area.
                </p>
              </div>

              {/* Suggestions to broaden search */}
              <div className="pt-2 max-w-md mx-auto bg-stone-50 rounded-2xl p-4 text-left border border-stone-200 text-xs text-stone-700 space-y-2">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Try broadening your search:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li>Uncheck <strong>&ldquo;In stock only&rdquo;</strong> to view items that may be restocked soon.</li>
                  <li>Increase your distance filter or clear specific brand requirements.</li>
                  <li>Search for a general category (e.g. &ldquo;rice&rdquo;, &ldquo;milk&rdquo;, &ldquo;bread&rdquo;) instead of a specific brand.</li>
                </ul>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Clear All Filters
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/search?q=rice&lat=40.7282&lon=-73.9980")}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition"
                >
                  Try demo search: &ldquo;rice&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
