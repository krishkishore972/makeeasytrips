"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  CalendarDays,
  MapPin,
  PlaneTakeoff,
  Search,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchField, searchInputClassName } from "@/components/search/search-field";
import { addDaysISO, isValidISODate, todayISO } from "@/lib/dates";
import { CABIN_OPTIONS, type Cabin } from "@/lib/search-options";
import { cn } from "@/lib/utils";

export type CityOption = {
  code: string;
  name: string;
};

type FlightSearchFormProps = {
  cities: CityOption[];
  initial: {
    from: string;
    to: string;
    depart: string;
    returnDate: string;
    pax: number;
    cabin: Cabin;
  };
  className?: string;
};

export function FlightSearchForm({ cities, initial, className }: FlightSearchFormProps) {
  const [from, setFrom] = useState(initial.from || cities[0]?.code || "");
  const [to, setTo] = useState(initial.to || cities[1]?.code || "");
  const [depart, setDepart] = useState(
    isValidISODate(initial.depart) ? initial.depart : addDaysISO(todayISO(), 14),
  );
  const [returnDate, setReturnDate] = useState(initial.returnDate);
  const [roundTrip, setRoundTrip] = useState(Boolean(initial.returnDate));
  const [pax, setPax] = useState(String(initial.pax));
  const [cabin, setCabin] = useState<Cabin>(initial.cabin);
  const [error, setError] = useState<string | null>(null);

  function selectRoundTrip(next: boolean) {
    setRoundTrip(next);
    setError(null);
    if (next && (!returnDate || returnDate <= depart)) {
      setReturnDate(addDaysISO(depart, 4));
    }
  }

  function swapCities() {
    setFrom(to);
    setTo(from);
    setError(null);
  }

  return (
    <form
      action="/flights"
      method="get"
      role="search"
      aria-label="Flight search"
      className={cn("rounded-2xl border border-line bg-surface p-3 shadow-sm sm:p-4", className)}
      onSubmit={(event) => {
        if (from === to) {
          event.preventDefault();
          setError("Choose two different cities for this search.");
          return;
        }
        if (roundTrip && returnDate && returnDate <= depart) {
          event.preventDefault();
          setError("The return date needs to be after the departure date.");
          return;
        }
        setError(null);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Trip type"
          className="flex rounded-lg border border-line bg-canvas p-1"
        >
          <button
            type="button"
            aria-pressed={!roundTrip}
            onClick={() => selectRoundTrip(false)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-extrabold transition-colors",
              !roundTrip ? "bg-surface text-brand-800 shadow-xs" : "text-muted hover:text-ink",
            )}
          >
            One way
          </button>
          <button
            type="button"
            aria-pressed={roundTrip}
            onClick={() => selectRoundTrip(true)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-extrabold transition-colors",
              roundTrip ? "bg-surface text-brand-800 shadow-xs" : "text-muted hover:text-ink",
            )}
          >
            Round trip
          </button>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
          <CalendarDays aria-hidden="true" className="size-3.5 text-brand-500" />
          Demo fares in INR · no payment
        </span>
      </div>

      <div
        className={cn(
          "mt-3 grid gap-2 sm:grid-cols-2",
          roundTrip
            ? "lg:grid-cols-[1.1fr_2.2rem_1.1fr_1fr_1fr_0.9fr_0.9fr_auto]"
            : "lg:grid-cols-[1.1fr_2.2rem_1.1fr_1fr_1fr_0.9fr_auto]",
        )}
      >
        <SearchField id="flight-from" label="From" icon={PlaneTakeoff}>
          <select
            id="flight-from"
            name="from"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setError(null);
            }}
            className={searchInputClassName}
          >
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name} ({city.code})
              </option>
            ))}
          </select>
        </SearchField>

        <button
          type="button"
          onClick={swapCities}
          aria-label="Swap departure and destination"
          className="mx-auto grid size-9 place-items-center self-center rounded-full border border-line bg-surface text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-50"
        >
          <ArrowLeftRight aria-hidden="true" className="size-4" />
        </button>

        <SearchField id="flight-to" label="To" icon={MapPin}>
          <select
            id="flight-to"
            name="to"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setError(null);
            }}
            className={searchInputClassName}
          >
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name} ({city.code})
              </option>
            ))}
          </select>
        </SearchField>

        <DatePicker
          name="depart"
          label="Depart"
          value={depart}
          min={todayISO()}
          onChange={(value) => {
            setDepart(value);
            setError(null);
            if (roundTrip && returnDate && returnDate <= value) {
              setReturnDate(addDaysISO(value, 4));
            }
          }}
        />

        {roundTrip ? (
          <DatePicker
            name="return"
            label="Return"
            value={returnDate}
            min={depart}
            onChange={(value) => {
              setReturnDate(value);
              setError(null);
            }}
          />
        ) : null}

        <SearchField id="flight-pax" label="Travellers" icon={UsersRound}>
          <select
            id="flight-pax"
            name="pax"
            value={pax}
            onChange={(event) => setPax(event.target.value)}
            className={searchInputClassName}
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "adult" : "adults"}
              </option>
            ))}
          </select>
        </SearchField>

        <SearchField id="flight-cabin" label="Cabin" icon={PlaneTakeoff}>
          <select
            id="flight-cabin"
            name="cabin"
            value={cabin}
            onChange={(event) => setCabin(event.target.value as Cabin)}
            className={searchInputClassName}
          >
            {CABIN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SearchField>

        <button
          type="submit"
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
