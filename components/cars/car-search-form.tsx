"use client";

import { ArrowRight, CalendarClock, CarFront, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { SearchField, searchInputClassName } from "@/components/search/search-field";
import type { CityOption } from "@/components/flights/flight-search-form";
import {
  defaultRentalEnd,
  defaultRentalStart,
  formatRentalDuration,
  isMonday,
  isValidISODateTime,
  rentalDaysFor,
  rentalHoursBetween,
} from "@/lib/dates";
import { CAR_MODE_OPTIONS, type CarMode } from "@/lib/search-options";
import { cn } from "@/lib/utils";

/**
 * The native datetime control carries a picker icon that needs a little more
 * room than the other fields, so it steps down a size inside narrow cards.
 */
const dateTimeInputClassName =
  "h-7 w-full min-w-0 bg-transparent text-[12px] font-bold text-ink outline-none [color-scheme:light] @[60rem]:text-[13px]";

type CarSearchFormProps = {
  cities: CityOption[];
  initial: {
    city: string;
    start: string;
    end: string;
    mode: CarMode;
  };
  action?: string;
  compact?: boolean;
  className?: string;
};

export function CarSearchForm({
  cities,
  initial,
  action = "/rent-a-car/search",
  compact = false,
  className,
}: CarSearchFormProps) {
  const initialStart = isValidISODateTime(initial.start) ? initial.start : defaultRentalStart();
  const [city, setCity] = useState(initial.city);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(
    isValidISODateTime(initial.end) ? initial.end : defaultRentalEnd(initialStart),
  );
  const [mode, setMode] = useState<CarMode>(initial.mode);
  const [error, setError] = useState<string | null>(null);

  const hours = rentalHoursBetween(start, end);
  const days = hours ? rentalDaysFor(hours) : 0;

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label="Self-drive car search"
      className={cn(
        "@container rounded-2xl border border-line bg-surface p-3 shadow-sm sm:p-4",
        className,
      )}
      onSubmit={(event) => {
        if (!city) {
          event.preventDefault();
          setError("Choose a city to see available cars.");
          return;
        }
        if (!hours) {
          event.preventDefault();
          setError("Drop-off needs to be after pick-up.");
          return;
        }
        if (mode === "subscription" && days < 7) {
          event.preventDefault();
          setError("Subscription rentals need at least 7 days.");
          return;
        }
        if (mode === "weekday") {
          if (!isMonday(start.slice(0, 10))) {
            event.preventDefault();
            setError("Weekday Pass pick-ups start on a Monday.");
            return;
          }
          if (days < 5) {
            event.preventDefault();
            setError("Weekday Pass needs Monday to Friday, so at least 5 days.");
            return;
          }
        }
        setError(null);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.12em] text-brand-700 uppercase">
          <CarFront aria-hidden="true" className="size-3.5" />
          Find a self-drive car
        </p>
        <span className="text-[11px] font-semibold text-muted">
          {hours ? formatRentalDuration(hours) : "Choose your dates"} · INR
        </span>
      </div>

      <fieldset className="mt-3">
        <legend className="sr-only">Rental type</legend>
        <div className="flex flex-wrap gap-1.5">
          {CAR_MODE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                mode === option.value
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-line bg-canvas text-ink-soft hover:border-brand-200 hover:bg-brand-50",
              )}
            >
              <input
                type="radio"
                name="mode"
                value={option.value}
                checked={mode === option.value}
                onChange={() => {
                  setMode(option.value);
                  setError(null);
                }}
                className="peer sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div
        className={cn(
          "mt-3 grid gap-2 @[22rem]:grid-cols-2",
          compact
            ? "@[52rem]:grid-cols-[1.3fr_1fr_1fr_auto]"
            : "@[60rem]:grid-cols-[1.3fr_1fr_1fr_0.9fr_auto]",
        )}
      >
        <SearchField
          id="car-city"
          label="City"
          icon={MapPin}
          className="@[22rem]:col-span-2 @[60rem]:col-span-1"
        >
          <select
            id="car-city"
            name="city"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setError(null);
            }}
            className={searchInputClassName}
          >
            <option value="">Where are you driving?</option>
            {cities.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name} ({option.code})
              </option>
            ))}
          </select>
        </SearchField>

        <SearchField id="car-start" label="Pick-up" icon={CalendarClock}>
          <input
            id="car-start"
            name="start"
            type="datetime-local"
            value={start}
            onChange={(event) => {
              const value = event.target.value;
              setStart(value);
              setError(null);
              if (!rentalHoursBetween(value, end)) setEnd(defaultRentalEnd(value));
            }}
            className={dateTimeInputClassName}
          />
        </SearchField>

        <SearchField id="car-end" label="Drop-off" icon={CalendarClock}>
          <input
            id="car-end"
            name="end"
            type="datetime-local"
            value={end}
            onChange={(event) => {
              setEnd(event.target.value);
              setError(null);
            }}
            className={dateTimeInputClassName}
          />
        </SearchField>

        {!compact ? (
          <SearchField
            id="car-mode-summary"
            label="Rental"
            icon={CarFront}
            className="hidden @[60rem]:flex"
          >
            <span className="flex h-7 items-center text-[13px] font-bold text-ink">
              {CAR_MODE_OPTIONS.find((option) => option.value === mode)?.detail}
            </span>
          </SearchField>
        ) : null}

        <button
          type="submit"
          className="inline-flex h-full min-h-14 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600 @[22rem]:col-span-2 @[60rem]:col-span-1"
        >
          <Search aria-hidden="true" className="size-4" />
          Search cars
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[11px] font-bold text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
