"use client";

import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Composer from "./components/Composer";
import ExampleSection from "./components/ExampleSection";
import { BrandMark } from "./components/Brand";
import Icon from "./components/Icon";
import { useLang } from "./i18n/LanguageProvider";

export default function Home() {
  const { lang } = useLang();
  const cs = lang === "cs";
  const faqs = cs
    ? [
        [
          "Proč to nepřeskočit a nejít rovnou do ChatGPT?",
          "Klidně můžeš. makebetterprompt pomáhá, když víš, čeho chceš dosáhnout, ale nevíš, jak to AI zadat. Ujasní cíl, doplní užitečné hranice a připraví zadání, které můžeš použít ve své oblíbené AI.",
        ],
        [
          "Je to zdarma? Potřebuji účet?",
          "Nástroj můžeš používat zdarma a bez registrace. Historie se ukládá jen v tomto prohlížeči. Platí limity požadavků, aby služba zůstala dostupná.",
        ],
        [
          "Můžu psát česky?",
          "Ano. Rozhraní, doplňující otázky i výsledný prompt podporují češtinu a angličtinu. Jazyk změníš přepínačem nahoře. U výsledku můžeš přepnout také na anglickou verzi.",
        ],
        [
          "Kam se moje zadání posílá?",
          "Pro vytvoření promptu se zadání odešle našemu serveru a poskytovateli AI, Anthropic. Nevkládej hesla, citlivé osobní údaje ani důvěrné dokumenty. Historii můžeš kdykoliv smazat.",
        ],
      ]
    : [
        [
          "Why not just go straight to ChatGPT?",
          "You absolutely can. makebetterprompt helps when you know what you want, but aren’t sure how to ask for it. It clarifies your goal, adds useful boundaries, and gives you a reusable starting point for your favorite AI.",
        ],
        [
          "Is it free? Do I need an account?",
          "You can use the tool for free, without signing up. Your history stays in this browser. Request limits apply to keep the service available.",
        ],
        [
          "Can I use it in Czech?",
          "Yes. The interface, follow-up questions, and generated prompt support English and Czech. Use the language switch at the top. You can also switch to an English version of your result.",
        ],
        [
          "Where does my input go?",
          "To generate a prompt, your input is sent to our server and AI provider, Anthropic. Don’t enter passwords, sensitive personal data, or confidential documents. You can delete your local history at any time.",
        ],
      ];
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="hero">
          <div className="hero-art" aria-hidden="true">
            <div className="light-arc" />
            <div className="light-lines" />
            {Array.from({ length: 8 }, (_, i) => (
              <span className={`light-fin fin-${i}`} key={i} />
            ))}
          </div>
          <div className="hero-content">
            <div className="announcement">
              <span className="status-dot" />
              {cs
                ? "Méně hádání. Více tvoření."
                : "Less guesswork. More possibility."}
              <Icon name="up-right" size={13} />
            </div>
            <h1>
              {cs ? "Tvůj nápad." : "Your idea."}
              <br />
              <span>{cs ? "Jasně vyjádřený." : "Clearly expressed."}</span>
            </h1>
            <p className="hero-description">
              {cs
                ? "Proměň myšlenku v prompt, kterému AI rozumí.\nBez složitého zadávání. Bez kurzu promptování."
                : "Turn a rough thought into a prompt your AI can work with.\nNo perfect wording. No prompt engineering degree."}
            </p>
            <Composer />
            <div className="hero-assurances">
              <span>
                <Icon name="check" size={13} />
                {cs ? "Zdarma, bez registrace" : "Free. No account needed."}
              </span>
              <span>
                <Icon name="globe" size={13} />
                {cs ? "Česky i anglicky" : "English & Czech"}
              </span>
            </div>
          </div>
        </section>
        <section
          className="model-strip"
          aria-label={cs ? "Kompatibilní AI nástroje" : "Compatible AI tools"}
        >
          <span className="mono-label">
            {cs
              ? "TVŮJ NÁPAD. TVOJE OBLÍBENÁ AI."
              : "YOUR IDEAS. YOUR FAVORITE AI."}
          </span>
          <div className="model-names">
            <span>
              <span className="provider-symbol">◎</span>ChatGPT
            </span>
            <span>
              <span className="provider-symbol claude-symbol">✳</span>Claude
            </span>
            <span>
              <span className="provider-symbol gemini-symbol">✦</span>Gemini
            </span>
            <span className="model-more">
              {cs ? "a další" : "and beyond"}
              <Icon name="up-right" size={16} />
            </span>
          </div>
        </section>
        <section className="section how-section" id="how-it-works">
          <div className="section-heading heading-split">
            <div>
              <span className="eyebrow">
                {cs ? "OD MYŠLENKY K AKCI" : "FROM THINKING TO MAKING"}
              </span>
              <h2>
                {cs
                  ? "Méně přemýšlej jak.\nZačni tvořit."
                  : "Skip the overthinking.\nStart creating."}
              </h2>
            </div>
            <p>
              {cs
                ? "Nemusíš vědět, jak psát prompty.\nStačí vědět, co chceš udělat."
                : "You don’t need to know how to prompt.\nJust what you want to make."}
            </p>
          </div>
          <div className="steps-grid">
            {(cs
              ? [
                  [
                    "Popiš svůj nápad",
                    "Jednou větou, vlastními slovy. Nebo vlož prompt, který potřebuje trochu péče.",
                  ],
                  [
                    "Dej mu jasný směr",
                    "Získej konkrétní zadání. Pro upřesnění se můžeš nechat provést pár otázkami.",
                  ],
                  [
                    "Vezmi ho do své AI",
                    "Uprav, zkopíruj a použij. A když výsledek nesedí, doladíš ho jedním kliknutím.",
                  ],
                ]
              : [
                  [
                    "Start with a thought",
                    "One sentence, in your own words. Or paste a prompt that could use a little attention.",
                  ],
                  [
                    "Give it direction",
                    "Get a focused, usable prompt. Want more guidance? Work through a couple of questions.",
                  ],
                  [
                    "Make something good",
                    "Edit, copy, and take it to your AI. If it’s not quite right, refine it with a click.",
                  ],
                ]
            ).map(([title, desc], i) => (
              <article className="step" key={title}>
                <div className="step-top">
                  <span className="step-number">0{i + 1}</span>
                  <Icon
                    name={i === 0 ? "pen" : i === 1 ? "spark" : "up-right"}
                    size={23}
                  />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section feature-section">
          <div className="feature-grid">
            <article className="feature-card feature-main">
              <span className="eyebrow">
                {cs
                  ? "TVŮJ ZÁMĚR. BEZ ŠUMU."
                  : "YOUR INTENT. WITHOUT THE NOISE."}
              </span>
              <h2>
                {cs
                  ? "Není to delší prompt.\nJe to lepší začátek."
                  : "Not a longer prompt.\nA better starting point."}
              </h2>
              <p>
                {cs
                  ? "Správný kontext, jasný cíl a užitečné hranice. Tvoje myšlenka zůstává tvoje — jen ji AI lépe pochopí."
                  : "The right context, a clear goal, and useful boundaries. Still your idea—just easier for AI to understand."}
              </p>
              <div className="signal-visual" aria-hidden="true">
                <div className="signal-orbit orbit-one" />
                <div className="signal-orbit orbit-two" />
                <div className="signal-core">
                  <BrandMark />
                </div>
                <span className="signal-tag tag-goal">
                  {cs ? "Jasný cíl" : "Clear goal"}
                </span>
                <span className="signal-tag tag-context">
                  {cs ? "Tvůj kontext" : "Your context"}
                </span>
                <span className="signal-tag tag-output">
                  {cs ? "Užitečný výstup" : "Useful output"}
                </span>
              </div>
            </article>
            <article className="feature-card feature-refine">
              <div className="feature-icon">
                <Icon name="edit" size={22} />
              </div>
              <h3>
                {cs
                  ? "První verze je jen začátek."
                  : "The first draft is just the start."}
              </h3>
              <p>
                {cs
                  ? "Zkrať ho. Změň tón. Doplň detail. Prompt můžeš upravit tak, aby opravdu seděl."
                  : "Make it shorter. Change the tone. Add a detail. Shape your prompt until it feels right."}
              </p>
              <div className="refine-preview" aria-hidden="true">
                <span>
                  <Icon name="spark" size={13} />
                  {cs ? "Stručněji" : "Make it shorter"}
                </span>
                <span>{cs ? "Přirozenější tón" : "More conversational"}</span>
                <span>{cs ? "Více detailů" : "Add more detail"}</span>
              </div>
            </article>
            <article className="feature-card feature-language">
              <div className="language-art" aria-hidden="true">
                <span>EN</span>
                <Icon name="arrow" size={20} />
                <span>CZ</span>
              </div>
              <h3>
                {cs ? "Mysli ve svém jazyce." : "Think in your own language."}
              </h3>
              <p>
                {cs
                  ? "Od prvního nápadu po hotový prompt. Česky i anglicky, bez zbytečného překládání."
                  : "From your first idea to your finished prompt. English or Czech, without the extra translating."}
              </p>
            </article>
          </div>
        </section>
        <ExampleSection />
        <section className="section faq-section">
          <div className="section-heading">
            <span className="eyebrow">
              {cs ? "JEŠTĚ NĚCO?" : "A LITTLE MORE CLARITY"}
            </span>
            <h2>{cs ? "Dobré otázky." : "Good questions."}</h2>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Icon name="plus" size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="section final-cta">
          <div className="cta-glow" aria-hidden="true" />
          <BrandMark />
          <span className="eyebrow">
            {cs ? "UŽ MÁŠ TEN NÁPAD." : "YOU ALREADY HAVE THE IDEA."}
          </span>
          <h2>
            {cs ? "Dej mu dobrý začátek." : "Let’s give it a good start."}
          </h2>
          <p>
            {cs
              ? "Tvůj další skvělý výstup začíná jasným zadáním."
              : "Your next great output starts with a little clarity."}
          </p>
          <Link href="#create" className="button button-primary">
            {cs ? "Vytvořit můj prompt" : "Create my prompt"}
            <span className="button-arrow">
              <Icon name="arrow" size={17} />
            </span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
