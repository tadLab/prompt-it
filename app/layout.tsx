import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider, SkipLink } from "./i18n/LanguageProvider";
import "./globals.css";
const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
export const metadata: Metadata = {
  title: {
    default: "makebetterprompt — Your idea. Clearly expressed.",
    template: "%s | makebetterprompt",
  },
  description:
    "Turn a rough idea into a clear, useful AI prompt. Create, refine, and use your prompts in ChatGPT, Claude, or Gemini. Free, in English and Czech.",
  metadataBase: new URL("https://makebetterprompt.com"),
  openGraph: {
    title: "Your idea. Clearly expressed.",
    description: "Better prompts start here. Meet the new makebetterprompt.",
    type: "website",
  },
  icons: { icon: "/brand/mark.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <LanguageProvider>
          <SkipLink />
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
