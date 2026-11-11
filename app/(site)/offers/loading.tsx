import { OffersPageSkeleton } from "@/components/offers/offer-skeletons";

export default function Loading() {
  return (
    <div className="page-container py-10">
      <OffersPageSkeleton />
    </div>
  );
}
