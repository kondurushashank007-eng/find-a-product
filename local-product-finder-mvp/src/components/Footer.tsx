import Link from "next/link";
import { Store, ShieldCheck, Heart, Sparkles, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Local<span className="text-emerald-400">Finder</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Find fresh groceries, pantry staples, and specialty items right around the corner. Compare real-time shelf prices and live stock before you head out.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-xs text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemma AI natural search ready</span>
            </div>
          </div>

          {/* Customer links */}
          <div>
            <h4 className="font-semibold text-sm text-white uppercase tracking-wider mb-3">Customer Search</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">Home & Search</Link>
              </li>
              <li>
                <Link href="/search?q=rice" className="hover:text-emerald-400 transition">Compare Rice Prices</Link>
              </li>
              <li>
                <Link href="/search?q=milk" className="hover:text-emerald-400 transition">Find Fresh Organic Milk</Link>
              </li>
              <li>
                <Link href="/search?q=sourdough" className="hover:text-emerald-400 transition">Artisan Sourdough Loaves</Link>
              </li>
              <li>
                <Link href="/search?inStockOnly=true" className="hover:text-emerald-400 transition">In-stock Items Only</Link>
              </li>
            </ul>
          </div>

          {/* Shop Owners */}
          <div>
            <h4 className="font-semibold text-sm text-white uppercase tracking-wider mb-3">For Local Shops</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/register" className="hover:text-emerald-400 transition">Register Your Shop</Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-emerald-400 transition">Merchant Portal Sign In</Link>
              </li>
              <li>
                <Link href="/owner/inventory" className="hover:text-emerald-400 transition">Inventory Dashboard</Link>
              </li>
              <li>
                <Link href="/owner/inventory/add" className="hover:text-emerald-400 transition">Add New Product</Link>
              </li>
              <li>
                <Link href="/about#csv-import" className="hover:text-emerald-400 transition">CSV Bulk Inventory Sync</Link>
              </li>
            </ul>
          </div>

          {/* Trust and details */}
          <div>
            <h4 className="font-semibold text-sm text-white uppercase tracking-wider mb-3">Trust & Accuracy</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              We never fabricate inventory counts or fake shop open hours. Inventory items show exact timestamp verification. Listings marked <span className="bg-amber-900/40 text-amber-300 px-1 py-0.5 rounded text-[11px] font-mono">DEMO</span> highlight sample data.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified merchant ownership checks</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Local Product Finder. Empowering neighborhood bodegas and specialty shops.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-stone-400">About Platform</Link>
            <Link href="/contact" className="hover:text-stone-400">Contact & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
