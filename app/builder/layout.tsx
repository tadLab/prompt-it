import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Prompt",
  description: "Create structured AI prompts with our step-by-step wizard.",
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
