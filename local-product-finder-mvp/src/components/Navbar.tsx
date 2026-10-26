"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Store, Search, User, LogOut, Package, MapPin, Sparkles, Menu, X } from "lucide-react";

interface AuthState {
  authenticated: boolean;
  user: { id: number; email: string; fullName: string; role: string } | null;
  shop: { id: number; name: string; slug: string; isDemo: boolean } | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ authenticated: false, user: null, shop: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setAuth(data);
      }
    } catch {
      // keep default unauthenticated state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    setAuth({ authenticated: false, user: null, shop: null });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-stone-900 block leading-tight">
                Local<span className="text-emerald-600">Finder</span>
              </span>
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                Compare local shop stock
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                pathname === "/" ? "text-emerald-700 font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Search
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition ${
                pathname.startsWith("/search") ? "text-emerald-700 font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Explore Products
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition ${
                pathname === "/about" ? "text-emerald-700 font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition ${
                pathname === "/contact" ? "text-emerald-700 font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {auth.authenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/owner/inventory"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>{auth.shop ? auth.shop.name : "Shop Dashboard"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
                >
                  Shop Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
                >
                  Register Shop
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
          >
            Search Products
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
          >
            Browse Products
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50"
          >
            Contact
          </Link>
          <div className="pt-2 border-t border-stone-200">
            {auth.authenticated ? (
              <div className="space-y-2">
                <Link
                  href="/owner/inventory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-emerald-800 bg-emerald-50"
                >
                  <Package className="w-4 h-4" />
                  <span>Dashboard: {auth.shop?.name || "Shop Inventory"}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-stone-600 hover:bg-stone-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2 text-stone-700 font-medium border border-stone-300 rounded-lg hover:bg-stone-50"
                >
                  Shop Owner Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
                >
                  Register Shop Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
