import type { Metadata } from "next";
import { TrainFront } from "lucide-react";
import { FeaturePreview } from "@/components/shared/feature-preview";

export const metadata: Metadata = {
  title: "Trains",
  description:
    "A planned static shell for comparing demo train routes, classes, and journey times across India.",
  alternates: {
    canonical: "/trains",
  },
};

export default function TrainsPage() {
  return (
    <FeaturePreview
      eyebrow="Trains"
      title="The long way, with a view."
      description="Trains are a static shell in this build. The route is here so the navigation and design system are complete, while the search flow stays deliberately out of scope for now."
      icon={TrainFront}
      phase="Static shell · search not in the current roadmap"
      highlights={[
        "Route and class search will reuse the shared search primitives",
        "Journey cards will show duration, changes, and boarding details",
        "A quiet reminder that slower travel is still travel",
      ]}
      primaryAction={{ label: "Browse flights", href: "/flights" }}
      secondaryAction={{ label: "See holiday ideas", href: "/#destinations" }}
    />
  );
}
