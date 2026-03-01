"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function usePaymentToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setToast({ message: "Coins added to your account!", type: "success" });
    } else if (payment === "cancelled") {
      setToast({ message: "Payment cancelled.", type: "error" });
    }

    if (payment) {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return toast;
}

export default function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-sm font-medium shadow-lg fade-in ${
        type === "success"
          ? "bg-emerald-400 text-black"
          : "bg-white/10 text-white border border-white/20"
      }`}
    >
      {message}
    </div>
  );
}
