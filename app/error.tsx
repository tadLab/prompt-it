"use client";
import { useLang } from "./i18n/LanguageProvider";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLang();
  const cs = lang === "cs";
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4">
        {cs ? "Něco se nepovedlo" : "Something went wrong"}
      </h1>
      <p className="text-white/50 mb-8">
        {cs
          ? "Nastala neočekávaná chyba. Zkus to prosím znovu."
          : "An unexpected error occurred. Please try again."}
      </p>
      <button onClick={reset} className="button button-primary">
        {cs ? "Zkusit znovu" : "Try again"}
      </button>
    </div>
  );
}
