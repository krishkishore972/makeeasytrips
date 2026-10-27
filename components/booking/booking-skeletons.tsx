export function BookingPageSkeleton() {
  return (
    <div aria-hidden="true" className="page-container py-8">
      <div className="shimmer-surface h-4 w-44 rounded" />
      <div className="shimmer-surface mt-5 h-10 w-72 rounded" />
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="shimmer-surface h-80 rounded-2xl border border-line" />
          <div className="shimmer-surface h-56 rounded-2xl border border-line" />
        </div>
        <div className="space-y-4">
          <div className="shimmer-surface h-72 rounded-2xl border border-line" />
          <div className="shimmer-surface h-40 rounded-2xl border border-line" />
        </div>
      </div>
    </div>
  );
}
