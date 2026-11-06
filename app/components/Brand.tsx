import Link from "next/link";
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 8h11l12 12-12 12H4l12-12L4 8Z" fill="currentColor" />
      <path
        d="M20 8h9l11 12-11 12h-9l11-12L20 8Z"
        fill="currentColor"
        opacity=".55"
      />
    </svg>
  );
}
export default function Brand({ large = false }: { large?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${large ? "brand-large" : ""}`}
      aria-label="makebetterprompt — home"
    >
      <BrandMark />
      <span>
        makebetter<span className="brand-light">prompt</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
