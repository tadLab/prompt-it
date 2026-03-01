"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getWizardInputs, savePromptResult } from "../hooks/usePromptStore";
import { useUser } from "../hooks/useUser";

const CHECKLIST_ITEMS = ["TASK", "CONTEXT", "OUTPUT", "PREFERENCES", "ROLE"];

export default function LoadingPromptPage() {
  const router = useRouter();
  const { user, hasCoins, isLoading: authLoading } = useUser();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Wait for auth state to resolve before checking
    if (authLoading) return;
    if (hasStarted.current) return;
    hasStarted.current = true;

    const inputs = getWizardInputs();

    // If no inputs, redirect back to builder
    if (!inputs.task) {
      router.replace("/builder");
      return;
    }

    // Client-side paywall gate
    const freeUsed =
      localStorage.getItem("prompt-it-free-used") === "true";

    if (freeUsed && !user) {
      router.replace("/login?redirect=/loading-prompt");
      return;
    }

    if (freeUsed && user && !hasCoins) {
      router.replace("/pricing");
      return;
    }

    // Animate checklist items
    CHECKLIST_ITEMS.forEach((_, i) => {
      setTimeout(() => {
        setCheckedItems((prev) => [...prev, i]);
      }, (i + 1) * 400);
    });

    // Call API
    const generatePrompt = async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });

        // Handle auth/payment error codes from server
        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.code === "AUTH_REQUIRED") {
            router.replace("/login?redirect=/loading-prompt");
            return;
          }
          if (errorData.code === "PAYMENT_REQUIRED") {
            router.replace("/pricing");
            return;
          }
          throw new Error("Failed to generate prompt");
        }

        const data = await res.json();
        savePromptResult(data);

        // Mark free prompt as used
        localStorage.setItem("prompt-it-free-used", "true");

        // Wait for checklist animation to finish, then navigate
        const minDelay = CHECKLIST_ITEMS.length * 400 + 800;
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          router.push("/result");
        }, remaining);
      } catch (err) {
        console.error("Generation error:", err);
        setError(true);
      }
    };

    const start = Date.now();
    generatePrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-2">
          WE&apos;RE BUILDING YOUR PROMPT
        </h1>
        <p className="text-white/40 text-lg mb-10 loading-dots"></p>

        <div className="space-y-4 w-full max-w-xs">
          {CHECKLIST_ITEMS.map((item, i) => {
            const isChecked = checkedItems.includes(i);
            return (
              <div
                key={item}
                className="flex items-center gap-4 text-lg font-semibold"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
                    isChecked
                      ? "bg-emerald-500 text-white check-animate"
                      : "bg-white/5 text-white/20"
                  }`}
                >
                  {isChecked ? "✓" : ""}
                </div>
                <span
                  className={
                    isChecked ? "text-white" : "text-white/30"
                  }
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="text-center mt-8 fade-in">
            <p className="text-red-400 text-sm mb-4">Something went wrong generating your prompt.</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
              Try again
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
