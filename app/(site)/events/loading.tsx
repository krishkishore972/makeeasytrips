export default function EventsLoading() {
  return (
    <div className="page-container space-y-8 py-10" role="status" aria-label="Loading events">
      <div className="h-64 animate-pulse rounded-3xl bg-brand-50" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-96 animate-pulse rounded-2xl bg-brand-50" />
        ))}
      </div>
      <span className="sr-only">Loading events in Goa…</span>
    </div>
  );
}
