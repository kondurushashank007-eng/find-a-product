"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, User, MapPin, Phone, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    shopName: "",
    category: "Grocery & General",
    shopAddress: "",
    shopCity: "New York",
    shopState: "NY",
    shopPostalCode: "10014",
    phone: "",
    openingHours: "Mon-Sat: 8:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register shop.");
      }

      // Successfully registered & cookie set
      router.push("/owner/inventory");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Register Your Shop
          </h1>
          <p className="text-sm text-stone-600">
            Create your merchant account to manage your store profile, upload stock via CSV, and get discovered by neighborhood shoppers.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Merchant Credentials */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-stone-200">
              Step 1: Merchant Owner Account
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Rossi"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="owner@yourshop.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password * (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shop Profile Details */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-stone-200">
              Step 2: Shop Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Shop Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Village Gourmet Grocer"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Store Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Grocery & General">Grocery & General</option>
                  <option value="Organic & Farm Produce">Organic & Farm Produce</option>
                  <option value="Convenience & Bodega">Convenience & Bodega</option>
                  <option value="Bakery & Delicatessen">Bakery & Delicatessen</option>
                  <option value="Specialty & International">Specialty & International</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Street Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 245 Bleecker Street"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                  className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.shopCity}
                  onChange={(e) => setFormData({ ...formData, shopCity: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.shopState}
                  onChange={(e) => setFormData({ ...formData, shopState: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={formData.shopPostalCode}
                  onChange={(e) => setFormData({ ...formData, shopPostalCode: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="(212) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Store Hours</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-stone-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Shop Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-stone-500">
          Already have a shop registered?{" "}
          <Link href="/auth/login" className="text-emerald-700 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
