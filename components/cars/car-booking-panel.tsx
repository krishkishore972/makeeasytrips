"use client";

import { CalendarClock, Check, Gauge, Info, MapPin, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import {
  formatDateTimeShort,
  formatRentalDuration,
  isValidISODateTime,
  rentalDaysFor,
  rentalHoursBetween,
} from "@/lib/dates";
import type { Car } from "@/lib/data/schemas";
import { carRentalBreakdown } from "@/lib/pricing";
import {
  CAR_ADDON_OPTIONS,
  CAR_KM_PLAN_OPTIONS,
  type CarAddon,
  type CarKmPlan,
} from "@/lib/search-options";
import { cn, formatCurrency } from "@/lib/utils";

type CarBookingPanelProps = {
  car: Car;
  initial: {
    start: string;
    end: string;
  };
};

export function CarBookingPanel({ car, initial }: CarBookingPanelProps) {
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [plan, setPlan] = useState<CarKmPlan>("included");
  const [delivery, setDelivery] = useState(false);
  const [addons, setAddons] = useState<CarAddon[]>([]);

  const hours = rentalHoursBetween(start, end);
  const validTimes = hours !== null && hours <= 30 * 24;
  const days = hours ? rentalDaysFor(hours) : 1;

  const selectedPlan = CAR_KM_PLAN_OPTIONS.find((option) => option.value === plan);
  const selectedAddons = CAR_ADDON_OPTIONS.filter((option) => addons.includes(option.value));
  const breakdown = carRentalBreakdown(car.price_per_hour, {
    days,
    kmPlanExtraPerDay: selectedPlan?.extraPerDay ?? 0,
    delivery: delivery && car.home_delivery,
    deliveryFee: car.delivery_fee,
    addons: selectedAddons,
    deposit: car.deposit,
  });

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <p className="flex items-baseline gap-1.5">
          <span className="text-2xl leading-none font-extrabold text-ink">
            {formatCurrency(car.price_per_hour)}
          </span>
          <span className="text-[11px] font-semibold text-muted">/ hour</span>
        </p>
        <p className="text-[11px] font-bold text-muted">
          {formatCurrency(breakdown.perDay)} per 24-hour day
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 rounded-xl border border-line bg-canvas px-3 py-2">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
            <CalendarClock aria-hidden="true" className="size-3" />
            Pick-up
          </span>
          <input
            type="datetime-local"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="h-7 w-full min-w-0 bg-transparent text-[12px] font-bold text-ink [color-scheme:light] outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 rounded-xl border border-line bg-canvas px-3 py-2">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
            <CalendarClock aria-hidden="true" className="size-3" />
            Drop-off
          </span>
          <input
            type="datetime-local"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            className="h-7 w-full min-w-0 bg-transparent text-[12px] font-bold text-ink [color-scheme:light] outline-none"
          />
        </label>
      </div>

      <p
        aria-live="polite"
        className={cn(
          "mt-2 flex items-center gap-1.5 text-[11px] font-semibold",
          validTimes ? "text-muted" : "text-danger",
        )}
      >
        {validTimes ? (
          <>
            <Gauge aria-hidden="true" className="size-3.5 text-brand-600" />
            {formatDateTimeShort(start)} → {formatDateTimeShort(end)} ·{" "}
            {formatRentalDuration(hours)}
          </>
        ) : (
          <>
            <Info aria-hidden="true" className="size-3.5" />
            {isValidISODateTime(start) && isValidISODateTime(end)
              ? "Drop-off must be after pick-up, within 30 days."
              : "Choose a valid pick-up and drop-off time."}
          </>
        )}
      </p>

      <fieldset className="mt-3 border-t border-line pt-3">
        <legend className="text-[11px] font-extrabold tracking-[0.12em] text-ink uppercase">
          Kilometre plan
        </legend>
        <div className="mt-2 space-y-1.5">
          {CAR_KM_PLAN_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border px-2.5 py-2 transition-colors",
                plan === option.value
                  ? "border-brand-300 bg-brand-50"
                  : "border-line bg-canvas hover:border-brand-200",
              )}
            >
              <input
                type="radio"
                name="km-plan"
                value={option.value}
                checked={plan === option.value}
                onChange={() => setPlan(option.value)}
                className="peer sr-only"
              />
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-transparent peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
                <Check aria-hidden="true" className="size-3" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-extrabold text-ink">{option.label}</span>
                  <span className="text-[10px] font-bold text-muted">
                    {option.extraPerDay === 0
                      ? "Included"
                      : `+${formatCurrency(option.extraPerDay)}/day`}
                  </span>
                </span>
                <span className="mt-0.5 block text-[10px] leading-4 text-muted-soft">
                  {option.detail}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-3 border-t border-line pt-3">
        <legend className="text-[11px] font-extrabold tracking-[0.12em] text-ink uppercase">
          Extras
        </legend>
        <div className="mt-2 space-y-1.5">
          <label
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-2.5 py-2",
              car.home_delivery
                ? "cursor-pointer border-line bg-canvas hover:border-brand-200"
                : "cursor-not-allowed border-line bg-canvas opacity-60",
            )}
          >
            <input
              type="checkbox"
              checked={delivery && car.home_delivery}
              disabled={!car.home_delivery}
              onChange={() => setDelivery((value) => !value)}
              className="peer sr-only"
            />
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded border border-line-strong bg-surface text-transparent peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
              <Check aria-hidden="true" className="size-3" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink">
                  <Truck aria-hidden="true" className="size-3.5 text-brand-600" />
                  Home delivery
                </span>
                <span className="text-[10px] font-bold text-muted">
                  {car.home_delivery ? formatCurrency(car.delivery_fee) : "Unavailable"}
                </span>
              </span>
              <span className="mt-0.5 block text-[10px] leading-4 text-muted-soft">
                {car.home_delivery
                  ? `Delivered within ${car.distance_km} km of the city centre`
                  : "This host hands the car over in person"}
              </span>
            </span>
          </label>

          {CAR_ADDON_OPTIONS.map((option) => {
            const checked = addons.includes(option.value);
            const disabled = option.value === "fastag" && car.fastag;

            return (
              <label
                key={option.value}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border px-2.5 py-2",
                  disabled
                    ? "cursor-not-allowed border-line bg-canvas opacity-60"
                    : "cursor-pointer border-line bg-canvas hover:border-brand-200",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked || disabled}
                  disabled={disabled}
                  onChange={() =>
                    setAddons((current) =>
                      current.includes(option.value)
                        ? current.filter((value) => value !== option.value)
                        : [...current, option.value],
                    )
                  }
                  className="peer sr-only"
                />
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded border border-line-strong bg-surface text-transparent peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
                  <Check aria-hidden="true" className="size-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-extrabold text-ink">{option.label}</span>
                    <span className="text-[10px] font-bold text-muted">
                      {disabled
                        ? "Fitted"
                        : `${formatCurrency(option.price)}${option.perDay ? "/day" : ""}`}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-muted-soft">
                    {disabled ? "Already fitted to this car" : option.detail}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 rounded-xl bg-canvas p-3">
        <dl className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">
              {formatCurrency(breakdown.perDay)} × {days} {days === 1 ? "day" : "days"}
            </dt>
            <dd className="font-bold text-ink">{formatCurrency(breakdown.base)}</dd>
          </div>
          {breakdown.kmFee > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">Unlimited kilometres</dt>
              <dd className="font-bold text-ink">{formatCurrency(breakdown.kmFee)}</dd>
            </div>
          ) : null}
          {breakdown.deliveryFee > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">Home delivery</dt>
              <dd className="font-bold text-ink">{formatCurrency(breakdown.deliveryFee)}</dd>
            </div>
          ) : null}
          {breakdown.addonFee > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">Extras</dt>
              <dd className="font-bold text-ink">{formatCurrency(breakdown.addonFee)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">GST (18%)</dt>
            <dd className="font-bold text-ink">{formatCurrency(breakdown.taxes)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-line pt-2">
            <dt className="text-xs font-extrabold text-ink">Rental total</dt>
            <dd className="text-lg font-extrabold text-ink">{formatCurrency(breakdown.total)}</dd>
          </div>
        </dl>
        <p className="mt-2 flex items-start gap-1.5 border-t border-line pt-2 text-[10px] leading-4 text-muted-soft">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
          {formatCurrency(breakdown.deposit)} refundable deposit, shown at review and never charged.
        </p>
      </div>

      <EnquiryDialog
        target={{
          service: "car",
          title: `${car.brand} ${car.model}`,
          context: [
            `Pick-up: ${start}`,
            `Drop-off: ${end}`,
            `Kilometre plan: ${selectedPlan?.label ?? plan}`,
            `Home delivery: ${delivery && car.home_delivery ? "Yes" : "No"}`,
          ],
        }}
        label="Enquire about this car"
        className="mt-3 w-full"
      />

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-muted-soft">
        <MapPin aria-hidden="true" className="size-3" />
        Pick-up in {car.city_code} · {car.distance_km} km from the centre
      </p>
    </div>
  );
}
