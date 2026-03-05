"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/builder";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Create server-side session cookie
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      router.push(redirect);
    } catch (err) {
      console.error("Login error:", err);
      setError("Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-bright p-8 w-full max-w-md text-center">
      <Link
        href="/"
        className="text-gradient-green text-2xl font-bold tracking-tight inline-block mb-6"
      >
        prompt it
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Sign in to continue
      </h1>
      <p className="text-white/50 text-sm mb-8">
        You&apos;ve used your free prompt. Sign in to unlock unlimited
        prompts.
      </p>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      <p className="text-white/30 text-xs mt-6">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-white/50">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-white/50">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen items-center justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
