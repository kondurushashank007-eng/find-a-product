"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      router.push("/owner/inventory");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("owner123");
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Shop Owner Sign In
          </h1>
          <p className="text-xs text-stone-600">
            Access your inventory dashboard, stock counts, and price manager.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourshop.com"
                className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Section */}
        <div className="pt-2 border-t border-stone-100">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-center mb-2">
            Quick Demo Accounts (Password: owner123)
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn("owner@greenvalleymarket.com")}
              className="w-full text-left text-xs p-2 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-stone-900 block">Green Valley Farm Market</span>
                <span className="text-stone-500">owner@greenvalleymarket.com</span>
              </div>
              <span className="text-emerald-700 font-semibold">Select</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn("marcus@cornerbodega.com")}
              className="w-full text-left text-xs p-2 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-stone-900 block">Vance&apos;s 24/7 Corner Bodega</span>
                <span className="text-stone-500">marcus@cornerbodega.com</span>
              </div>
              <span className="text-emerald-700 font-semibold">Select</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-500">
          New store owner?{" "}
          <Link href="/auth/register" className="text-emerald-700 font-bold hover:underline">
            Register your shop free
          </Link>
        </div>
      </div>
    </div>
  );
}
