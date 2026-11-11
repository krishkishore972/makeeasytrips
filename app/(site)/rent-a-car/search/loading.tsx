import { CarResultsSkeleton } from "@/components/cars/car-skeletons";

export default function RentACarSearchLoading() {
  return (
    <div className="page-container py-6 sm:py-8">
      <CarResultsSkeleton />
    </div>
  );
}
