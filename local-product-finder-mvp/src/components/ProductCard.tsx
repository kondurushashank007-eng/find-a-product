import Link from "next/link";
import { formatCurrency, formatDistance, getStockStatus, timeAgo } from "@/lib/utils";
import { Store, MapPin, Clock, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from "lucide-react";

export interface ProductItem {
  id: number;
  name: string;
  brand?: string | null;
  category: string;
  size?: string | null;
  barcode?: string | null;
  description?: string | null;
  price: number;
  currency: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isDemo: boolean;
  lastStockUpdated: string | Date;
  shopId: number;
  shopName: string;
  shopSlug: string;
  shopAddress: string;
  shopCity: string;
  shopPhone?: string | null;
  shopOpeningHours?: string | null;
  distanceKm?: number | null;
}

interface ProductCardProps {
  product: ProductItem;
  highlightLowestPrice?: boolean;
}

export default function ProductCard({ product, highlightLowestPrice = false }: ProductCardProps) {
  const stockInfo = getStockStatus(product.stockQuantity, product.lowStockThreshold);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-300 transition-all shadow-xs hover:shadow-md p-5 flex flex-col justify-between relative group">
      {/* Demo Badge */}
      {product.isDemo && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200" title="This is verified demo data for evaluation">
            DEMO LISTING
          </span>
        </div>
      )}

      {/* Main product info */}
      <div>
        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 pr-20">
          <span className="font-semibold text-emerald-800 uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded">
            {product.category}
          </span>
          {product.brand && (
            <span className="font-medium text-stone-600 truncate">• {product.brand}</span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Size / Barcode tags */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-600">
          {product.size && (
            <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-medium">
              {product.size}
            </span>
          )}
          {product.barcode && (
            <span className="font-mono text-stone-400 text-[11px]" title="Barcode UPC/EAN">
              #{product.barcode}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Price & Stock Section */}
      <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-stone-900">
              {formatCurrency(product.price, product.currency)}
            </span>
            {highlightLowestPrice && (
              <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Lowest Price
              </span>
            )}
          </div>

          {/* Stock status indicator */}
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stockInfo.badgeClass}`}
            >
              {stockInfo.color === "emerald" && <CheckCircle2 className="w-3 h-3" />}
              {stockInfo.color === "amber" && <AlertTriangle className="w-3 h-3" />}
              {stockInfo.color === "rose" && <XCircle className="w-3 h-3" />}
              {stockInfo.status}
            </span>
            <div className="text-[11px] text-stone-500 mt-0.5">
              {product.stockQuantity > 0 ? `${product.stockQuantity} on shelf` : "Out of stock"}
            </div>
          </div>
        </div>

        {/* Shop Info & Distance */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <Link
                href={`/shop/${product.shopSlug}`}
                className="text-sm font-semibold text-stone-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">{product.shopName}</span>
              </Link>
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{product.shopAddress}, {product.shopCity}</span>
              </div>
            </div>

            {/* Distance badge */}
            {product.distanceKm !== null && product.distanceKm !== undefined ? (
              <span className="shrink-0 text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                {formatDistance(product.distanceKm)}
              </span>
            ) : (
              <span className="shrink-0 text-[11px] text-stone-400 font-medium">
                Distance N/A
              </span>
            )}
          </div>

          {/* Inventory updated timestamp */}
          <div className="mt-2 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px] text-stone-500">
            <div className="flex items-center gap-1" title={new Date(product.lastStockUpdated).toLocaleString()}>
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Stock verified: {timeAgo(product.lastStockUpdated)}</span>
            </div>

            <Link
              href={`/shop/${product.shopSlug}`}
              className="text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View shop</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
