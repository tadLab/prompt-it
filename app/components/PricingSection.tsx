"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../hooks/useUser";
import Toast, { usePaymentToast } from "./Toast";

const PACKS = [
  {
    id: "starter",
    name: "Starter",
    price: "$2.99",
    coins: 30,
    perPrompt: "$0.10",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6.99",
    coins: 80,
    perPrompt: "$0.087",
    popular: true,
  },
  {
    id: "power",
    name: "Power",
    price: "$14.99",
    coins: 200,
    perPrompt: "$0.075",
  },
];

function PaymentToast() {
  const toast = usePaymentToast();
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} />;
}

export default function PricingSection() {
  const router = useRouter();
  const { user, isLoggedIn, coins, isLoading } = useUser();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (user) {
      setReferralLink(`${window.location.origin}/?ref=${user.id?.slice(0, 8)}`);
    }
  }, [user]);

  const handleBuy = async (packId: string) => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/");
      return;
    }

    setPurchasing(packId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      setPurchasing(null);
    }
  };

  return (
    <section id="pricing" className="scroll-mt-20 pt-24 pb-16 px-6">
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-2">
          GET MORE COINS
        </h2>
        <p className="text-white/50 text-center text-sm mb-2">
          1 coin = 1 prompt. Buy once, use anytime.
        </p>

        {isLoggedIn && (
          <p className="text-center text-emerald-400 text-sm mb-8">
            {isLoading ? (
              <span className="inline-block w-24 h-4 bg-emerald-400/20 rounded animate-pulse" />
            ) : (
              <>Your balance: {coins} coin{coins !== 1 ? "s" : ""}</>
            )}
          </p>
        )}
        {!isLoggedIn && (
          <p className="text-white/40 text-center text-xs mb-8">
            Sign up to get 3 free coins
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`glass-card-bright p-6 relative ${
                pack.popular ? "ring-1 ring-emerald-400/50" : ""
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-black text-xs font-bold px-3 py-0.5 rounded-full">
                  POPULAR
                </span>
              )}

              <h3 className="text-lg font-semibold text-center mb-4">
                {pack.name}
              </h3>

              <div className="text-center mb-1">
                <span className="text-3xl font-bold">{pack.price}</span>
              </div>
              <p className="text-white/50 text-sm text-center mb-4">
                {pack.coins} coins
              </p>

              <p className="text-white/30 text-xs text-center mb-6">
                {pack.perPrompt} per prompt
              </p>

              <button
                onClick={() => handleBuy(pack.id)}
                disabled={purchasing !== null || isLoading}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pack.popular
                    ? "btn-primary"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                {purchasing === pack.id ? "Redirecting..." : "Buy"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Secure one-time payment via Stripe. Coins never expire.
        </p>

        {/* Free coins section */}
        <div className="mt-12 glass-card p-6">
          <h3 className="text-lg font-semibold text-center mb-1">
            Earn free coins
          </h3>
          <p className="text-white/40 text-xs text-center mb-6">
            No purchase needed — get coins for helping us grow
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center gap-2 p-4">
              <span className="text-2xl">🎁</span>
              <span className="text-sm font-medium">Sign up bonus</span>
              <span className="text-emerald-400 text-sm font-semibold">+3 coins</span>
              <span className="text-white/30 text-xs">Just create an account</span>
            </div>

            <div className="flex flex-col items-center text-center gap-2 p-4">
              <span className="text-2xl">🔗</span>
              <span className="text-sm font-medium">Refer a friend</span>
              <span className="text-emerald-400 text-sm font-semibold">+5 coins each</span>
              <span className="text-white/30 text-xs">You both get 5 coins when they sign up</span>
            </div>

            <div className="flex flex-col items-center text-center gap-2 p-4">
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-medium">Rate a prompt</span>
              <span className="text-emerald-400 text-sm font-semibold">+1 coin</span>
              <span className="text-white/30 text-xs">Rate your generated prompt result</span>
            </div>
          </div>

          {isLoggedIn && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-white/50 text-xs text-center mb-3">
                Your referral link
              </p>
              <div className="flex items-center gap-2 max-w-md mx-auto">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 truncate">
                  {referralLink}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  className="bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Suspense>
        <PaymentToast />
      </Suspense>
    </section>
  );
}
