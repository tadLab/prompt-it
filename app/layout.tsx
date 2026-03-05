import type { Metadata } from "next";
import { Geist } from "next/font/google";
import CursorGlow from "./components/CursorGlow";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "prompt it — Build better prompts. Get better AI results.",
    template: "%s | prompt it",
  },
  description:
    "Engineer prompts that AI actually understands. We turn your idea into a structured prompt and recommend the best AI model for it.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://promptit.app"),
  openGraph: {
    title: "prompt it — Build better prompts. Get better AI results.",
    description: "Engineer prompts that AI actually understands.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "prompt it — Build better prompts. Get better AI results.",
    description: "Engineer prompts that AI actually understands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <CursorGlow />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
