import type { HolidayDay } from "@/lib/data/schemas";
import { formatNightLabel } from "@/lib/dates";

type HolidayItineraryProps = {
  itinerary: HolidayDay[];
  days: number;
  nights: number;
};

export function HolidayItinerary({ itinerary, days, nights }: HolidayItineraryProps) {
  return (
    <section
      aria-labelledby="itinerary-heading"
      className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Day by day</p>
          <h2 id="itinerary-heading" className="mt-2 text-2xl leading-tight">
            The shape of the trip.
          </h2>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-800">
          {days} days · {formatNightLabel(nights)}
        </span>
      </div>

      <ol className="mt-5">
        {itinerary.map((day, index) => (
          <li key={day.day} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-extrabold text-white shadow-xs">
                {day.day}
              </span>
              {index < itinerary.length - 1 ? (
                <span aria-hidden="true" className="my-1 w-px flex-1 bg-line" />
              ) : null}
            </div>
            <div className={index < itinerary.length - 1 ? "pb-6" : "pb-0"}>
              <p className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
                Day {day.day}
              </p>
              <h3 className="mt-1 text-base font-extrabold text-ink">{day.title}</h3>
              <p className="mt-1 text-xs leading-6 text-muted">{day.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
