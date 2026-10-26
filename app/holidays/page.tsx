import type { Metadata } from "next";
import { Palmtree } from "lucide-react";
import { FeaturePreview } from "@/components/shared/feature-preview";

export const metadata: Metadata = {
  title: "Holiday packages",
  description:
    "Browse original demo holiday packages with thoughtful pacing, clear inclusions, and room to make them yours.",
  alternates: {
    canonical: "/holidays",
  },
};

export default function HolidaysPage() {
  return (
    <FeaturePreview
      eyebrow="Holiday packages"
      title="A holiday with room to breathe."
      description="Short escapes and longer loops, built around a place rather than a checklist. Phase 3 adds the full package catalogue, filters, and day-by-day detail pages."
      icon={Palmtree}
      phase="Phase 3 · holiday catalogue and detail pages"
      highlights={[
        "Filter by destination, theme, duration, and price",
        "Original itineraries with clear inclusions and exclusions",
        "Departure dates, traveller counts, and package pricing",
        "A calm detail page with highlights, reviews, and FAQs",
      ]}
      primaryAction={{ label: "Start with a destination", href: "/#destinations" }}
      secondaryAction={{ label: "View current offers", href: "/offers" }}
    />
  );
}
