"use client";

import Link from "next/link";
import { useT } from "../i18n/LanguageProvider";

export default function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="text-sm text-white/40">
        {t("footer.madeBy")}{" "}
        <Link
          href="https://tadeasn.com"
          target="_blank"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Tade
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/terms"
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          {t("footer.terms")}
        </Link>
        <Link
          href="/privacy"
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          {t("footer.privacy")}
        </Link>
      </div>
    </footer>
  );
}
