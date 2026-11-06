"use client";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Icon from "./components/Icon";
import { useLang } from "./i18n/LanguageProvider";
export default function NotFound() {
  const { lang } = useLang();
  const cs = lang === "cs";
  return (
    <>
      <Header />
      <main className="workspace empty-state" id="main-content">
        <span className="eyebrow">404</span>
        <h1>{cs ? "Tady jsme ztratili směr." : "A little off course."}</h1>
        <p style={{ marginTop: 20 }}>
          {cs
            ? "Tato stránka neexistuje. Tvůj další nápad ale čeká."
            : "This page doesn’t exist. Your next idea still does."}
        </p>
        <Link href="/" className="button button-primary">
          {cs ? "Zpět na začátek" : "Back to the start"}
          <Icon name="arrow" size={16} />
        </Link>
      </main>
      <Footer />
    </>
  );
}
