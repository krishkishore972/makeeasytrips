# TripNest

TripNest is an original, learning-purpose travel experience inspired by the structure and
flows of modern travel-booking products. It is **not** affiliated with, endorsed by, or
connected to any travel brand. There are no real bookings, payments, accounts, or stored
personal details.

The project is being built in phases. **Phases 1 (foundation), 2 (flights and hotels), 3
(holidays, offers, and APIs), 4 (home and editorial polish), and 5 (mock booking review and
confirmation) are complete.** The quality and accessibility pass arrives in Phase 6.

## What is in this build

- Next.js App Router with React Server Components by default and small client leaves
- TypeScript in strict mode with Zod for environment validation and CSV row parsing
- Tailwind CSS v4 theme with an original lagoon-teal, coral, and gold palette
- Fraunces display serif and Manrope UI sans via `next/font`
- Lenis smooth scrolling with `prefers-reduced-motion` support
- Motion (Framer Motion) shared variants, scroll reveals, and reduced-motion handling
- Responsive two-tier navbar, mobile navigation sheet, demo login dialog, and footer
- Full home composition: hero with catalogue counts, tabbed GET search widget, trust strip,
  offer and holiday carousels, curated destinations, trending stays, how-it-works, field notes,
  newsletter, FAQ, and a final call to action
- A typed, cached CSV data layer with 16 cities, 540 flights, 32 stays, 12 holidays, and 12 offers
- Flight search and results: route/date/traveller form, filters, sorting, active-filter chips,
  result cards, and a detail page with fare breakdown and review hand-off
- Hotel search and results: city/date/room form, filters, sorting, result cards, a landing page
  with featured stays, and a detail page with gallery, amenities, rate plans, and policies
- Holiday catalogue: destination-led browsing, theme/length/budget filters, sorting, featured and
  destination strips, and package detail pages with gallery, day-by-day itinerary, inclusions,
  departure picker, live demo totals, and similar packages
- Shared mock booking flow: a URL-driven review step for flights, stays, and holidays, a native
  acknowledgement form, deterministic demo references, and a confirmation page with next steps
- Offer board: category tabs with counts, a featured banner, copyable demo codes, validity dates,
  and expandable terms
- JSON APIs at `/api/flights`, `/api/hotels`, `/api/holidays`, `/api/offers`, and `/api/cities`,
  validated with Zod
- Placeholder routes for the remaining travel lines, plus editorial and legal pages
- Root `loading.tsx`, `error.tsx`, `not-found.tsx`, and an SVG app icon
- Local abstract SVG artwork under `public/images`; no third-party brand assets

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Production check:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run start
```

## Routes

| Route                    | State                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `/`                      | Full home composition with data-driven carousels, destinations, stays, and FAQ          |
| `/flights`               | Flight search, URL-driven results, filters, sorting, and empty states                   |
| `/flights/[id]`          | Flight detail with fare breakdown and a review hand-off                                 |
| `/hotels`                | Hotel landing, URL-driven results, filters, sorting, and featured stays                 |
| `/hotels/[id]`           | Hotel detail: gallery, amenities, rate plans, policies, location, price box             |
| `/holidays`              | Holiday catalogue: destination strip, theme/length/budget filters, sort, featured trips |
| `/holidays/[slug]`       | Package detail: gallery, itinerary, inclusions, departure picker, live total, similar   |
| `/booking/review`        | Shared mock review for a flight, stay, or holiday selection                             |
| `/booking/confirmation`  | Mock confirmation with a deterministic reference and next steps                         |
| `/trains`, `/cabs`       | Static shells, intentionally out of the current roadmap                                 |
| `/offers`                | Offer board with category tabs, featured offer, copyable codes, and terms               |
| `/my-trips`, `/wishlist` | Static empty-state demos                                                                |
| `/info/[slug]`           | About, how-it-works, help, legal, accessibility, contact, disclaimer                    |
| `/api/flights`           | JSON search API (query validation, `400` on invalid input)                              |
| `/api/flights/[id]`      | JSON flight detail (`404` when unknown)                                                 |
| `/api/hotels`            | JSON hotel search API                                                                   |
| `/api/hotels/[id]`       | JSON hotel detail with the stay price breakdown                                         |
| `/api/holidays`          | JSON holiday search API with per-person and traveller totals                            |
| `/api/holidays/[slug]`   | JSON holiday detail with itinerary and price breakdown                                  |
| `/api/offers`            | JSON offer list, category filter, and category counts                                   |
| `/api/cities`            | City list, optionally scoped to `flights` or `hotels`                                   |

Search and filter state lives entirely in URL search params, so every results view is linkable
and the server renders the matching set:

- Flights: `from`, `to`, `depart`, `return`, `pax`, `cabin`, `sort`, `stops`, `airlines`,
  `window`, `duration`, `refundable`
- Hotels: `city`, `checkin`, `checkout`, `rooms`, `guests`, `sort`, `price`, `stars`, `rating`,
  `amenities`, `breakfast`, `cancel`
- Holidays: `destination`, `theme`, `duration`, `price`, `sort`, `travellers`, `depart`
- Offers: `category` (`all`, `flights`, `hotels`, `holidays`, `trains`, `cabs`)
- Booking review: `type` (`flight`, `hotel`, `holiday`) plus the selected product params
  (`id`/`slug`, dates, `pax`/`travellers`, `cabin`, `rooms`, `guests`, `plan`)
- Booking confirmation: the same params plus `confirmed=1`

Example:

```text
/flights?from=BOM&to=GOI&depart=2026-11-13&pax=2&cabin=economy&stops=0
/hotels?city=GOI&checkin=2026-11-13&checkout=2026-11-17&rooms=1&guests=2&stars=5
/holidays?destination=GOI&theme=beach,food&duration=short&price=under-20k&travellers=3
/offers?category=holidays
/booking/review?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy
/booking/review?type=hotel&id=htl-bom-harbour-and-hush&checkin=2026-11-13&checkout=2026-11-17&rooms=1&guests=2&plan=flex
/booking/review?type=holiday&slug=susegad-by-the-sea&depart=2026-11-14&travellers=3
```

## Structure

```text
app/                  Routes, layouts, loading/error/not-found, APIs, global styles
  api/                JSON route handlers for flights, hotels, holidays, offers, and cities
  booking/            Shared review and confirmation routes with loading skeletons
  flights/            Search/results page, detail page, loading skeletons
  holidays/           Catalogue page, package detail, loading skeletons
  hotels/             Landing/results page, detail page, loading skeletons
  offers/             Offer board and loading skeleton
