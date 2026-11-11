import { FlightsPageSkeleton } from "@/components/flights/flight-skeletons";

export default function Loading() {
  return (
    <div className="page-container py-10">
      <FlightsPageSkeleton />
    </div>
  );
}
