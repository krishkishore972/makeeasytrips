import { HotelsPageSkeleton } from "@/components/hotels/hotel-skeletons";

export default function Loading() {
  return (
    <div className="page-container py-10">
      <HotelsPageSkeleton />
    </div>
  );
}
