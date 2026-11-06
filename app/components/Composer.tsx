"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../i18n/LanguageProvider";
import { clearPromptResult, saveWizardInputs } from "../hooks/usePromptStore";
import Icon, { type IconName } from "./Icon";

export const starters = {
  en: [
    {
      icon: "mail",
      label: "An email",
      value:
        "Write a polite but firm email declining extra work this weekend. Keep it short and professional.",
    },
    {
      icon: "pen",
      label: "A LinkedIn post",
      value:
        "Help me write a LinkedIn post about a new feature in my app. I want it to sound like me, not an advertisement.",
    },
    {
      icon: "code",
      label: "Some code",
      value:
        "Review my React component for accessibility, unnecessary re-renders, and potential bugs. Explain the changes.",
    },
    {
      icon: "layers",
      label: "A plan",
      value:
        "Help me turn a new product idea into a practical one-week validation plan with a small budget.",
    },
  ],
  cs: [
    {
      icon: "mail",
      label: "E-mail",
      value:
        "Napiš zdvořilý, ale jasný e-mail, ve kterém odmítnu práci navíc o víkendu. Stručně a profesionálně.",
    },
    {
      icon: "pen",
      label: "Příspěvek na LinkedIn",
      value:
        "Pomoz mi napsat příspěvek na LinkedIn o nové funkci mé aplikace. Chci, aby zněl jako já, ne jako reklama.",
    },
    {
      icon: "code",
      label: "Kód",
      value:
        "Zkontroluj mou React komponentu: přístupnost, zbytečné renderování a možné chyby. Vysvětli navržené změny.",
    },
    {
      icon: "layers",
      label: "Plán",
      value:
        "Pomoz mi převést nápad na produkt do praktického týdenního plánu ověření s malým rozpočtem.",
    },
  ],
};

export default function Composer() {
  const { lang } = useLang();
  const cs = lang === "cs";
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [mode, setMode] = useState("create");
  const [error, setError] = useState("");

  function start(clarify: boolean) {
    if (!goal.trim()) {
      setError(
        cs
          ? "Napiš alespoň krátce, co chceš vytvořit."
          : "Tell us a little about what you want to create.",
      );
      return;
    }
    try {
      saveWizardInputs({ goal: goal.trim(), answers: [], lang });
      clearPromptResult();
      router.push(clarify ? "/builder" : "/result");
    } catch {
      setError(
        cs
          ? "Povol úložiště prohlížeče, abychom mohli pokračovat."
          : "Please allow browser storage to continue.",
      );
    }
  }

  return (
    <div className="composer-wrap" id="create">
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          start(false);
        }}
      >
        <div className="composer-top">
          <div
            className="composer-tabs"
            role="group"
            aria-label={cs ? "Režim" : "Mode"}
          >
            <button
              type="button"
              aria-pressed={mode === "create"}
              className={mode === "create" ? "active" : ""}
              onClick={() => setMode("create")}
            >
              <Icon name="spark" size={15} />
              {cs ? "Mám nápad" : "I have an idea"}
            </button>
            <button
              type="button"
              aria-pressed={mode === "improve"}
              className={mode === "improve" ? "active" : ""}
              onClick={() => setMode("improve")}
            >
              <Icon name="edit" size={15} />
              {cs ? "Mám prompt" : "I have a prompt"}
            </button>
          </div>
          <span className="composer-counter">
            {goal.length}
            <span> / 2,000</span>
          </span>
        </div>
        <label className="sr-only" htmlFor="hero-goal">
          {cs ? "Co chceš vytvořit?" : "What do you want to create?"}
        </label>
        <textarea
          id="hero-goal"
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
            setError("");
          }}
          maxLength={2000}
          placeholder={
            mode === "create"
              ? cs
                ? "Co chceš vytvořit? Stačí vlastními slovy…"
                : "What do you want to create? Start with a rough idea…"
              : cs
                ? "Vlož svůj prompt. Dáme mu jasnější směr…"
                : "Paste your existing prompt. Let’s bring it into focus…"
          }
          aria-describedby={error ? "composer-error" : undefined}
        />
        {error && (
          <p className="error-message" id="composer-error" role="alert">
            {error}
          </p>
        )}
        <div className="composer-bottom">
          <button
            className="text-button"
            type="button"
            onClick={() => start(true)}
          >
            <Icon name="plus" size={16} />
            {cs ? "Doladit detaily" : "Guide me first"}
          </button>
          <button className="button button-primary" type="submit">
            {cs ? "Vylepšit prompt" : "Make it better"}
            <span className="button-arrow">
              <Icon name="arrow" size={17} />
            </span>
          </button>
        </div>
      </form>
      <div className="starter-row">
        <span>{cs ? "Zkus třeba" : "Try an idea"}</span>
        {starters[lang].map((s) => (
          <button
            key={s.label}
            className="starter-chip"
            onClick={() => {
              setGoal(s.value);
              document.getElementById("hero-goal")?.focus();
            }}
          >
            <Icon name={s.icon as IconName} size={14} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
