"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher, useLang } from "../i18n/LanguageProvider";
import Brand from "./Brand";
import Icon from "./Icon";
export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang } = useLang();
  const cs = lang === "cs";
  const pathname = usePathname();
  const links = [
    { href: "/#how-it-works", label: cs ? "Jak to funguje" : "How it works" },
    { href: "/#examples", label: cs ? "Inspirace" : "Use cases" },
    { href: "/history", label: cs ? "Historie" : "Your history" },
  ];
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="nav-inner">
        <Brand />
        <nav
          className="desktop-nav"
          aria-label={cs ? "Hlavní navigace" : "Main navigation"}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <LanguageSwitcher />
          <Link
            href="/builder"
            className="button button-small button-light header-cta"
          >
            {cs ? "Začít zdarma" : "Start creating"}
            <Icon name="up-right" size={14} />
          </Link>
          <button
            className="icon-button menu-button"
            aria-label={cs ? "Nabídka" : "Toggle menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label={cs ? "Mobilní navigace" : "Mobile navigation"}
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
              <Icon name="up-right" size={16} />
            </Link>
          ))}
          <Link href="/builder" onClick={() => setOpen(false)}>
            {cs ? "Vytvořit prompt" : "Start creating"}
            <Icon name="arrow" />
          </Link>
        </nav>
      )}
    </header>
  );
}
