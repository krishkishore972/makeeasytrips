import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { FeaturePreview } from "@/components/shared/feature-preview";

export const metadata: Metadata = {
  title: "Offers",
  description:
    "Demo-only travel offers across flights, stays, and holiday packages. No card is ever charged.",
  alternates: {
    canonical: "/offers",
  },
};

export default function OffersPage() {
  return (
    <FeaturePreview
      eyebrow="Offers"
      title="Good value, without the treasure hunt."
      description="A filterable offer board is coming in Phase 3. For now, the home page carries three original demo offers and this route explains what will live here."
      icon={Tag}
      phase="Phase 3 · offer board and category filters"
      highlights={[
        "Category tabs for flights, stays, holidays, trains, and cabs",
        "Codes, validity, and terms shown in plain language",
        "A horizontal rail on mobile and a grid on desktop",
        "Every offer is fictional and never charges a card",
      ]}
      primaryAction={{ label: "See the home page offers", href: "/#destinations" }}
      secondaryAction={{ label: "Read the demo disclaimer", href: "/info/disclaimer" }}
    />
  );
}