components/
  booking/            Summary, price panel, acknowledgement form, progress, empty states
  flights/            Search form, filters, cards, popular routes, skeletons
  holidays/           Search form, filters, cards, gallery, itinerary, booking panel, skeletons
  home/               Home search widget, destination/stay cards, FAQ, field notes
  hotels/             Search form, filters, cards, gallery, skeletons
  layout/             Navbar, mobile nav, login dialog, footer, newsletter
  offers/             Offer card, category tabs, copy-code button, icon mapper, skeletons
  providers/          Motion and Lenis providers
  search/             Shared filter group, flag, sort, drawer, chips, URL hook
  shared/             Logo, breadcrumbs, rating, amenities, empty state, reveals, carousel
  ui/                 Small primitives (buttons, dialogs, popovers, selects)
data/                 CSV catalogue: cities, flights, hotels, holidays, offers
docs/REA.md           Reverse-engineering notes, evidence, and design decisions
hooks/                Small client hooks (scroll state, media query)
lib/
  booking.ts          Selection resolver, price summary, links, demo reference
  data/               Cached CSV loader, Zod schemas, query and facet helpers
  validation/         URL search-param and booking parsing with Zod
  pricing.ts          Fare, stay, and holiday totals with tax bands
  search-options.ts   Filter, sort, cabin, amenity, holiday, and offer option tables
  dates.ts            Date parsing, labels, and night counts
  home-content.ts     Original home FAQ and field-note copy
public/images/        Original abstract SVG placeholders
types/                Shared TypeScript types
```

## Data layer

CSV files are read once per process, parsed with PapaParse, validated row by row with Zod, and
cached as a promise in `lib/data/csv.ts`. Server Components and the API route handlers share the
same typed helpers, so there is no second source of truth.

| File                | Rows | Notes                                                               |
| ------------------- | ---- | ------------------------------------------------------------------- |
| `data/cities.csv`   | 16   | 10 flight cities and 8 hotel cities, with airport and tagline       |
| `data/flights.csv`  | 540  | 10 cities, 90 directional routes, 6 fictional airlines, 3 cabins    |
| `data/hotels.csv`   | 32   | 4 stays in each of 8 cities, fictional names, amenities, policies   |
| `data/holidays.csv` | 12   | 10 destinations, 10 themes, day-by-day JSON itineraries, departures |
| `data/offers.csv`   | 12   | Flights, stays, holidays, trains, and cabs with codes and terms     |

All fares, taxes, ratings, and availability are fictional demo values. Nothing is held, charged,
or persisted.

## Verification

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run start
```

Then spot-check:

