"use client";

import { useState } from "react";
import { useLang } from "../i18n/LanguageProvider";
import { useRouter } from "next/navigation";
import { clearPromptResult, saveWizardInputs } from "../hooks/usePromptStore";
import Icon from "./Icon";

const examples = {
  en: [
    {
      label: "Everyday writing",
      before: "Tell my boss I can’t work this weekend.",
      after:
        "Write a short email to my manager declining extra work this weekend. Keep it polite but firm. Don’t invent a reason or make promises about my availability. End with a friendly closing. Maximum 100 words.",
      tags: ["Clear purpose", "Useful boundaries", "Right length"],
    },
    {
      label: "Content & marketing",
      before: "Write a LinkedIn post about my app’s new feature.",
      after:
        "Help me write a LinkedIn post announcing a new feature in my app. Ask me for the app name, what changed, and one real user benefit before drafting. Use a conversational tone, short paragraphs, and a simple invitation to try it. No invented metrics or testimonials.",
      tags: ["Real context", "Human tone", "No made-up claims"],
    },
    {
      label: "Code & building",
      before: "Check my React component.",
      after:
        "Review the React component I paste below. Focus on correctness, keyboard accessibility, and unnecessary re-renders. Rank findings by severity, explain each issue, and show a minimal fix. Preserve existing behavior. Ask for missing context instead of assuming the surrounding code.",
      tags: ["Specific scope", "Actionable output", "Preserve intent"],
    },
  ],
  cs: [
    {
      label: "Každodenní psaní",
      before: "Napiš šéfovi, že o víkendu nemůžu pracovat.",
      after:
        "Napiš krátký e-mail mému vedoucímu, ve kterém odmítnu práci navíc o víkendu. Buď zdvořilý, ale jasný. Nevymýšlej důvod a neslibuj mou dostupnost v jiný den. Zakonči přátelsky. Maximálně 100 slov.",
      tags: ["Jasný záměr", "Užitečné hranice", "Správná délka"],
    },
    {
      label: "Obsah a marketing",
      before: "Napiš na LinkedIn o nové funkci mé appky.",
      after:
        "Pomoz mi napsat příspěvek na LinkedIn o nové funkci mé aplikace. Před psaním se zeptej na název, co se změnilo a jeden skutečný přínos pro uživatele. Použij přirozený tón, krátké odstavce a jednoduchou výzvu k vyzkoušení. Nevymýšlej statistiky ani reference.",
      tags: ["Skutečný kontext", "Lidský tón", "Bez vymyšlených slibů"],
    },
    {
      label: "Kód a vývoj",
      before: "Zkontroluj mou React komponentu.",
      after:
        "Zkontroluj React komponentu, kterou vložím níže. Zaměř se na správnost, ovládání klávesnicí a zbytečné renderování. Seřaď nálezy podle závažnosti, vysvětli problémy a ukaž minimální opravu. Zachovej současné chování. Na chybějící kontext se zeptej, nevymýšlej si okolní kód.",
      tags: ["Konkrétní zadání", "Praktický výstup", "Zachování záměru"],
    },
  ],
};
export default function ExampleSection() {
  const { lang } = useLang();
  const cs = lang === "cs";
  const [selected, setSelected] = useState(0);
  const example = examples[lang][selected];
  const router = useRouter();
  return (
    <section className="section examples-section" id="examples">
      <div className="section-heading">
        <span className="eyebrow">
          {cs
            ? "MALÁ ZMĚNA. JASNĚJŠÍ ZADÁNÍ."
            : "SMALL CHANGE. CLEARER DIRECTION."}
        </span>
        <h2>
          {cs
            ? "Stejný nápad.\nÚplně jiné zadání."
            : "Same idea.\nA whole new starting point."}
        </h2>
        <p>
          {cs
            ? "Ne více slov. Ty správné informace, které AI potřebuje."
            : "Not more words. The right details for your AI to work with."}
        </p>
      </div>
      <div
        className="example-tabs"
        role="group"
        aria-label={cs ? "Typ příkladu" : "Example type"}
      >
        {examples[lang].map((e, i) => (
          <button
            key={i}
            aria-pressed={i === selected}
            className={i === selected ? "active" : ""}
            onClick={() => setSelected(i)}
          >
            {e.label}
          </button>
        ))}
      </div>
      <div className="comparison">
        <div className="comparison-before">
          <span className="mono-label">
            01 / {cs ? "PŮVODNÍ NÁPAD" : "THE ROUGH IDEA"}
          </span>
          <p>“{example.before}”</p>
          <span className="comparison-note">
            {cs
              ? "Dobrý začátek. Chybí mu směr."
              : "A good start. Just missing some direction."}
          </span>
        </div>
        <div className="comparison-after">
          <span className="mono-label">
            <Icon name="spark" size={14} />
            02 / {cs ? "S MAKEBETTERPROMPT" : "WITH MAKEBETTERPROMPT"}
          </span>
          <p>{example.after}</p>
          <div className="example-tags">
            {example.tags.map((t) => (
              <span key={t}>
                <Icon name="check" size={13} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="example-caption">
        <span>
          {cs
            ? "Ilustrační příklad. Tvůj prompt se přizpůsobí tvému zadání."
            : "Illustrative example. Your prompt adapts to your own input."}
        </span>
        <button
          className="text-button"
          onClick={() => {
            saveWizardInputs({ goal: example.before, answers: [], lang });
            clearPromptResult();
            router.push("/builder");
          }}
        >
          {cs ? "Zkusit tento nápad" : "Try this idea"}
          <Icon name="arrow" size={15} />
        </button>
      </div>
    </section>
  );
}
