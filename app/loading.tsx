export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="page-container py-10 sm:py-14">
      <span className="sr-only">Loading TripNest</span>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="shimmer-surface h-[22rem] rounded-2xl border border-line sm:h-[26rem]" />
        <div className="shimmer-surface h-[22rem] rounded-2xl border border-line sm:h-[26rem]" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="shimmer-surface h-64 rounded-2xl border border-line"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
