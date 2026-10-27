import { HolidaysPageSkeleton } from "@/components/holidays/holiday-skeletons";

export default function Loading() {
  return (
    <div className="page-container py-10">
      <HolidaysPageSkeleton />
    </div>
  );
}
