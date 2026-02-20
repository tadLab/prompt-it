"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHistoryCount } from "../hooks/useHistory";

export default function Header() {
  const pathname = usePathname();
  const isBuilder = pathname === "/builder";
  const count = useHistoryCount();

  // Builder has its own compact header
  if (isBuilder) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-gradient-green text-xl font-bold tracking-tight">
        prompt it
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/example"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Example
        </Link>
        <Link
          href="/builder"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Builder
        </Link>
        <Link
          href="/history"
          className="badge flex items-center gap-2 hover:border-emerald-400/40 transition-colors"
        >
          <span>📜</span>
          <span>History</span>
          {count > 0 && (
            <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
