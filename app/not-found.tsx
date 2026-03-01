import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen items-center justify-center px-6">
      <h1 className="text-6xl font-bold text-emerald-400 mb-4">404</h1>
      <p className="text-xl font-semibold mb-2">Page not found</p>
      <p className="text-white/50 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
