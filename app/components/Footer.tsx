"use client";
import Link from "next/link";
import Brand from "./Brand";
import { useLang } from "../i18n/LanguageProvider";
export default function Footer() {
  const { lang } = useLang();
  const cs = lang === "cs";
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />
          <p>
            {cs
              ? "Dobré nápady si zaslouží lepší prompty."
              : "Good ideas deserve better prompts."}
          </p>
        </div>
        <div className="footer-links">
          <Link href="/#examples">{cs ? "Inspirace" : "Use cases"}</Link>
          <Link href="/history">{cs ? "Historie" : "History"}</Link>
          <Link href="/builder">
            {cs ? "Vytvořit prompt" : "Create a prompt"} ↗
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} makebetterprompt{" "}
          <span className="footer-credit">
            {cs ? "· Vytvořil" : "· Made by"}{" "}
            <a href="https://tadeasn.com" target="_blank" rel="noreferrer">
              Tade ↗
            </a>
          </span>
        </span>
        <div>
          <Link href="/privacy">{cs ? "Soukromí" : "Privacy"}</Link>
          <Link href="/terms">{cs ? "Podmínky" : "Terms"}</Link>
          <span className="footer-status">
            <i />
            {cs ? "Připraveno pro tvůj nápad" : "Ready for your next idea"}
          </span>
        </div>
      </div>
    </footer>
  );
}
