export function CarResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="shimmer-surface hidden h-[34rem] rounded-2xl border border-line lg:block" />
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

export function CarsPageSkeleton() {
  return (
    <div className="space-y-5">
      <div aria-hidden="true" className="shimmer-surface h-48 rounded-2xl border border-line" />
      <CarResultsSkeleton />
    </div>
  );
}

export function CarsLandingSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="border-b border-line bg-brand-950">
        <div className="page-container py-8 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
            <div className="space-y-4">
              <div className="shimmer-surface h-6 w-40 rounded-full bg-white/10" />
              <div className="shimmer-surface h-16 w-full max-w-xl rounded-xl bg-white/10" />
              <div className="shimmer-surface h-5 w-full max-w-lg rounded bg-white/10" />
              <div className="shimmer-surface h-5 w-3/4 max-w-md rounded bg-white/10" />
            </div>
            <div className="shimmer-surface h-72 rounded-2xl" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="shimmer-surface h-11 rounded bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      <div className="page-container space-y-14 py-10 sm:py-14">
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="shimmer-surface h-44 rounded-2xl border border-line" />
          ))}
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="shimmer-surface h-48 rounded-2xl border border-line" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CarDetailSkeleton() {
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
        <div className="shimmer-surface h-[30rem] rounded-2xl border border-line" />
      </div>
    </div>
  );
}
