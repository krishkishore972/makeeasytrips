import { Suspense } from "react";
import { CatalogueListPage, CataloguePageFallback } from "@/components/admin/catalogue-pages";

type CatalogueListRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CatalogueListRoute({ searchParams }: CatalogueListRouteProps) {
  return (
    <Suspense fallback={<CataloguePageFallback />}>
      <CatalogueListPage resource="cars" searchParams={searchParams} />
    </Suspense>
  );
}
