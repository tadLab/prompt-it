import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Prompt",
  description: "Your generated AI prompt with model recommendations.",
};

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
