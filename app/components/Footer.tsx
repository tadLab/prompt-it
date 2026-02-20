import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="text-sm text-white/40">
        Made with ✨ by{" "}
        <Link
          href="https://tadeasn.com"
          target="_blank"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Tade
        </Link>
      </div>
      <Link
        href="https://tadeasn.com"
        target="_blank"
        className="text-sm text-white/40 hover:text-white/60 transition-colors"
      >
        tadeasn.com
      </Link>
    </footer>
  );
}
