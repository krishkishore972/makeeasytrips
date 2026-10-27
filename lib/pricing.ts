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
