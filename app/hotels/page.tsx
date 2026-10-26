import type { Metadata } from "next";
import { BedDouble } from "lucide-react";
import { FeaturePreview } from "@/components/shared/feature-preview";

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Find character-led demo stays with honest prices, clear amenities, and flexible cancellation details.",
  alternates: {
    canonical: "/hotels",
  },
};

export default function HotelsPage() {
  return (
    <FeaturePreview
      eyebrow="Hotels"
      title="A place that feels like the trip."
      description="From city boltholes to slow coastal stays, TripNest is being built to show the details that actually change a night: location, light, breakfast, and the fine print."
      icon={BedDouble}
      phase="Phase 2 · hotel search and results"
      highlights={[
        "City, area, and property search with date and guest controls",
        "Filter by price, star rating, guest rating, and amenities",
        "A gallery-led detail page with room and meal-plan choices",
        "Clear cancellation, check-in, and tax information",
      ]}
      primaryAction={{ label: "See destination ideas", href: "/#destinations" }}
      secondaryAction={{ label: "Read how it works", href: "/info/how-it-works" }}
    />
  );
}
