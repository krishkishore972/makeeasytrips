export type FareBreakdown = {
  base: number;
  taxes: number;
  total: number;
};

/** Demo fare split: the published fare includes taxes, shown separately for clarity. */
export function flightFareBreakdown(farePerTraveller: number, travellers: number): FareBreakdown {
  const basePerTraveller = Math.round(farePerTraveller * 0.88);
  const taxesPerTraveller = farePerTraveller - basePerTraveller;
  return {
    base: basePerTraveller * travellers,
    taxes: taxesPerTraveller * travellers,
    total: farePerTraveller * travellers,
  };
}

export function hotelStayBreakdown(
  pricePerNight: number,
  nights: number,
  rooms: number,
  taxPercent: number,
): FareBreakdown & { perNight: number } {
  const base = pricePerNight * nights * rooms;
  const taxes = Math.round((base * taxPercent) / 100);
  return {
    base,
    taxes,
    total: base + taxes,
    perNight: pricePerNight,
  };
}

/**
 * Holiday packages are quoted per person. The demo total multiplies the
 * per-person price by travellers, then adds a flat 5% demo tax and fee.
 */
export function holidayPriceBreakdown(
  pricePerPerson: number,
  travellers: number,
  taxPercent = 5,
): FareBreakdown & { perPerson: number; travellers: number } {
  const base = pricePerPerson * travellers;
  const taxes = Math.round((base * taxPercent) / 100);

  return {
    base,
    taxes,
    total: base + taxes,
    perPerson: pricePerPerson,
    travellers,
  };
}

export type CarRentalBreakdown = FareBreakdown & {
  perDay: number;
  days: number;
  kmFee: number;
  deliveryFee: number;
  addonFee: number;
  deposit: number;
};

export type CarRentalPricing = {
  days: number;
  kmPlanExtraPerDay: number;
  delivery: boolean;
  deliveryFee: number;
  addons: { price: number; perDay: boolean }[];
  taxPercent?: number;
  deposit?: number;
};

/**
 * Self-drive rentals are billed in 24-hour blocks. The card rate is hourly, but
 * the trip total uses the derived day rate so a 30-hour booking is two days.
 */
export function carRentalBreakdown(
  pricePerHour: number,
  pricing: CarRentalPricing,
): CarRentalBreakdown {
  const days = Math.max(1, pricing.days);
  const perDay = pricePerHour * 24;
  const base = perDay * days;
  const kmFee = pricing.kmPlanExtraPerDay * days;
  const deliveryFee = pricing.delivery ? pricing.deliveryFee : 0;
  const addonFee = pricing.addons.reduce(
    (total, addon) => total + (addon.perDay ? addon.price * days : addon.price),
    0,
  );
  const taxable = base + kmFee + deliveryFee + addonFee;
  const taxes = Math.round((taxable * (pricing.taxPercent ?? 18)) / 100);

  return {
    base,
    taxes,
    total: taxable + taxes,
    perDay,
    days,
    kmFee,
    deliveryFee,
    addonFee,
    deposit: pricing.deposit ?? 0,
  };
}
