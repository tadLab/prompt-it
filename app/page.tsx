"use client";

import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ExampleSection from "./components/ExampleSection";
import { useT } from "./i18n/LanguageProvider";

export default function Home() {
  const t = useT();
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative flex items-center justify-center px-6 min-h-screen overflow-hidden">
          <div className="hero-glow" />
          <div className="text-center max-w-2xl mx-auto relative z-10">
            <div className="badge inline-flex items-center gap-2 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {t("hero.badge")}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4 sm:mb-6 whitespace-nowrap">
              {t("hero.title")}
            </h1>
            <p className="text-gradient-green text-xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
              {t("hero.subtitle")}
            </p>
            <p className="text-white/60 text-sm sm:text-lg mb-2">
              {t("hero.tagline1")}
            </p>
            <p className="text-white/50 text-xs sm:text-base mb-8 sm:mb-10">
              {t("hero.tagline2")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <Link href="/builder" className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                {t("hero.ctaBuild")} <span className="text-lg">→</span>
              </Link>
              <a href="#example" className="btn-secondary w-full sm:w-auto text-center">
                {t("hero.ctaExample")}
              </a>
            </div>

            {/* Trusted by line */}
            <div className="mt-12 sm:mt-16 flex flex-col items-center gap-3">
              <p className="text-white/25 text-xs uppercase tracking-widest">{t("hero.worksWith")}</p>
              <div className="flex items-center gap-3 sm:gap-6 text-white/30 text-xs sm:text-sm">
                <span>ChatGPT</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Claude</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Gemini</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Any AI</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
            <span className="text-xs tracking-widest uppercase">{t("hero.scroll")}</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="animate-bounce">
              <path d="M8 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── About Section ── */}
        <section id="about" className="scroll-mt-20 py-28 px-6 relative">
          <div className="section-glow absolute inset-0" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="badge inline-block mb-4">{t("about.badge")}</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {t("about.title")}
              </h2>
            </div>

            <div className="gradient-border-card p-8 md:p-12 mb-10">
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-white/60 text-base md:text-lg leading-relaxed mb-6">
                  {t("about.p1")}
                </p>
                <p className="text-white/60 text-base md:text-lg leading-relaxed">
                  {t("about.p2")}
                </p>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card shine-on-hover p-6 text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-sm font-semibold mb-2">{t("about.feat1.title")}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{t("about.feat1.desc")}</p>
              </div>
              <div className="glass-card shine-on-hover p-6 text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                </div>
                <h3 className="text-sm font-semibold mb-2">{t("about.feat2.title")}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{t("about.feat2.desc")}</p>
              </div>
              <div className="glass-card shine-on-hover p-6 text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="text-sm font-semibold mb-2">{t("about.feat3.title")}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{t("about.feat3.desc")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── Example Section ── */}
        <section className="section-dark">
          <ExampleSection />
        </section>

        <div className="section-divider" />

        {/* ── How it works ── */}
        <section id="how-it-works" className="scroll-mt-20 py-28 px-6 relative">
          <div className="section-glow absolute inset-0" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="badge inline-block mb-4">{t("how.badge")}</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {t("how.title")}
              </h2>
              <p className="text-white/50 max-w-md mx-auto">
                {t("how.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Describe */}
              <div className="gradient-border-card shine-on-hover p-8 text-center">
                <div className="float">
                  <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-xs font-bold pulse-glow">1</div>
                <h3 className="text-lg font-semibold mb-2">{t("how.step1.title")}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{t("how.step1.desc")}</p>
              </div>

              {/* Step 2: Generate */}
              <div className="gradient-border-card shine-on-hover p-8 text-center">
                <div className="float-delay">
                  <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-xs font-bold pulse-glow">2</div>
                <h3 className="text-lg font-semibold mb-2">{t("how.step2.title")}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{t("how.step2.desc")}</p>
              </div>

              {/* Step 3: Use */}
              <div className="gradient-border-card shine-on-hover p-8 text-center">
                <div className="float-delay-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-xs font-bold pulse-glow">3</div>
                <h3 className="text-lg font-semibold mb-2">{t("how.step3.title")}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{t("how.step3.desc")}</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
