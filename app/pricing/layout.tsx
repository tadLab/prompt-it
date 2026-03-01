import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Get coins to generate unlimited AI prompts.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