```bash
curl -s "http://localhost:3000/api/flights?from=BOM&to=GOI&cabin=economy" | head -c 400
curl -s "http://localhost:3000/api/hotels?city=GOI&checkin=2026-11-13&checkout=2026-11-17" | head -c 400
curl -s "http://localhost:3000/api/holidays?theme=beach&travellers=3" | head -c 400
curl -s "http://localhost:3000/api/holidays/susegad-by-the-sea" | head -c 400
curl -s "http://localhost:3000/api/offers?category=holidays" | head -c 400
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/hotels/nope"   # 404
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/holidays/nope" # 404
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/flights?from=BOM" # 400
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/offers?category=nope" # 400
```

Booking hand-offs are URL-driven, so they can be checked directly:

```bash
curl -s "http://localhost:3000/booking/review?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy" | grep -o "Review your demo trip"
curl -s "http://localhost:3000/booking/confirmation?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy&confirmed=1" | grep -o "TN-FL-[A-Z0-9]*"
curl -s "http://localhost:3000/booking/review?type=hotel&id=htl-bom-harbour-and-hush&checkin=2026-11-13&checkout=2026-11-17&rooms=1&guests=2&plan=flex" | grep -o "Stay total"
curl -s "http://localhost:3000/booking/review?type=holiday&slug=susegad-by-the-sea&depart=2026-11-14&travellers=3" | grep -o "Package total"
curl -s "http://localhost:3000/booking/review?type=hotel&id=htl-bom-harbour-and-hush&checkin=2026-11-17&checkout=2026-11-13&rooms=1&guests=2&plan=flex" | grep -o "Check-out needs to be after check-in"
curl -s "http://localhost:3000/booking/confirmation?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy" | grep -o "Confirm your demo booking first"
```

On the home page, the offer and holiday carousels use previous/next controls with a polite slide
counter, the FAQ uses native disclosures, and the newsletter confirms that nothing was stored.
Destination and theme links point at real catalogue query params:

```bash
curl -s "http://localhost:3000/holidays?destination=UDR" | grep -o "Lake City in Three Acts"
curl -s "http://localhost:3000/holidays?theme=mountains" | grep -o "High Desert"
```

In the UI, changing a filter or sort order should update the URL and re-render the server-driven
result list. Filters use one shared client hook (`useSearchParamsUpdater`) so the back button and
shared links behave as expected.

## Design system

Tokens live in `app/globals.css` under `@theme`. Components use semantic names such as
`bg-brand-700`, `text-muted`, `border-line`, `bg-canvas`, `bg-surface`, `text-accent-500`,
and `shadow-glow` rather than raw hex values.

- Display type: Fraunces, used for headlines and package titles
- UI type: Manrope, used for navigation, forms, and body copy
- Primary: deep lagoon teal (`brand`)
- Accent: coral (`accent`) for primary calls to action
- Highlight: warm gold for ratings and small details
- Radius and shadows: generous, soft, and consistent across cards and panels
- Motion: transform/opacity only, one-shot scroll reveals, reduced-motion fallbacks

## Data roadmap

`cities.csv`, `flights.csv`, `hotels.csv`, `holidays.csv`, and `offers.csv` are implemented (see
**Data layer** above). They share the same cached loader and Zod row schemas, so every consumer
keeps one typed source of truth. Trains and cabs remain static shells by design.

## Reverse-engineering notes

`docs/REA.md` records the Step 0 analysis and the Phase 2–5 implementation records: observed
sitemap and layout patterns, inferred flows, CSV schemas, responsive behaviour, design decisions,
verification, and limitations. Live MakeMyTrip capture was blocked by an Akamai 403, so the
analysis relies on archived snapshots and public page structure. No proprietary code, logos,
photography, or marketing copy was reused.

## Roadmap

1. **Phase 1 — Foundation (done):** setup, tokens, layout shell, motion, home preview, route
   scaffolding, error/loading states.
2. **Phase 2 — Flights and hotels (done):** CSV data layer, search widgets, URL-driven results,
   filters, sorting, result cards, detail shells.
3. **Phase 3 — Holidays, offers, and APIs (done):** holiday catalogue and detail pages, offer
   board, route handlers, Zod query validation.
4. **Phase 4 — Home and editorial polish (done):** full home composition, accessible carousels,
   curated destinations and stays, field notes, newsletter, and FAQ.
5. **Phase 5 — Booking (done):** URL-driven review and confirmation for flights, stays, and
   holidays, deterministic demo references, and no payment or persistence.
6. **Phase 6 — Quality:** accessibility audit, performance pass, tests, documentation.

## Disclaimer

TripNest is an independent learning project. It is not a travel agency. All prices, inventory,
ratings, and offers are fictional. Nothing on the site creates a booking or charges a card.
