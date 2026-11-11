import { Suspense } from "react";
import { CatalogueEditPage, CataloguePageFallback } from "@/components/admin/catalogue-pages";

type CatalogueEditRouteProps = {
  params: Promise<{ id: string }>;
};

export default function CatalogueEditRoute({ params }: CatalogueEditRouteProps) {
  return (
    <Suspense fallback={<CataloguePageFallback />}>
      <CatalogueEditPage resource="hotels" params={params} />
    </Suspense>
  );
}
