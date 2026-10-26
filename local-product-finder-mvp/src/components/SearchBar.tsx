"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, Navigation, X, SlidersHorizontal, Loader2 } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  initialInStockOnly?: boolean;
  className?: string;
  compact?: boolean;
}

export default function SearchBar({
  initialQuery = "",
  initialLocation = "",
  initialInStockOnly = false,
  className = "",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [locationName, setLocationName] = useState(initialLocation);
  const [inStockOnly, setInStockOnly] = useState(initialInStockOnly);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationName("My Current Location");
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access was denied. You can still type an area or search demo shops.");
        } else {
          setLocationError("Unable to retrieve location. Please check browser settings.");
        }
      },
      { timeout: 8000 }
    );
  };

  const handleUseDemoLocation = () => {
    // NYC Greenwich Village center where demo shops are located
    setCoords({ lat: 40.7282, lon: -73.9980 });
    setLocationName("Downtown / Greenwich Village (Demo)");
    setLocationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (inStockOnly) params.set("inStockOnly", "true");
    if (coords) {
      params.set("lat", coords.lat.toString());
      params.set("lon", coords.lon.toString());
    }
    if (locationName.trim() && !coords) {
      // If user typed a location name without gps coords, pass it
      params.set("loc", locationName.trim());
      // fallback to demo NYC coords if user specified NYC / downtown
      if (locationName.toLowerCase().includes("york") || locationName.toLowerCase().includes("ny") || locationName.toLowerCase().includes("downtown")) {
        params.set("lat", "40.7282");
        params.set("lon", "-73.9980");
      }
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className={`flex flex-col md:flex-row items-stretch bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden ${compact ? "p-1.5" : "p-2 sm:p-2.5"}`}>
          {/* Main search query input */}
          <div className="flex-1 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-stone-200">
            <Search className="w-5 h-5 text-emerald-600 shrink-0 mr-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Product name, brand, category, or barcode (e.g. 'cheap 1 kg rice')..."
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-sm sm:text-base focus:outline-none"
              aria-label="Search product name, brand, or barcode"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-stone-400 hover:text-stone-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location input / GPS selector */}
          <div className="flex-1 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-stone-200">
            <MapPin className="w-5 h-5 text-stone-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                setCoords(null);
              }}
              placeholder="Neighborhood, city, or zip (e.g. 'Downtown NY')..."
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-sm focus:outline-none"
              aria-label="Location or neighborhood"
            />
            {locating ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            ) : (
              <button
                type="button"
                onClick={requestGeolocation}
                className="shrink-0 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition flex items-center gap-1"
                title="Use current GPS location"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Near me</span>
              </button>
            )}
          </div>

          {/* Search CTA */}
          <div className="pt-2 md:pt-0 flex items-center justify-end px-1 sm:px-2">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Stock</span>
            </button>
          </div>
        </div>

        {/* Quick filters & helpers underneath */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200 hover:border-stone-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="font-medium text-stone-700">In-stock only</span>
            </label>

            <button
              type="button"
              onClick={handleUseDemoLocation}
              className="text-stone-600 hover:text-emerald-700 underline underline-offset-2 flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Use NYC Demo Area (see nearby shops)</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI understands natural phrases like &ldquo;cheap 1 kg rice&rdquo;</span>
          </div>
        </div>

        {/* Location error notice */}
        {locationError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-2 rounded-xl flex items-center justify-between">
            <span>{locationError}</span>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="text-amber-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
