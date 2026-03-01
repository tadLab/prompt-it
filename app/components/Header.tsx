"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHistoryCount } from "../hooks/useHistory";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const pathname = usePathname();
  const isBuilder = pathname === "/builder";
  const count = useHistoryCount();
  const { user, coins, supabase } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (isBuilder) return null;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Anchor links: use # on home page, /# on other pages
  const exampleHref = pathname === "/" ? "#example" : "/#example";
  const pricingHref = pathname === "/" ? "#pricing" : "/#pricing";

  const navLinks = (
    <>
      <a
        href={exampleHref}
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Example
      </a>
      <Link
        href="/builder"
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Builder
      </Link>
      <a
        href={pricingHref}
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Pricing
      </a>
    </>
  );

  // Desktop auth section
  const authSection = user ? (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center"
        aria-label="Account menu"
      >
        {user.user_metadata?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="w-8 h-8 rounded-full border border-white/20 hover:border-emerald-400/40 transition-colors"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-400/10 border border-white/20 hover:border-emerald-400/40 flex items-center justify-center transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </button>

      {/* Account dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-card-bright p-2 fade-in z-50 rounded-xl">
          {/* Coin balance */}
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 text-xs">●</span>
              <span className="text-sm font-medium">{coins}</span>
              <span className="text-white/40 text-xs">coins</span>
            </div>
          </div>

          {/* History link */}
          <Link
            href="/history"
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
          >
            History
            {count > 0 && (
              <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                {count}
              </span>
            )}
          </Link>

          {/* Sign out */}
          <button
            onClick={() => { handleSignOut(); setDropdownOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link
      href="/login"
      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
      onClick={() => setMenuOpen(false)}
      aria-label="Sign in"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-gradient-green text-xl font-bold tracking-tight">
        prompt it
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks}
        {authSection}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-white/60 hover:text-white text-2xl"
        aria-label="Toggle menu"
      >
        {menuOpen ? "\u2715" : "\u2630"}
      </button>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a1a14]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-8 md:hidden">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-6 text-white/60 hover:text-white text-2xl"
            aria-label="Close menu"
          >
            {"\u2715"}
          </button>
          <nav className="flex flex-col items-center gap-6 text-lg">
            {navLinks}
          </nav>
          <div className="flex flex-col items-center gap-4 mt-4">
            {user ? (
              <>
                <div className="badge flex items-center gap-1.5">
                  <span className="text-emerald-400 text-xs">●</span>
                  <span className="text-sm font-medium">{coins}</span>
                  <span className="text-white/40 text-xs ml-1">coins</span>
                </div>
                <Link
                  href="/history"
                  className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  History
                  {count > 0 && (
                    <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm text-white/60 hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
