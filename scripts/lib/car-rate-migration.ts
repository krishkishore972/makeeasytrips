export type CarRateRecord = {
  id?: unknown;
  price_per_hour?: unknown;
  price_per_day?: unknown;
  price_per_week?: unknown;
};

function validRate(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/** Preserve explicit rates; convert only missing values and reject invalid data. */
export function migratedCarRates(record: CarRateRecord) {
  const daily =
    record.price_per_day ??
    (validRate(record.price_per_hour) ? record.price_per_hour * 24 : undefined);
  const weekly = record.price_per_week ?? (validRate(daily) ? daily * 7 : undefined);

  if (!validRate(daily) || !validRate(weekly)) {
    throw new Error(`Car ${String(record.id ?? "(unknown)")} has invalid or missing rental rates.`);
  }

  return { price_per_day: daily, price_per_week: weekly };
}

export function needsCarRateMigration(record: CarRateRecord) {
  return (
    Object.hasOwn(record, "price_per_hour") ||
    record.price_per_day == null ||
    record.price_per_week == null
  );
}
