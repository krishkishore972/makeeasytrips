export function HotelResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="shimmer-surface hidden h-[30rem] rounded-2xl border border-line lg:block" />
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="shimmer-surface h-5 w-44 rounded" />
          <div className="shimmer-surface h-9 w-36 rounded-xl" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              className="shimmer-surface h-64 rounded-2xl border border-line sm:h-48"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HotelsPageSkeleton() {
  return (
    <div className="space-y-5">
      <div aria-hidden="true" className="shimmer-surface h-44 rounded-2xl border border-line" />
      <HotelResultsSkeleton />
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div aria-hidden="true" className="page-container py-8">
      <div className="shimmer-surface h-4 w-52 rounded" />
      <div className="shimmer-surface mt-6 h-20 rounded-2xl border border-line" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="shimmer-surface aspect-[16/9] rounded-2xl border border-line" />
          <div className="shimmer-surface h-64 rounded-2xl border border-line" />
          <div className="shimmer-surface h-52 rounded-2xl border border-line" />
        </div>
        <div className="shimmer-surface h-[28rem] rounded-2xl border border-line" />
      </div>
    </div>
  );
}
