import type { Metadata } from "next";
import { Geist } from "next/font/google";
import CursorGlow from "./components/CursorGlow";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "prompt it - Build better prompts. Get better AI results.",
  description:
    "Engineer prompts that AI actually understands. We turn your idea into a structured prompt and recommend the best AI model for it.",
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
      </body>
    </html>
  );
}
