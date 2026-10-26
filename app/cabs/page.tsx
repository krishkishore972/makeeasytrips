import type { Metadata } from "next";
import { CarFront } from "lucide-react";
import { FeaturePreview } from "@/components/shared/feature-preview";

export const metadata: Metadata = {
  title: "Cabs",
  description: "A planned static shell for airport transfers and intercity demo cab options.",
  alternates: {
    canonical: "/cabs",
  },
};

export default function CabsPage() {
  return (
    <FeaturePreview
      eyebrow="Cabs"
      title="A good ride at either end."
      description="Airport transfers and intercity cabs are a static shell for now. The route exists to complete the travel taxonomy and to give the shared components a home later."
      icon={CarFront}
      phase="Static shell · booking flow not in the current roadmap"
      highlights={[
        "Airport pickup and drop with flight-aware timing",
        "Clear vehicle categories, luggage space, and fare estimates",
        "A single place to keep transfers beside the rest of the trip",
      ]}
      primaryAction={{ label: "Browse hotels", href: "/hotels" }}
      secondaryAction={{ label: "Read the demo disclaimer", href: "/info/disclaimer" }}
    />
  );
}
