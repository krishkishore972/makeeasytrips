import { Suspense } from "react";
import { CatalogueCreatePage, CataloguePageFallback } from "@/components/admin/catalogue-pages";

export default function CatalogueCreateRoute() {
  return (
    <Suspense fallback={<CataloguePageFallback />}>
      <CatalogueCreatePage resource="holidays" />
    </Suspense>
  );
}
