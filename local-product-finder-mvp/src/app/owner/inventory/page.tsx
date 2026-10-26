"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, getStockStatus, timeAgo } from "@/lib/utils";
import {
  Package,
  Plus,
  Upload,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Store,
  Layers,
  ArrowUpRight,
  Loader2,
  FileSpreadsheet,
  Check
} from "lucide-react";

interface ProductItem {
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
  isDraft: boolean;
  isDemo: boolean;
  lastStockUpdated: string;
}

interface ShopData {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  isDemo: boolean;
}

interface StatsData {
  totalProducts: number;
  publishedProducts: number;
  draftCount: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export default function OwnerInventoryDashboard() {
  const router = useRouter();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & tab filters inside dashboard
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "drafts" | "low_stock" | "out_of_stock">("all");

  // CSV Import Modal State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [csvDraftOption, setCsvDraftOption] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState<string | null>(null);

  // Selected drafts for publishing batch
  const [selectedDraftIds, setSelectedDraftIds] = useState<number[]>([]);
  const [publishing, setPublishing] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/owner/inventory");
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load inventory data.");
      }
      const data = await res.json();
      setShop(data.shop);
      setProducts(data.products || []);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}" from your shop's inventory?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/owner/inventory/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete product.");
      }
      loadInventory();
    } catch (err: any) {
      alert(err.message || "Could not delete product.");
    }
  };

  const handlePublishDrafts = async () => {
    if (selectedDraftIds.length === 0) return;
    try {
      setPublishing(true);
      const res = await fetch("/api/owner/inventory/publish-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedDraftIds }),
      });
      if (!res.ok) throw new Error("Failed to publish selected drafts.");
      setSelectedDraftIds([]);
      await loadInventory();
    } catch (err: any) {
      alert(err.message || "Could not publish drafts.");
    } finally {
      setPublishing(false);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    try {
      setCsvLoading(true);
      setCsvResult(null);
      const res = await fetch("/api/owner/inventory/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          asDraft: csvDraftOption,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import CSV.");

      setCsvResult(data.message);
      setCsvContent("");
      await loadInventory();
      setTimeout(() => {
        setCsvModalOpen(false);
        setCsvResult(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message || "CSV Import failed.");
    } finally {
      setCsvLoading(false);
    }
  };

  const sampleCsvTemplate = `name,price,stock,brand,category,size,barcode,description
Organic Whole Milk,5.49,15,Organic Valley,Dairy & Eggs,1 Gallon,093966000147,Fresh organic whole milk
Jasmine White Rice,4.25,20,Lundberg,Pantry & Grains,1 kg,073416001024,Non-GMO Jasmine rice
Ground Espresso Coffee,5.99,8,Bustelo,Beverages,283 g,074471011122,Dark roast brick`;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Filter products based on search term & tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchFilter ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchFilter));

    if (!matchesSearch) return false;

    if (activeTab === "drafts") return p.isDraft;
    if (activeTab === "low_stock") return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    if (activeTab === "out_of_stock") return p.stockQuantity <= 0;
    return true;
  });

  const draftProducts = products.filter((p) => p.isDraft);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Shop Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded">
              Merchant Management
            </span>
            {shop?.isDemo && (
              <span className="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                Demo Shop
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-emerald-600" />
            <span>{shop?.name || "Shop Dashboard"}</span>
          </h1>
          <p className="text-xs text-stone-500">
            {shop?.address}, {shop?.city}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {shop?.slug && (
            <Link
              href={`/shop/${shop.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
            >
              <span>View Public Page</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition border border-stone-300"
          >
            <Upload className="w-3.5 h-3.5 text-stone-600" />
            <span>Import CSV</span>
          </button>

          <Link
            href="/owner/inventory/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Item</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Total Items</span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {stats.totalProducts}
            </span>
            <span className="text-[11px] text-stone-400">In database</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-xs text-emerald-800 font-medium block">Live / Published</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {stats.publishedProducts}
            </span>
            <span className="text-[11px] text-stone-400">Visible to shoppers</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-xs text-amber-800 font-medium block">Drafts (Pending)</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats.draftCount}
            </span>
            <span className="text-[11px] text-stone-400">Review before publish</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <span className="text-xs text-amber-800 font-medium block">Low Stock</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats.lowStockCount}
            </span>
            <span className="text-[11px] text-stone-400">Near threshold</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs col-span-2 lg:col-span-1">
            <span className="text-xs text-rose-800 font-medium block">Out of Stock</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stats.outOfStockCount}
            </span>
            <span className="text-[11px] text-stone-400">0 units on shelf</span>
          </div>
        </div>
      )}

      {/* Review & Confirm Drafts Alert Banner if any drafts exist */}
      {draftProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-amber-900 text-sm">
                You have {draftProducts.length} pending draft item{draftProducts.length === 1 ? "" : "s"}
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Review and confirm newly added or imported items before they become visible to customers on search.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedDraftIds(draftProducts.map((p) => p.id));
                setActiveTab("drafts");
              }}
              className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition"
            >
              Select All Drafts
            </button>
            <button
              type="button"
              disabled={publishing || selectedDraftIds.length === 0}
              onClick={handlePublishDrafts}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Confirm & Publish ({selectedDraftIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drafts")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "drafts"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Drafts ({stats?.draftCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("low_stock")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "low_stock"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Low Stock ({stats?.lowStockCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("out_of_stock")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "out_of_stock"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Out of Stock ({stats?.outOfStockCount || 0})
            </button>
          </div>

          {/* Search box inside table */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter by name, brand, barcode..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table Content */}
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  {activeTab === "drafts" && (
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDraftIds.length === draftProducts.length && draftProducts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDraftIds(draftProducts.map((p) => p.id));
                          } else {
                            setSelectedDraftIds([]);
                          }
                        }}
                        className="rounded text-emerald-600"
                      />
                    </th>
                  )}
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Last Stock Updated</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredProducts.map((p) => {
                  const stock = getStockStatus(p.stockQuantity, p.lowStockThreshold);
                  const isSelected = selectedDraftIds.includes(p.id);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition">
                      {activeTab === "drafts" && (
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDraftIds([...selectedDraftIds, p.id]);
                              } else {
                                setSelectedDraftIds(selectedDraftIds.filter((id) => id !== p.id));
                              }
                            }}
                            className="rounded text-emerald-600"
                          />
                        </td>
                      )}
                      <td className="p-4">
                        <div className="font-bold text-stone-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          {p.brand && <span>Brand: {p.brand}</span>}
                          {p.size && <span>• Size: {p.size}</span>}
                          {p.barcode && <span className="font-mono text-stone-400">#{p.barcode}</span>}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-stone-900 text-sm">
                        {formatCurrency(p.price, p.currency)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stock.badgeClass}`}
                        >
                          {stock.color === "emerald" && <CheckCircle2 className="w-3 h-3" />}
                          {stock.color === "amber" && <AlertTriangle className="w-3 h-3" />}
                          {stock.color === "rose" && <XCircle className="w-3 h-3" />}
                          <span>{stock.status} ({p.stockQuantity})</span>
                        </span>
                      </td>

                      <td className="p-4 text-stone-500 text-[11px]">
                        <div className="flex items-center gap-1" title={new Date(p.lastStockUpdated).toLocaleString()}>
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{timeAgo(p.lastStockUpdated)}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {p.isDraft ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Draft (Hidden)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Published
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/owner/inventory/${p.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition"
                        >
                          <Edit className="w-3 h-3 text-stone-600" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-stone-700 font-semibold text-sm">No products found in this view.</p>
            <p className="text-stone-500 text-xs">
              Add your first product or import your shelf inventory via CSV.
            </p>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Import Products from CSV</h3>
                  <p className="text-xs text-stone-500">
                    Paste raw comma-separated inventory data to bulk add items.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {csvResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{csvResult}</span>
              </div>
            )}

            <form onSubmit={handleCsvImport} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700">CSV Data Text</label>
                  <button
                    type="button"
                    onClick={() => setCsvContent(sampleCsvTemplate)}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    Insert Example Sample
                  </button>
                </div>
                <textarea
                  rows={8}
                  required
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={`name,price,stock,brand,category,size,barcode,description\nApples 1kg,3.50,15,Red Delicious,Produce,1 kg,01234567,Sweet organic apples`}
                  className="w-full text-xs font-mono p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Required columns: <code>name</code>, <code>price</code>, <code>stock</code>. Optional: <code>brand</code>, <code>category</code>, <code>size</code>, <code>barcode</code>, <code>description</code>.
                </p>
              </div>

              {/* Review & Confirm Workflow Toggle */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={csvDraftOption}
                    onChange={(e) => setCsvDraftOption(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      Import items as drafts for review
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Recommended: Allows you to review and confirm prices/quantities before making them public.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={csvLoading || !csvContent.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {csvLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Start Import</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
