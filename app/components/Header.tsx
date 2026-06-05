"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHistoryCount } from "../hooks/useHistory";
import { useT, LanguageSwitcher } from "../i18n/LanguageProvider";

export default function Header() {
  const pathname = usePathname();
  const isBuilder = pathname === "/builder";
  const count = useHistoryCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();

  if (isBuilder) return null;

  const anchor = (hash: string) => pathname === "/" ? hash : `/${hash}`;

  const navLinks = (
    <>
      <a
        href={anchor("#about")}
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        {t("nav.about")}
      </a>
      <a
        href={anchor("#example")}
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        {t("nav.example")}
      </a>
      <a
        href={anchor("#how-it-works")}
        className="text-sm text-white/60 hover:text-white transition-colors"
        onClick={() => setMenuOpen(false)}
      >
        {t("nav.howItWorks")}
      </a>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-gradient-green text-xl font-bold tracking-tight">
        prompt it
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks}
        <Link
          href="/history"
          className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
        >
          {t("nav.history")}
          {count > 0 && (
            <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
        <LanguageSwitcher />
        <Link href="/builder" className="btn-primary text-sm !px-4 !py-1.5 rounded-full">
          {t("nav.build")}
        </Link>
      </nav>

      {/* Mobile: switcher + hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <LanguageSwitcher />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white/60 hover:text-white text-2xl"
          aria-label="Toggle menu"
        >
          {menuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

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
            <Link
              href="/history"
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.history")}
              {count > 0 && (
                <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </nav>
          <Link
            href="/builder"
            className="btn-primary text-base !px-6 !py-2.5 rounded-full mt-2"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.build")}
          </Link>
        </div>
      )}
    </header>
  );
}
