"use client";

import { ArrowRight, BedDouble, MapPin, Search, UsersRound } from "lucide-react";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchField, searchInputClassName } from "@/components/search/search-field";
import { addDaysISO, isValidISODate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { CityOption } from "@/components/flights/flight-search-form";

type HotelSearchFormProps = {
  cities: CityOption[];
  initial: {
    city: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    guests: number;
  };
  className?: string;
};

export function HotelSearchForm({ cities, initial, className }: HotelSearchFormProps) {
  const [city, setCity] = useState(initial.city);
  const [checkIn, setCheckIn] = useState(
    isValidISODate(initial.checkIn) ? initial.checkIn : addDaysISO(todayISO(), 14),
  );
  const [checkOut, setCheckOut] = useState(
    isValidISODate(initial.checkOut) ? initial.checkOut : addDaysISO(todayISO(), 16),
  );
  const [rooms, setRooms] = useState(String(initial.rooms));
  const [guests, setGuests] = useState(String(initial.guests));
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action="/hotels"
      method="get"
      role="search"
      aria-label="Hotel search"
      className={cn("rounded-2xl border border-line bg-surface p-3 shadow-sm sm:p-4", className)}
      onSubmit={(event) => {
        if (!city) {
          event.preventDefault();
          setError("Choose a city to see stays.");
          return;
        }
        if (checkOut <= checkIn) {
          event.preventDefault();
          setError("Check-out needs to be after check-in.");
          return;
        }
        setError(null);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.12em] text-brand-700 uppercase">
          <BedDouble aria-hidden="true" className="size-3.5" />
          Find a stay
        </p>
        <span className="text-[11px] font-semibold text-muted">
          Demo rates in INR · taxes shown separately
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.9fr_auto]">
        <SearchField id="hotel-city" label="City, area, or stay" icon={MapPin}>
          <select
            id="hotel-city"
            name="city"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setError(null);
            }}
            className={searchInputClassName}
          >
            <option value="">Where to?</option>
            {cities.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name} ({option.code})
              </option>
            ))}
          </select>
        </SearchField>

        <DatePicker
          name="checkin"
          label="Check-in"
          value={checkIn}
          min={todayISO()}
          onChange={(value) => {
            setCheckIn(value);
            setError(null);
            if (checkOut <= value) setCheckOut(addDaysISO(value, 2));
          }}
        />

        <DatePicker
          name="checkout"
          label="Check-out"
          value={checkOut}
          min={addDaysISO(checkIn, 1)}
          onChange={(value) => {
            setCheckOut(value);
            setError(null);
          }}
        />

        <SearchField id="hotel-rooms" label="Rooms" icon={BedDouble}>
          <select
            id="hotel-rooms"
            name="rooms"
            value={rooms}
            onChange={(event) => setRooms(event.target.value)}
            className={searchInputClassName}
          >
            {[1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "room" : "rooms"}
              </option>
            ))}
          </select>
        </SearchField>

        <SearchField id="hotel-guests" label="Guests" icon={UsersRound}>
          <select
            id="hotel-guests"
            name="guests"
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
            className={searchInputClassName}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "guest" : "guests"}
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
