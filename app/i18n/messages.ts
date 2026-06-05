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

  // Builder
  "builder.step1": "STEP 1 — YOUR GOAL",
  "builder.goalTitle": "WHAT DO YOU WANT AI TO HELP YOU WITH?",
  "builder.goalPlaceholder":
    "Write a LinkedIn post for our launch\nHelp me brainstorm React code\nDraft an email to my boss declining weekend work…",
  "builder.hintPre": "Press",
  "builder.hintMid": "to continue",
  "builder.hintNewline": "for new line",
  "builder.continue": "Continue →",
  "builder.preparing": "Preparing questions…",
  "builder.skip": "Skip & generate now",
  "builder.step2": "STEP 2 — A FEW QUICK QUESTIONS (OPTIONAL)",
  "builder.step2Title": "Answer what you can — we'll infer the rest.",
  "builder.answerPlaceholder": "Type an answer, or skip…",
  "builder.generate": "Generate prompt →",
  "builder.back": "← Back",

  // Result
  "result.title": "YOUR PROMPT",
  "result.building": "building",
  "result.error": "Something went wrong generating your prompt.",
  "result.tryAgain": "Try again",
  "result.copy": "Copy",
  "result.copied": "Copied!",
  "result.edit": "Edit",
  "result.editDone": "Done",
  "result.refine": "Refine",
  "result.cancel": "Cancel",
  "result.home": "Home",
  "result.refineLabel": "What should change?",
  "result.refinePlaceholder": "e.g. make it shorter · more technical · add an example · friendlier tone…",
  "result.regenerate": "Regenerate",
  "result.refining": "Refining…",
  "result.refineFailed": "Refine failed — try again.",
  "result.assumptions": "What we assumed",
  "result.assumptionsHintPre": "Something off? Tweak it with",
  "result.assumptionsHintPost": "above.",
  "result.recommendations": "RECOMMENDATIONS",
  "result.recommendedModel": "Recommended Model:",
  "result.whyModel": "Why this model?",
  "result.openWith": "Open with your prompt",
  "result.openIn": "Open in {model} →",
  "result.openHintCopied": "Prompt copied — if it didn't pre-fill, just paste (⌘/Ctrl + V).",
  "result.openHintIdle": "We copy your prompt and open the chat — paste if it doesn't auto-fill.",
  "result.alternatives": "Alternatives",
  "result.langNudge": "AI models handle English prompts better — try the English version.",

  // History
  "history.title1": "Prompt",
  "history.title2": "History",
  "history.subtitle": "View and manage your previously generated prompts",
  "history.clearAll": "Clear all",
  "history.emptyTitle": "No prompts yet",
  "history.emptyDesc": "Your generated prompts will appear here. Start by building your first prompt!",
  "history.emptyCta": "Build my first prompt",
  "history.view": "View prompt",
  "history.collapse": "Collapse",
  "history.delete": "Delete",
  "history.why": "Why {model}?",

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

  // Builder
  "builder.step1": "KROK 1 — TVŮJ CÍL",
  "builder.goalTitle": "S ČÍM TI MÁ AI POMOCI?",
  "builder.goalPlaceholder":
    "Napiš příspěvek na LinkedIn k našemu launchi\nPomoz mi vymyslet React kód\nNapiš e-mail šéfovi, kterým odmítnu práci o víkendu…",
  "builder.hintPre": "Stiskni",
  "builder.hintMid": "pro pokračování",
  "builder.hintNewline": "pro nový řádek",
  "builder.continue": "Pokračovat →",
  "builder.preparing": "Připravuju otázky…",
  "builder.skip": "Přeskočit a vygenerovat",
  "builder.step2": "KROK 2 — PÁR RYCHLÝCH OTÁZEK (VOLITELNÉ)",
  "builder.step2Title": "Odpověz, co můžeš — zbytek domyslíme.",
  "builder.answerPlaceholder": "Napiš odpověď, nebo přeskoč…",
  "builder.generate": "Vygenerovat prompt →",
  "builder.back": "← Zpět",

  // Result
  "result.title": "TVŮJ PROMPT",
  "result.building": "tvořím",
  "result.error": "Při generování promptu se něco pokazilo.",
  "result.tryAgain": "Zkusit znovu",
  "result.copy": "Kopírovat",
  "result.copied": "Zkopírováno!",
  "result.edit": "Upravit",
  "result.editDone": "Hotovo",
  "result.refine": "Vylepšit",
  "result.cancel": "Zrušit",
  "result.home": "Domů",
  "result.refineLabel": "Co změnit?",
  "result.refinePlaceholder": "např. zkrať to · víc technicky · přidej příklad · přátelštější tón…",
  "result.regenerate": "Přegenerovat",
  "result.refining": "Vylepšuju…",
  "result.refineFailed": "Vylepšení selhalo — zkus znovu.",
  "result.assumptions": "Co jsme předpokládali",
  "result.assumptionsHintPre": "Něco nesedí? Uprav to přes",
  "result.assumptionsHintPost": "výše.",
  "result.recommendations": "DOPORUČENÍ",
  "result.recommendedModel": "Doporučený model:",
  "result.whyModel": "Proč tenhle model?",
  "result.openWith": "Otevřít s tvým promptem",
  "result.openIn": "Otevřít v {model} →",
  "result.openHintCopied": "Prompt zkopírován — pokud se nepředvyplnil, jen vlož (⌘/Ctrl + V).",
  "result.openHintIdle": "Zkopírujeme prompt a otevřeme chat — vlož, pokud se nevyplní sám.",
  "result.alternatives": "Alternativy",
  "result.langNudge": "AI modely rozumí anglickým promptům líp — zkus English verzi.",

  // History
  "history.title1": "Historie",
  "history.title2": "promptů",
  "history.subtitle": "Prohlížej a spravuj své dříve vygenerované prompty",
  "history.clearAll": "Smazat vše",
  "history.emptyTitle": "Zatím žádné prompty",
  "history.emptyDesc": "Tvoje vygenerované prompty se objeví tady. Začni vytvořením prvního promptu!",
  "history.emptyCta": "Vytvořit první prompt",
  "history.view": "Zobrazit prompt",
  "history.collapse": "Sbalit",
  "history.delete": "Smazat",
  "history.why": "Proč {model}?",

  // Language switcher
  "lang.label": "Jazyk",
};

export const messages: Record<Lang, Dict> = { en, cs };
