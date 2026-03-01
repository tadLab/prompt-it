"use client";

import { useState } from "react";
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

  if (isBuilder) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navLinks = (
    <>
      <Link
        href="/example"
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Example
      </Link>
      <Link
        href="/builder"
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        Builder
      </Link>
      <Link
        href="/history"
        className="badge flex items-center gap-2 hover:border-emerald-400/40 transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        <span>📜</span>
        <span>History</span>
        {count > 0 && (
          <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
      <Link
        href="/pricing"
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
        style={{
          background: "rgba(251, 191, 36, 0.1)",
          borderColor: "rgba(251, 191, 36, 0.25)",
          color: "#fbbf24",
        }}
        onClick={() => setMenuOpen(false)}
      >
        <span>💰</span>
        <span>Pricing</span>
      </Link>
    </>
  );

  const authSection = user ? (
    <div className="flex items-center gap-3">
      <Link
        href="/pricing"
        className="badge flex items-center gap-1.5 hover:border-emerald-400/40 transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        <span className="text-emerald-400 text-xs">&#9679;</span>
        <span className="text-sm font-medium">{coins}</span>
      </Link>
      {user.user_metadata?.avatar_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.user_metadata.avatar_url}
          alt=""
          className="w-7 h-7 rounded-full border border-white/20"
        />
      )}
      <button
        onClick={handleSignOut}
        className="text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        Sign out
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="text-sm text-white/60 hover:text-white transition-colors"
      onClick={() => setMenuOpen(false)}
    >
      Sign in
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
          {/* Close button at top right */}
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
          <div className="mt-4">
            {authSection}
          </div>
        </div>
      )}
    </header>
  );
}
