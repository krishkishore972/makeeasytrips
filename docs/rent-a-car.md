# Rent a car

The self-drive rental section is the Phase 7 addition. It follows the shape of a consumer
self-drive marketplace (city + time window + specific car) rather than a taxi flow: there is no
driver, no per-kilometre fare, and no dispatch. Every listing is a named model in a named city with
its own host, kilometre plan, and handover point.

All inventory is fictional. No car is held, no licence or identity document is collected, no
payment is taken, and nothing is stored.

## Routes

| Route                | What it does                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/rent-a-car`        | Landing: hero search, three rental plans, featured cars, body styles, cities, how-it-works, FAQ, host call to action |
| `/rent-a-car/search` | URL-driven results: plan tabs, filters, sort, active-filter chips, empty states                                      |
| `/rent-a-car/[id]`   | Detail: gallery, specification, kilometre plans, extras, host, policies, reviews, live price panel, similar cars     |
| `/cabs`, `/cabs/*`   | Permanent redirects to `/rent-a-car` (the old placeholder)                                                           |

Both search and detail render a static shell and stream the query-dependent part inside
`<Suspense>`, with `loading.tsx` skeletons for each route. `search` is `noindex, follow`; detail
pages are canonical to `/rent-a-car/[id]`.

## Query contract

`/rent-a-car/search` reads:

| Param          | Values                                                                 | Default            |
| -------------- | ---------------------------------------------------------------------- | ------------------ |
| `city`         | three-letter code from the car catalogue (`GOI`, `BLR`, …)             | none → city picker |
| `start`, `end` | `YYYY-MM-DDTHH:MM` local India time                                    | 14 days out, 48 h  |
| `mode`         | `daily`, `subscription`, `weekday`                                     | `daily`            |
| `sort`         | `recommended`, `price-asc`, `price-desc`, `rating`, `distance`         | `recommended`      |
| `budget`       | `under-300`, `300-600`, `600-1000`, `over-1000` (₹ per hour)           | none               |
| `type`         | `Hatchback`, `Compact SUV`, `MUV/MPV`, `SUV`, `Compact Sedan`, `Sedan` | none               |
| `transmission` | `Manual`, `Automatic`                                                  | none               |
| `fuel`         | `Petrol`, `Diesel`, `Electric`                                         | none               |
| `seats`        | `4-5`, `6-7`                                                           | none               |
| `rating`       | `3.5`, `4.0`, `4.2`, `4.5` (minimum)                                   | none               |
| `year`         | minimum model year, 2018–2026                                          | none               |
| `distance`     | maximum km from the city centre (5, 10, 20, 50)                        | none               |
| `fastag`       | `1`                                                                    | off                |
| `delivery`     | `1`                                                                    | off                |

List params are comma-separated and de-duplicated; unknown values are dropped rather than
rejected. A malformed city code, reversed window, or a plan that breaks its minimum produces an
inline error with a link back to a clean search.

`/rent-a-car/[id]` accepts only `start` and `end`; both are optional and fall back to the same
48-hour default. The detail page never trusts the window without re-validating it.

## Rental plans

| Mode         | Minimum | Rule                                                            |
| ------------ | ------- | --------------------------------------------------------------- |
| Daily Drives | 1 day   | Any window up to 30 days                                        |
| Subscription | 7 days  | Intended for long stays; a shorter window is rejected with copy |
| Weekday Pass | 5 days  | Pick-up must be a **Monday**, so the plan covers Monday–Friday  |

Billing always uses 24-hour blocks: `rentalDaysFor(hours) = ceil(hours / 24)`, minimum one. A
30-hour rental is billed as two days. The search summary shows both the duration and the billed
day count.

## Data

`data/cars.csv` holds 62 rows:

| Column                                                          | Notes                                                                             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `id`, `brand`, `model`, `variant`, `year`                       | One row per specific car, not a category                                          |
| `city_code`                                                     | One of 12 car cities (BLR, BOM, CCU, COK, DEL, GOI, HYD, IXL, JAI, MAA, PNQ, UDR) |
| `car_type`, `transmission`, `fuel`, `seats`                     | Six body styles, manual/automatic, petrol/diesel/electric                         |
| `price_per_hour`                                                | ₹149–₹2,499 in the demo fleet                                                     |
| `km_limit_per_day`                                              | 300 on every row                                                                  |
| `rating`, `review_count`, `distance_km`                         | Fictional guest signals and handover distance                                     |
| `host_name`, `host_type`                                        | Fictional individual or professional host                                         |
| `fastag`, `home_delivery`, `delivery_fee`, `deposit`            | Handover and deposit facts                                                        |
| `image`, `tagline`, `description`, `featured`, `guest_favorite` | Artwork and card copy                                                             |

Rows are parsed and validated with `carSchema` in `lib/data/schemas.ts`. `lib/data/cars.ts` exposes
`getCars`, `getCarById`, `searchCars`, `buildCarFacets`, `getCarCities`, `getFeaturedCars`,
`getCarsByCity`, `getSimilarCars`, and `getCarCityStats`. The API routes `/api/cars` and
`/api/cars/[id]` reuse the same helpers and return `400` for invalid queries and `404` for unknown
ids.

## Pricing

`carRentalBreakdown(pricePerHour, options)` in `lib/pricing.ts`:

1. `perDay = pricePerHour × 24`
2. `base = perDay × days`
3. add the kilometre plan (`₹399/day` for unlimited, `₹0` for the included 300 km/day)
4. add home delivery when selected (per-car fee, `₹0` when the host does not deliver)
5. add extras: FASTag `₹149` once, child seat `₹199/day`, additional driver `₹249/day`
6. add 18% GST on the subtotal
7. show the refundable deposit separately — it is never added to the total

The detail panel recalculates locally as the guest changes times, plan, delivery, and extras. The
review and confirmation steps recompute the same breakdown on the server, so the two never
disagree. Card totals on search results use the selected window with the included plan and no
extras.

Example from the test fixture (`car-maruti-suzuki-swift`, ₹219/hour, two days, included km, no
delivery): base ₹10,512 + GST ₹1,892 = ₹12,404, deposit ₹4,000 shown separately.

## Components

| File                                    | Role                                                               |
| --------------------------------------- | ------------------------------------------------------------------ |
| `components/cars/car-search-form.tsx`   | Client form: city, pick-up, drop-off, plan tabs, inline validation |
| `components/cars/car-card.tsx`          | Result/featured card: rating, specs, distance, host, trip total    |
| `components/cars/car-filters.tsx`       | Facet panel used in the desktop aside and the mobile drawer        |
| `components/cars/car-gallery.tsx`       | Single-image gallery shell with an accessible caption              |
| `components/cars/car-booking-panel.tsx` | Sticky price panel: times, km plan, delivery, extras, review link  |
| `components/cars/car-skeletons.tsx`     | Search and detail Suspense fallbacks                               |

The search form is width-aware through CSS container queries (`@container`), not viewport
breakpoints: the same component sits in a narrow hero card on the landing page and across the full
results width, and switches from one column to two to five columns based on its own width. Native
`datetime-local` inputs step down a font size in narrow cards so the picker icon keeps its space.

## Booking integration

Cars are the fourth booking type:

```text
/booking/review?type=car&id=car-maruti-suzuki-swift&start=2026-11-13T10:00&end=2026-11-15T10:00&plan=included&delivery=0&addons=child-seat
```

- `lib/validation/booking.ts` adds a `car` branch to the discriminated union: `id`, `start`, `end`,
  `plan`, `delivery` (`0`/`1`), `addons` (comma-separated).
- `lib/booking.ts` adds `resolveCarBooking`, the `Car rental` label, the `CR` reference prefix, and
  the breadcrumb/product labels.
- Review shows the full split (rental, km plan, delivery, extras, GST), the refundable deposit as a
  separate note, and three next steps: handover city, driving licence, fuel/return rules.
- Confirmation uses `TN-CR-XXXXXX` and links back to the car and to `/rent-a-car`.

## Navigation and visibility changes

- Primary navigation is Hotels, Holidays, Rent a car, Offers. Flights and trains keep their routes
  and source files but are not linked from the navbar, mobile nav, footer, home page, or offers.
- The home hero is a hotel search with Hotels / Holidays / Rent a car tabs; the car tab links to
  `/rent-a-car`.
- The home page has a featured self-drive section above the holiday ideas.
- `data/offers.csv` keeps its flight and train rows; `lib/data/offers.ts` filters public queries to
  `hotels`, `holidays`, and `cars`, and the offer board only shows those categories.
- `/cabs` and `/cabs/*` permanently redirect to `/rent-a-car` in `next.config.ts`.
- Hotel, holiday, my-trips, and booking empty states now point at the car section instead of cabs.

## Verification

- `npm test`: 115 tests, including car date windows, pricing, URL parsing, booking resolution,
  facet building, and the offer visibility filter.
- `npm run audit:a11y`: 19/19 routes clean under WCAG 2.2 AA, including the car landing, search,
  detail, review, and confirmation pages.
- `npm run audit:perf`: 13 routes, worst LCP 704 ms, CLS 0, largest JS bundle 289 kB.
- `npm run build`: 42 routes; the car routes are partial-prerender with static shells.

## Deliberate gaps

- No availability calendar, inventory holds, or double-booking checks. Every car is always
  available in the demo.
- No accounts, KYC, licence verification, payment, or deposit authorisation.
- No map, pick-up pin, or distance calculation; `distance_km` is a static fictional value.
- One illustration per car, shared across body styles. There is no photo set or 360° view.
- Reviews are generated from the car's rating and are not user-submitted.
- The host programme is copy only; no application form is collected.
- Cancellation, fuel, and damage policies are illustrative strings, not a rules engine.
- Trains remain a static shell and flights remain routable but unlinked, per the Phase 7 brief.
