// Lightweight UI dictionary. Keys are flat dotted strings; values are plain
// text. `t()` falls back to English, then to the raw key, so a missing
// translation degrades visibly-but-safely rather than crashing.

export type Lang = "en" | "cs";

export const LANGS: Lang[] = ["en", "cs"];

type Dict = Record<string, string>;

const en: Dict = {
  // Header / nav
  "nav.about": "About",
  "nav.example": "Example",
  "nav.howItWorks": "How it works",
  "nav.history": "History",
  "nav.build": "Build →",

  // Footer
  "footer.madeBy": "Made by",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",

  // Hero
  "hero.badge": "AI-Powered Prompt Engineering",
  "hero.title": "BUILD BETTER PROMPTS.",
  "hero.subtitle": "GET BETTER AI RESULTS.",
  "hero.tagline1": "Engineer prompts that AI actually understands.",
  "hero.tagline2":
    "We turn your idea into a structured prompt and recommend the best AI model for it.",
  "hero.ctaBuild": "Build my prompt",
  "hero.ctaExample": "See example",
  "hero.worksWith": "Works with",
  "hero.scroll": "Scroll",

  // About
  "about.badge": "Why prompt it?",
  "about.title": "ABOUT",
  "about.p1":
    "Most people write AI prompts the way they'd text a friend — short, vague, and hoping for the best. But AI models respond dramatically better to structured, well-engineered prompts.",
  "about.p2":
    "prompt it bridges that gap. You describe what you need in plain language, and our AI transforms it into a structured prompt — complete with context, constraints, output format, and a recommended model.",
  "about.feat1.title": "Structured output",
  "about.feat1.desc": "Role, goal, context, format — every prompt follows a proven framework.",
  "about.feat2.title": "Model matching",
  "about.feat2.desc": "We recommend the best AI model for your specific use case.",
  "about.feat3.title": "For everyone",
  "about.feat3.desc": "Marketers, developers, writers — no prompt engineering skills needed.",

  // How it works
  "how.badge": "Simple 3-step process",
  "how.title": "HOW IT WORKS",
  "how.subtitle": "From idea to optimized prompt in seconds — no prompt engineering skills required.",
  "how.step1.title": "Describe",
  "how.step1.desc": "Tell us what you need in plain language — your goal, audience, and desired output.",
  "how.step2.title": "Generate",
  "how.step2.desc": "Our AI structures your idea into an optimized prompt with the best model recommendation.",
  "how.step3.title": "Use",
  "how.step3.desc": "Copy the prompt and paste it into ChatGPT, Claude, Gemini, or any AI — and get better results.",

  // Example section
  "example.badge": "See the difference",
  "example.title": "SAME IDEA. DIFFERENT OUTPUT.",
  "example.subtitle":
    "Both started from “{request}”. The only thing that changed was the prompt — look at what the AI gave back.",
  "example.vagueLabel": "Vague prompt",
  "example.structuredLabel": "Structured by prompt it",
  "example.aiOutput": "AI output",
  "example.vagueCaption": "Generic, hype-y, interchangeable — reads like every other launch post.",
  "example.structuredCaption":
    "Specific hook, a real story, a concrete CTA — a post people actually stop for.",
  "example.ctaText": "Your idea deserves the second one.",
  "example.ctaButton": "Build my prompt",

  // Language switcher
  "lang.label": "Language",
};

const cs: Dict = {
  // Header / nav
  "nav.about": "O nástroji",
  "nav.example": "Ukázka",
  "nav.howItWorks": "Jak to funguje",
  "nav.history": "Historie",
  "nav.build": "Spustit →",

  // Footer
  "footer.madeBy": "Vytvořil",
  "footer.terms": "Podmínky",
  "footer.privacy": "Soukromí",

  // Hero
  "hero.badge": "Prompt engineering s AI",
  "hero.title": "TVOŘ LEPŠÍ PROMPTY.",
  "hero.subtitle": "ZÍSKEJ LEPŠÍ VÝSLEDKY OD AI.",
  "hero.tagline1": "Prompty, kterým AI doopravdy rozumí.",
  "hero.tagline2":
    "Z tvého nápadu uděláme strukturovaný prompt a doporučíme k němu nejlepší AI model.",
  "hero.ctaBuild": "Vytvořit prompt",
  "hero.ctaExample": "Ukázat příklad",
  "hero.worksWith": "Funguje s",
  "hero.scroll": "Posouvej",

  // About
  "about.badge": "Proč prompt it?",
  "about.title": "O NÁSTROJI",
  "about.p1":
    "Většina lidí píše prompty, jako by psali kamarádovi — krátce, vágně a s nadějí, že to nějak dopadne. AI modely ale reagují výrazně líp na strukturované, dobře navržené prompty.",
  "about.p2":
    "prompt it ten rozdíl překlene. Popíšeš, co potřebuješ, běžnou řečí — a naše AI to promění ve strukturovaný prompt s kontextem, omezeními, formátem výstupu i doporučeným modelem.",
  "about.feat1.title": "Strukturovaný výstup",
  "about.feat1.desc": "Role, cíl, kontext, formát — každý prompt drží osvědčenou strukturu.",
  "about.feat2.title": "Výběr modelu",
  "about.feat2.desc": "Doporučíme nejlepší AI model přesně pro tvůj případ.",
  "about.feat3.title": "Pro každého",
  "about.feat3.desc": "Marketéři, vývojáři, autoři — žádné znalosti prompt engineeringu netřeba.",

  // How it works
  "how.badge": "Jednoduché 3 kroky",
  "how.title": "JAK TO FUNGUJE",
  "how.subtitle": "Z nápadu na optimalizovaný prompt během vteřin — bez znalostí prompt engineeringu.",
  "how.step1.title": "Popiš",
  "how.step1.desc": "Řekni nám, co potřebuješ, běžnou řečí — cíl, publikum a požadovaný výstup.",
  "how.step2.title": "Vygeneruj",
  "how.step2.desc": "Naše AI z tvého nápadu poskládá optimalizovaný prompt a doporučí nejlepší model.",
  "how.step3.title": "Použij",
  "how.step3.desc": "Zkopíruj prompt a vlož ho do ChatGPT, Claude, Gemini nebo jakékoli AI — a získej lepší výsledky.",

  // Example section
  "example.badge": "Viz rozdíl",
  "example.title": "STEJNÝ NÁPAD. JINÝ VÝSTUP.",
  "example.subtitle":
    "Oboje vyšlo z „{request}“. Změnil se jen prompt — podívej se, co AI vrátila.",
  "example.vagueLabel": "Vágní prompt",
  "example.structuredLabel": "Strukturováno přes prompt it",
  "example.aiOutput": "Výstup AI",
  "example.vagueCaption": "Obecné, nadšenecké, zaměnitelné — čte se jako každý druhý launch příspěvek.",
  "example.structuredCaption":
    "Konkrétní hook, skutečný příběh, jasná výzva k akci — příspěvek, u kterého lidi fakt zastaví.",
  "example.ctaText": "Tvůj nápad si zaslouží ten druhý.",
  "example.ctaButton": "Vytvořit prompt",

  // Language switcher
  "lang.label": "Jazyk",
};

export const messages: Record<Lang, Dict> = { en, cs };
