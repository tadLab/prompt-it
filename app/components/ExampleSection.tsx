"use client";

import Link from "next/link";
import { useT, useLang } from "../i18n/LanguageProvider";
import type { Lang } from "../i18n/messages";

/**
 * The before/after proof. The HERO is the difference in AI *output* — that's the
 * most persuasive evidence that structuring helps (showing > telling).
 *
 * These are real, representative outputs captured once and shown statically —
 * no per-visit API call, so the landing page stays fast and free to serve.
 *
 * Structured example content lives here (not in messages.ts) because it's
 * nested data — arrays of sections + multi-line outputs — which doesn't fit the
 * flat string dictionary. Keyed by language so it matches the UI toggle.
 */
interface Example {
  request: string;
  vague: { prompt: string; output: string };
  structured: { promptSections: { heading: string; text: string }[]; output: string };
}

const EXAMPLES: Record<Lang, Example> = {
  en: {
    request: "A LinkedIn post about our new app",
    vague: {
      prompt: "Write a LinkedIn post about our new app.",
      output:
        "We're thrilled to announce our brand-new app! 🎉 It's packed with powerful features designed to boost your productivity and make your life easier. Whether you're a professional or just getting started, our app has something for everyone. Download it today and experience the difference! #productivity #newapp #launch #innovation",
    },
    structured: {
      promptSections: [
        { heading: "### Role", text: "Senior B2B copywriter specializing in LinkedIn launches." },
        { heading: "### Goal", text: "Announce an AI productivity app to project managers." },
        { heading: "### Tone & format", text: "Punchy, hook first. ~120 words. No corporate jargon. One clear CTA." },
      ],
      output:
        "I used to lose 3 hours a week just copy-pasting between tools.\n\nLast week it took 20 minutes.\n\nThat's the reason we built Flowstate — it watches how your tools connect and quietly automates the busywork in between. No setup wizards, no 40-tab dashboards.\n\nWe're opening it to 100 project managers first. Want in? Comment \"flow\" and I'll send you early access. 👇",
    },
  },
  cs: {
    request: "Příspěvek na LinkedIn o naší nové appce",
    vague: {
      prompt: "Napiš příspěvek na LinkedIn o naší nové appce.",
      output:
        "S nadšením oznamujeme naši zcela novou appku! 🎉 Je nabitá skvělými funkcemi, které vám zvýší produktivitu a usnadní život. Ať jste profík nebo úplný začátečník, naše appka má něco pro každého. Stáhněte si ji ještě dnes a pocítíte ten rozdíl! #produktivita #novaapp #launch #inovace",
    },
    structured: {
      promptSections: [
        { heading: "### Role", text: "Seniorní B2B copywriter se specializací na LinkedIn launche." },
        { heading: "### Cíl", text: "Oznámit AI appku na produktivitu projektovým manažerům." },
        { heading: "### Tón a formát", text: "Úderně, hook hned na začátku. ~120 slov. Žádný korporátní žargon. Jedna jasná výzva k akci." },
      ],
      output:
        "Každý týden jsem ztrácel 3 hodiny jen přepínáním mezi nástroji.\n\nMinulý týden to zabralo 20 minut.\n\nProto jsme postavili Flowstate — sleduje, jak se tvoje nástroje propojují, a tiše zautomatizuje tu otravnou práci mezi nimi. Žádní průvodci nastavením, žádných 40 otevřených panelů.\n\nOtevíráme to nejdřív 100 projektovým manažerům. Chceš dovnitř? Napiš do komentáře „flow“ a pošlu ti early access. 👇",
    },
  },
};

export default function ExampleSection() {
  const t = useT();
  const { lang } = useLang();
  const EXAMPLE = EXAMPLES[lang] ?? EXAMPLES.en;
  // The subtitle wraps the example request in quotes; split on the token so the
  // request text can keep its highlight styling inside the translated sentence.
  const [subBefore, subAfter] = t("example.subtitle").split("{request}");
  return (
    <section id="example" className="scroll-mt-20 py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="badge inline-block mb-4">{t("example.badge")}</div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t("example.title")}
          </h2>
          <p className="text-white/50 max-w-lg mx-auto">
            {subBefore}
            <span className="text-white/80">{EXAMPLE.request}</span>
            {subAfter}
          </p>
        </div>

        {/* Prompt comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Before prompt */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-400 font-bold">✗</span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {t("example.vagueLabel")}
              </h3>
            </div>
            <div className="glass-card p-5">
              <p className="text-white/70 text-sm">{EXAMPLE.vague.prompt}</p>
            </div>
          </div>

          {/* After prompt */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400 font-bold">✓</span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {t("example.structuredLabel")}
              </h3>
            </div>
            <div className="glass-card-bright p-5 space-y-2.5">
              {EXAMPLE.structured.promptSections.map((s, i) => (
                <div key={i}>
                  <span className="text-emerald-400 text-xs font-bold">{s.heading}</span>
                  <p className="text-white/80 text-sm">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow connector */}
        <div className="flex items-center justify-center gap-2 text-white/30 text-xs uppercase tracking-widest my-6">
          <span className="h-px w-8 bg-white/15" />
          {t("example.aiOutput")}
          <span className="h-px w-8 bg-white/15" />
        </div>

        {/* OUTPUT comparison — the hero */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Before output */}
          <div className="glass-card p-5 flex flex-col">
            <p className="text-white/55 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {EXAMPLE.vague.output}
            </p>
            <p className="text-red-400/80 text-xs mt-4 pt-3 border-t border-white/5">
              {t("example.vagueCaption")}
            </p>
          </div>

          {/* After output */}
          <div className="glass-card-bright p-5 flex flex-col ring-1 ring-emerald-400/20">
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {EXAMPLE.structured.output}
            </p>
            <p className="text-emerald-400/90 text-xs mt-4 pt-3 border-t border-emerald-400/10">
              {t("example.structuredCaption")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/50 mb-4">{t("example.ctaText")}</p>
          <Link href="/builder" className="btn-primary inline-flex items-center gap-2">
            {t("example.ctaButton")} <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
