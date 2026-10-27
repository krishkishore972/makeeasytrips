export function OffersPageSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="shimmer-surface h-10 w-24 rounded-xl" />
        ))}
      </div>
      <div className="shimmer-surface h-56 rounded-2xl border border-line" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="shimmer-surface h-72 rounded-2xl border border-line" />
        ))}
      </div>
    </div>
  );
}
