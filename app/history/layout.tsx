import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt History",
  description: "View and manage your previously generated prompts.",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
