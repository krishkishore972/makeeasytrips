"use client";

import { CalendarDays, Minus, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import { formatDateLong, formatDateShort } from "@/lib/dates";
import { holidayPriceBreakdown } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

type HolidayBookingPanelProps = {
  title: string;
  pricePerPerson: number;
  departures: string[];
  initialDeparture: string;
  initialTravellers: number;
  cityName: string;
};

export function HolidayBookingPanel({
  title,
  pricePerPerson,
  departures,
  initialDeparture,
  initialTravellers,
  cityName,
}: HolidayBookingPanelProps) {
  const [departure, setDeparture] = useState(
    departures.includes(initialDeparture) ? initialDeparture : (departures[0] ?? ""),
  );
  const [travellers, setTravellers] = useState(Math.min(9, Math.max(1, initialTravellers || 2)));

  const price = holidayPriceBreakdown(pricePerPerson, travellers);
  const summary = `${cityName} · ${formatDateLong(departure)} · ${travellers} ${
    travellers === 1 ? "traveller" : "travellers"
  }`;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="eyebrow">Your holiday</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-ink">{formatCurrency(pricePerPerson)}</span>
        <span className="text-xs font-semibold text-muted">/ person</span>
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Twin-sharing demo price · taxes shown in the total
      </p>

      <fieldset className="mt-4 border-t border-line pt-4">
        <legend className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          Choose a departure
        </legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {departures.length > 0 ? (
            departures.map((date) => {
              const selected = date === departure;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setDeparture(date)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "rounded-xl border border-brand-700 bg-brand-700 px-3 py-2 text-left text-[11px] font-extrabold text-white shadow-xs"
                      : "rounded-xl border border-line bg-canvas px-3 py-2 text-left text-[11px] font-bold text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50"
                  }
                >
                  <span className="block">{formatDateShort(date)}</span>
                  <span
                    className={
                      selected
                        ? "block text-[9px] font-semibold text-brand-100"
                        : "block text-[9px] font-semibold text-muted-soft"
                    }
                  >
                    {date.slice(0, 4)}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="text-xs text-muted">Dates on request.</p>
          )}
        </div>
      </fieldset>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink">
          <UsersRound aria-hidden="true" className="size-4 text-brand-600" />
          Travellers
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTravellers((current) => Math.max(1, current - 1))}
            disabled={travellers <= 1}
            aria-label="Remove one traveller"
            className="grid size-7 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus aria-hidden="true" className="size-3.5" />
          </button>
          <span aria-live="polite" className="min-w-5 text-center text-sm font-extrabold text-ink">
            {travellers}
          </span>
          <button
            type="button"
            onClick={() => setTravellers((current) => Math.min(9, current + 1))}
            disabled={travellers >= 9}
            aria-label="Add one traveller"
            className="grid size-7 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      </div>

      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">
            {formatCurrency(pricePerPerson)} × {travellers}{" "}
            {travellers === 1 ? "traveller" : "travellers"}
          </dt>
          <dd className="font-bold text-ink">{formatCurrency(price.base)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Taxes and fees (5%)</dt>
          <dd className="font-bold text-ink">{formatCurrency(price.taxes)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <dt className="text-sm font-extrabold text-ink">Package total</dt>
          <dd className="text-lg font-extrabold text-ink">{formatCurrency(price.total)}</dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[10px] leading-4 text-muted">
        {departure ? summary : "Choose a departure date to see the full trip summary."}
      </p>

      <EnquiryDialog
        target={{
          service: "holiday",
          title,
          context: [
            `Destination: ${cityName}`,
            departure ? `Departure: ${formatDateLong(departure)}` : "Departure: on request",
            `Travellers: ${travellers}`,
          ],
        }}
        label="Enquire about this holiday"
        className="mt-4 w-full"
      />

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-soft">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
        Share your details and enquiry directly with our business WhatsApp.
      </p>
    </div>
  );
}
