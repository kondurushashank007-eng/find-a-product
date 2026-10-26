"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "General",
    size: "",
    barcode: "",
    price: "",
    currency: "USD",
    stockQuantity: "0",
    lowStockThreshold: "5",
    description: "",
    isDraft: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/owner/inventory/${productId}`);
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Product not found or access denied.");
        }
        const data = await res.json();
        const p = data.product;
        setFormData({
          name: p.name || "",
          brand: p.brand || "",
          category: p.category || "General",
          size: p.size || "",
          barcode: p.barcode || "",
          price: p.price?.toString() || "0",
          currency: p.currency || "USD",
          stockQuantity: p.stockQuantity?.toString() || "0",
          lowStockThreshold: p.lowStockThreshold?.toString() || "5",
          description: p.description || "",
          isDraft: Boolean(p.isDraft),
        });
      } catch (err: any) {
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/owner/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product.");
      }

      router.push("/owner/inventory");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div>
        <Link
          href="/owner/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to inventory dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded">
            Modify Listing
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Edit Product</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Updating the stock count or price immediately refreshes the customer view timestamp.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Pantry & Grains">Pantry & Grains</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Bakery">Bakery</option>
                <option value="Beverages">Beverages</option>
                <option value="Produce">Produce</option>
                <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                <option value="Pantry & Oils">Pantry & Oils</option>
                <option value="Household & Personal Care">Household & Personal Care</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Size / Package</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Barcode (UPC / EAN)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full text-sm font-mono px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Price * ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-24 text-xs font-semibold px-2 border border-stone-300 rounded-xl bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Current Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Low-Stock Alert Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDraft}
                onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  Mark as Draft (Unpublished)
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Uncheck this to publish immediately to public search.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              href="/owner/inventory"
              className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
