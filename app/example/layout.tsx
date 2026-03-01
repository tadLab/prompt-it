import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example",
  description: "See how structured prompts deliver better AI results.",
};

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
