# REA: MakeMyTrip → TripNest

> **Purpose.** This document records the reverse-engineering analysis used to build a
> learning-only, original clone called **TripNest**. We reproduce structure, layout,
> flows, and UX patterns. We do **not** copy logos, brand assets, photography,
> copyrighted marketing copy, or proprietary code.
>
> **Status:** Step 0 complete. Phase 1 foundation complete; implementation notes are in
> `README.md`.

---

## 1. Method, evidence, and limitations

### 1.1 What was observed

| Source                                                                                                                | What it gave us                                                                                                                 | Evidence                                                                                             |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Archived India homepage, `web.archive.org/web/20260504161130/https://www.makemytrip.com/`                             | Header/footer DOM, navigation taxonomy, homepage card order, offer categories, destination content, currency/language selectors | REA `capture_browser_scenario` `ev_f78e5ec845d1313f510bdc0219f715b620257b41fa2ec76fd32420d6ed6d244d` |
| Archived homepage HTML (same timestamp, raw `id_` copy)                                                               | Static DOM, class names, inline CSS tokens, embedded page JSON (`cardSequence`, offers, destinations, header i18n)              | `curl` snapshot, 352,856 bytes                                                                       |
| Archived flights landing page, `web.archive.org/web/20250818211658/https://www.makemytrip.com/flights/`               | Flight search widget labels, trending searches, fare calendar, offers, FAQ structure, footer taxonomy                           | 290,548-byte snapshot                                                                                |
| Archived hotel listing page, `web.archive.org/web/20250113155006/https://www.makemytrip.com/hotels/hotel-listing/...` | Hotel search header, date/room controls, sort menu, listing shell                                                               | 596,344-byte snapshot                                                                                |
| Archived global homepage, `web.archive.org/web/20260918173523/https://www.makemytrip.global/`                         | International variant, header/footer, offers carousel shell, booking copy                                                       | 284,196-byte snapshot                                                                                |
| Live `www.makemytrip.global` response                                                                                 | 200 HTML response, same shell; browser rendering still failed to hydrate in the harness                                         | `curl` 200, 294,743 bytes                                                                            |
| Public search-result text for MakeMyTrip pages                                                                        | Page headings, search labels, offer sections, FAQ themes                                                                        | Web search excerpts (treated as secondary)                                                           |

### 1.2 What could not be observed

- **Live `www.makemytrip.com` capture was blocked.** Requests returned
  `HTTP/2 403` from `AkamaiGHost`; the browser scenario failed before initial state.
  The harness browser received `ERR_HTTP2_PROTOCOL_ERROR`.
- The archived React app **did not fully hydrate**: analytics and remote module
  chunks returned 404 through the archive. Header/footer rendered; the main
  content stayed in its loading state. Therefore the homepage content order below
  comes from the embedded page JSON, not from a fully painted screenshot.
- Search results, hotel detail, and checkout are **login/session-gated and
  dynamic**, and no usable archived result page was available. Their structure is
  reconstructed from the observed shell, the site's public UI patterns, and
  standard travel-booking conventions. These are marked **inferred** below.
- No MMT JavaScript bundle was copied or reused. Class names and token values are
  cited only as evidence of layout intent; TripNest uses its own implementation.

**Confidence labels used below:** `observed` = seen in archived DOM/JSON or capture;
`inferred` = reconstructed from patterns and secondary evidence; `decision` = a
deliberate TripNest design choice.

---

## 2. Sitemap and key pages

### 2.1 Observed top-level navigation

The archived header exposes this primary taxonomy:

- Flights
- Hotels
- Villas & Homestays
- Holiday Packages
- Trains
- Buses
- Cabs
- Tours & Attractions
- Visa
- Cruise (`new`)
- Forex Card & Currency
- Travel Insurance

Utility navigation: List Your Property, myBiz / business travel, My Trips,
Wishlist, Login / Create Account, country, language, currency.

Footer taxonomy (condensed): About, Investor Relations, Careers, Sustainability,
Legal, Corporate Travel, Product Offering, Top Hotels, Top International Hotels,
Quick Links (route pages), About the Site, Important Links.

### 2.2 TripNest sitemap (Phase 1–8 scope)

```
/                         Home
/flights                  Flight search landing
/flights/results          Flight results (query-string driven)
/flights/[id]             Flight review / booking summary (optional detail route)
/hotels                   Hotel search landing
/hotels/results           Hotel results (query-string driven)
/hotels/[slug]            Hotel detail: gallery, rooms, reviews, policies
/holidays                 Holiday packages listing
/holidays/[slug]          Holiday package detail
/trains                   Trains landing (static shell in this build)
/cabs                     Cabs landing (static shell in this build)
/offers                   All offers
/booking/review           Shared mock review step
/booking/confirmation     Mock confirmation (no payment)
/my-trips                 Static “my trips” mock
/wishlist                 Static wishlist mock
/info/[slug]              About, help, legal, accessibility, contact
```

### 2.3 Page-level intent

| Page             | Primary job                             | Key modules                                                                               |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Home             | Orient and start a search               | Hero, tabbed search widget, offers carousel, destinations, trending hotels, trust/FAQ     |
| Flights landing  | Capture route, dates, travellers, class | Search widget, fare calendar, offers, route inspiration, FAQ                              |
| Flight results   | Compare and narrow                      | Search summary, filter sidebar, sort tabs, result cards, details drawer, sticky fare bar  |
| Hotels landing   | Capture city, dates, rooms/guests       | Search widget, recent/popular cities, offers                                              |
| Hotel results    | Compare stays                           | Search summary, map/list toggle, filters, sort, hotel cards, pagination                   |
| Hotel detail     | Convince and select a room              | Gallery, overview, amenities, room cards, reviews, policies, sticky booking card          |
| Holidays listing | Browse packages                         | Destination/theme filters, package cards, price and duration                              |
| Holiday detail   | Explain the package                     | Hero, highlights, day-by-day itinerary, inclusions/exclusions, reviews, FAQs, booking CTA |
| Booking review   | Collect travellers and confirm price    | Itinerary, traveller form, contact form, add-ons, price summary, mock pay CTA             |
| Confirmation     | Reassure                                | Booking reference, itinerary, next steps, support, “no payment taken” notice              |

---

## 3. Layout and UI patterns

### 3.1 Header

**Observed**

- Two-tier desktop header:
  1. A colored brand strip with logo, quick utilities (List Your Property,
     myBiz, My Trips, Wishlist, login), country/language/currency.
  2. A white navigation row with icon + label items for each travel line.
- Header is sticky and gains a shadow/border on scroll.
- Login is a text affordance, not a separate page.
- Currency selector shows the active code (`INR`).
- Mobile collapses the taxonomy into a drawer/hamburger; the brand and login
  remain visible.

**TripNest decision**

- Deep-lagoon utility strip + white main nav.
- Utility strip hidden below `lg`; mobile uses a sheet with a 2-column nav grid.
- Login opens a static demo dialog; no authentication.
- Active route gets an underline and `aria-current="page"`.

### 3.2 Tabbed search widget

**Observed**

- Product tabs across the top: One Way / Round Trip / Multi City for flights;
  Hotels / Homestays / etc. for stays.
- A white elevated card overlaps the hero image.
- Flight fields: From, To, swap button, Departure, Return, Travellers & Class,
  Search.
- Hotel fields: City/area/property, Check-in, Check-out, Rooms & Guests, Search.
- Autocomplete for cities/airports, a calendar popover, and a traveller stepper.
- “Trending Searches” and “Recent Searches” sit under the widget.
- A best-fare/fare-calendar prompt appears under the route.
- Validation errors shake the relevant field and use inline messages.

**TripNest decision**

- One `SearchWidget` shell with a `mode` prop (`flights` | `hotels` | `holidays`).
- Desktop: single row of fields with a prominent search button.
- Mobile: stacked fields, sticky bottom search CTA.
- All state lives in URL search params on results pages.

### 3.3 Offers carousel

**Observed**

- “Offers” section with category tabs (All Offers, Flights, Hotels, Holidays,
  Trains, Cabs, Bus, Forex, Activities, Visa).
- Horizontally scrolling cards with an image/illustration, offer label, headline,
  supporting line, code, expiry, CTA, and T&C note.
- “View All” link; arrows on desktop; swipe on mobile.
- Cards are horizontally clipped and use a peek of the next card.

**TripNest decision**

- Embla carousel with category pills, keyboard arrows, drag, and
  `prefers-reduced-motion` fallback.
- Card anatomy: category badge, original headline, one-line detail, code chip,
  validity, CTA.

### 3.4 Filters sidebar (results)

**Observed / inferred**

- Left rail on desktop, drawer on mobile.
- Sections are collapsible with counts and clear-all.
- Flight filters: price range, stops, airlines, departure time, arrival time,
  duration, cabin/baggage, fare type, booking preference.
- Hotel filters: price, star rating, user rating, property type, locality,
  amenities, meal plan, payment options, cancellation policy.
- Applied filters appear as removable chips above results.

**TripNest decision**

- URL-serialized filter state (`?price=...&stops=...&airlines=...`).
- Desktop 280 px sticky rail; mobile bottom-sheet filter drawer.
- Range sliders use Radix; checkboxes are keyboard-accessible.
- Result count updates in an `aria-live="polite"` region.

### 3.5 Result cards

**Observed / inferred**

- Flight card: airline mark + name + flight number, departure/arrival times and
  airports, duration and stop label, price, fare type, badges, “View Details” and
  “Book Now”.
- Hotel card: image, name, star rating, locality, user rating + review count,
  amenities, price per night, taxes note, “View Rooms”.
- Holiday card: image, destination, duration, inclusions, rating, price, CTA.
- Cards use a white surface, 8–16 px radius, soft shadow, and a hover lift.

**TripNest decision**

- Presentational card components with typed props; no data fetching inside.
- Price is the visual anchor, right-aligned on desktop and bottom-row on mobile.
- Badges are limited to two per card to avoid noise.

### 3.6 Sticky bars

**Observed / inferred**

- Search summary stays reachable at the top of results.
- Mobile fare/room bar sticks to the bottom with price + primary CTA.
- Detail pages use a sticky booking card on desktop.

**TripNest decision**

- `position: sticky` summary bar below the header.
- Mobile bottom bar respects `safe-area-inset-bottom`.
- Sticky elements never cover the footer CTA; add scroll padding.

### 3.7 Detail drawer / modal

**Observed / inferred**

- Flight details open in a right-side drawer with itinerary, fare breakdown,
  baggage, cancellation, and fare-rule tabs.
- Hotel gallery opens a lightbox; filters open a sheet on mobile.
- Focus is trapped; Escape closes; background scroll locks.

**TripNest decision**

- Radix Dialog primitives styled as a right drawer and centered modal.
- One shared `Modal`/`Drawer` primitive in Phase 2.
- `data-lenis-prevent` on scrollable modal content.

### 3.8 Footer

**Observed**

- Dense, multi-column link farm with 6–8 groups, social links, app download,
  payment/security notes, and a long list of SEO route links.
- Very small type (10–12 px) and low visual weight.

**TripNest decision**

- Keep the multi-column structure but reduce link density and improve contrast.
- Use 14 px base in the footer, 12 px for legal.
- Include a clear “Learning project. Not affiliated with any travel brand.” note.
- Newsletter form is a demo; no data leaves the browser.

---

## 4. User flows

### 4.1 Flight search → results → filter/sort → review → mock checkout

```
Home / Flights
  → choose trip type (one way, round trip, multi-city)
  → pick origin + destination (autocomplete)
  → pick dates (calendar; return disabled for one way)
  → pick travellers + cabin class
  → Search
  → /flights/results?from=DEL&to=GOI&depart=...&return=...&pax=...&class=...
  → sort (cheapest / quickest / best)
  → filter (price, stops, airline, time, duration, baggage)
  → open flight details drawer
  → select fare
  → /booking/review (itinerary + traveller form + contact + add-ons)
  → price summary updates
  → “Pay” (mock) → /booking/confirmation
```

**Observed patterns:** trip-type tabs, swap button, autocomplete with airport
codes, “Tap to add a return date for bigger discounts”, traveller/class popover,
trending searches, fare calendar, filter + sort on results, fare comparison,
booking review, confirmation.

**TripNest decision:** no payment integration. The review step validates with Zod
and the confirmation page is generated from a signed-in-memory demo booking ID or
URL params. No PII is persisted.

### 4.2 Hotel search → results → detail → room → review → confirmation

```
Home / Hotels
  → city/area/property autocomplete
  → check-in / check-out
  → rooms & guests
  → Search
  → /hotels/results?city=...&checkin=...&checkout=...&rooms=...&guests=...
  → filter (price, star, rating, amenities, locality)
  → sort (recommended, price, rating)
  → hotel detail (gallery, rooms, reviews, policies)
  → choose room + meal plan
  → /booking/review
  → /booking/confirmation
```

### 4.3 Holiday package flow

```
/holidays
  → filter by destination, theme, duration, price
  → package detail
  → choose departure date + travellers
  → /booking/review
  → /booking/confirmation
```

### 4.4 Login / My Trips / Wishlist (mock)

- Login opens a dialog with email/phone and a “Continue” button.
- Submitting shows a demo notice; no session, cookie, or backend.
- My Trips and Wishlist are static pages with representative empty/filled states.
- Header reflects “Guest” after dismissal; no auth state is persisted.

---

## 5. Data entities and CSV schemas

All data is local CSV under `/data`. Files are read once in `lib/data` and cached
in a typed access layer. JSON-shaped columns are stored as JSON strings in CSV so
the database can later replace the loader without changing UI props.

### 5.1 `cities.csv`

| Field          | Type    | Example                                | Notes             |
| -------------- | ------- | -------------------------------------- | ----------------- |
| `id`           | string  | `goi`                                  | stable slug       |
| `name`         | string  | `Goa`                                  | display           |
| `region`       | string  | `North Goa`                            | area/state        |
| `country`      | string  | `India`                                |                   |
| `country_code` | string  | `IN`                                   | ISO-2             |
| `iata`         | string  | `GOI`                                  | airport/city code |
| `type`         | enum    | `city` / `beach` / `hill` / `heritage` | used for filters  |
| `latitude`     | number  | `15.2993`                              | map               |
| `longitude`    | number  | `74.1240`                              | map               |
| `image`        | string  | `/images/destination-goa.svg`          | local placeholder |
| `tagline`      | string  | `Susegad by the sea`                   | original copy     |
| `description`  | string  | …                                      | original copy     |
| `popular`      | boolean | `true`                                 | home rail         |
| `hotel_count`  | number  | `128`                                  | display           |

### 5.2 `flights.csv`

| Field              | Type    | Example                                    |
| ------------------ | ------- | ------------------------------------------ |
| `id`               | string  | `fl-001`                                   |
| `airline`          | string  | `Aeroline`                                 |
| `airline_code`     | string  | `AL`                                       |
| `flight_number`    | string  | `AL 204`                                   |
| `from_city_id`     | string  | `del`                                      |
| `to_city_id`       | string  | `goi`                                      |
| `departure_time`   | string  | `06:10`                                    |
| `arrival_time`     | string  | `08:25`                                    |
| `duration_minutes` | number  | `135`                                      |
| `stops`            | number  | `0`                                        |
| `stop_cities`      | string  | `[]` or `["BOM"]`                          |
| `price`            | number  | `5480`                                     |
| `currency`         | string  | `INR`                                      |
| `cabin_class`      | enum    | `economy` / `premium_economy` / `business` |
| `aircraft`         | string  | `A320neo`                                  |
| `baggage_cabin`    | string  | `7 kg`                                     |
| `baggage_checkin`  | string  | `15 kg`                                    |
| `refundable`       | boolean | `true`                                     |
| `seats_left`       | number  | `9`                                        |
| `on_time_percent`  | number  | `86`                                       |
| `fare_type`        | string  | `Saver` / `Flex`                           |
| `tags`             | string  | `["Fastest","Free cancellation"]`          |

### 5.3 `hotels.csv`

| Field                | Type        | Example                                                                                           |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `id`                 | string      | `ht-001`                                                                                          |
| `slug`               | string      | `the-salt-house-goa`                                                                              |
| `name`               | string      | `The Salt House`                                                                                  |
| `city_id`            | string      | `goi`                                                                                             |
| `area`               | string      | `Anjuna`                                                                                          |
| `property_type`      | enum        | `hotel` / `resort` / `villa` / `homestay`                                                         |
| `star_rating`        | number      | `4`                                                                                               |
| `user_rating`        | number      | `4.6`                                                                                             |
| `review_count`       | number      | `1284`                                                                                            |
| `price_per_night`    | number      | `6200`                                                                                            |
| `taxes`              | number      | `744`                                                                                             |
| `currency`           | string      | `INR`                                                                                             |
| `amenities`          | JSON string | `["Pool","Spa","Wi-Fi"]`                                                                          |
| `image`              | string      | `/images/hotel-salt-house.svg`                                                                    |
| `gallery`            | JSON string | `["…","…"]`                                                                                       |
| `description`        | string      | …                                                                                                 |
| `latitude`           | number      | `15.5735`                                                                                         |
| `longitude`          | number      | `73.7407`                                                                                         |
| `free_cancellation`  | boolean     | `true`                                                                                            |
| `breakfast_included` | boolean     | `true`                                                                                            |
| `rooms`              | JSON string | `[{ "id": "...", "name": "...", "price": 6200, "occupancy": 2, "bed": "King", "amenities": [] }]` |
| `reviews`            | JSON string | `[{ "author": "...", "rating": 5, "date": "...", "text": "..." }]`                                |
| `policies`           | JSON string | `{ "checkIn": "14:00", "checkOut": "11:00", ... }`                                                |

### 5.4 `offers.csv`

| Field            | Type    | Example                                                       |
| ---------------- | ------- | ------------------------------------------------------------- |
| `id`             | string  | `of-001`                                                      |
| `category`       | enum    | `all` / `flights` / `hotels` / `holidays` / `trains` / `cabs` |
| `eyebrow`        | string  | `Flights`                                                     |
| `title`          | string  | `Take the long way home`                                      |
| `description`    | string  | …                                                             |
| `code`           | string  | `NESTFLY`                                                     |
| `discount_label` | string  | `Up to 12% off`                                               |
| `image`          | string  | `/images/offer-flights.svg`                                   |
| `cta_label`      | string  | `Explore flights`                                             |
| `cta_href`       | string  | `/flights`                                                    |
| `valid_until`    | date    | `2026-12-31`                                                  |
| `terms`          | string  | …                                                             |
| `featured`       | boolean | `true`                                                        |

### 5.5 `holidays.csv`

| Field                 | Type        | Example                                           |
| --------------------- | ----------- | ------------------------------------------------- |
| `id`                  | string      | `ho-001`                                          |
| `slug`                | string      | `slow-goa-weekender`                              |
| `title`               | string      | `Slow Goa Weekender`                              |
| `destination_city_id` | string      | `goi`                                             |
| `country`             | string      | `India`                                           |
| `days`                | number      | `4`                                               |
| `nights`              | number      | `3`                                               |
| `price`               | number      | `18900`                                           |
| `currency`            | string      | `INR`                                             |
| `themes`              | JSON string | `["Beach","Food"]`                                |
| `rating`              | number      | `4.7`                                             |
| `review_count`        | number      | `86`                                              |
| `image`               | string      | `/images/holiday-goa.svg`                         |
| `gallery`             | JSON string | `["…"]`                                           |
| `summary`             | string      | …                                                 |
| `highlights`          | JSON string | `["…"]`                                           |
| `inclusions`          | JSON string | `["…"]`                                           |
| `exclusions`          | JSON string | `["…"]`                                           |
| `itinerary`           | JSON string | `[{ "day": 1, "title": "...", "detail": "..." }]` |
| `departure_dates`     | JSON string | `["2026-11-14", "2026-11-28"]`                    |

### 5.6 Derived API response shapes

```ts
type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets?: Record<string, { value: string; count: number }[]>;
};
```

Route handlers planned for Phase 3:

- `GET /api/flights?from=&to=&depart=&return=&pax=&cabin=&sort=&stops=&airlines=&priceMin=&priceMax=`
- `GET /api/hotels?city=&checkin=&checkout=&rooms=&guests=&sort=&stars=&rating=&amenities=&priceMin=&priceMax=`
- `GET /api/holidays?destination=&theme=&duration=&priceMin=&priceMax=&sort=`
- `GET /api/offers?category=`
- `GET /api/cities?q=`
- `GET /api/health`

All inputs validated with Zod; invalid input returns `400` with a typed error.

---

## 6. Design tokens (TripNest original palette)

The observed MMT palette uses a blue primary (`#008cff`), a blue gradient CTA,
4–8 px radii, Lato, and dense 10–14 px type. **TripNest deliberately diverges** to
avoid brand imitation and to create a calmer, more editorial travel feel.

### 6.1 Color

| Token        | Hex       | Use                          |
| ------------ | --------- | ---------------------------- |
| `brand-950`  | `#04211F` | deepest hero shade           |
| `brand-900`  | `#063B38` | hero gradient start          |
| `brand-800`  | `#0A4B47` | hero gradient mid            |
| `brand-700`  | `#0B5C57` | primary                      |
| `brand-600`  | `#0E6E68` | primary hover                |
| `brand-500`  | `#16857D` | links, focus                 |
| `brand-100`  | `#D9EFEA` | soft fills                   |
| `brand-50`   | `#EDF7F4` | tinted sections              |
| `accent-600` | `#E25536` | accent hover                 |
| `accent-500` | `#FF6B4A` | coral accent / CTA highlight |
| `accent-100` | `#FFE4DC` | accent tint                  |
| `gold-500`   | `#F2B544` | ratings, sun motif           |
| `ink`        | `#10201E` | primary text                 |
| `muted`      | `#5B6B67` | secondary text               |
| `line`       | `#DEE8E4` | borders                      |
| `canvas`     | `#F6FAF8` | page background              |
| `surface`    | `#FFFFFF` | cards, header                |
| `success`    | `#178A6B` | success                      |
| `warning`    | `#B7791F` | warning                      |
| `danger`     | `#C74444` | errors                       |

**Gradients**

- Hero: `linear-gradient(135deg, #04211F 0%, #063B38 45%, #0B5C57 100%)`
- Accent glow: `radial-gradient(circle at 70% 20%, rgba(255,107,74,0.35), transparent 55%)`
- Card sheen: `linear-gradient(180deg, rgba(255,255,255,0) 40%, rgba(4,33,31,0.72) 100%)`

### 6.2 Typography

| Role      | Family                        | Notes                               |
| --------- | ----------------------------- | ----------------------------------- |
| Display   | **Fraunces** (variable serif) | editorial headlines, package titles |
| UI / body | **Manrope** (variable sans)   | navigation, forms, cards, body      |

Scale (desktop → mobile): 64 → 40 display, 48 → 32 h1, 36 → 28 h2, 24 → 20 h3,
18 → 16 lead, 16 → 15 body, 14 → 13 small, 12 → 12 caption. Line heights:
display 1.02, headings 1.12, body 1.6. Tracking: display `-0.03em`, headings
`-0.02em`, UI `0`.

### 6.3 Spacing, radius, shadow

- Base spacing unit: `4px`; section rhythm: `64px` mobile / `96px` desktop.
- Container: `1280px` max, `16px` mobile / `24px` tablet / `32px` desktop gutters.
- Radius: `8px` (sm), `12px` (md), `16px` (lg), `24px` (xl), `999px` (pill).
- Shadows:
  - `xs`: `0 1px 2px rgba(16,32,30,0.06)`
  - `sm`: `0 4px 14px rgba(16,32,30,0.08)`
  - `md`: `0 12px 32px rgba(16,32,30,0.10)`
  - `lg`: `0 24px 64px rgba(16,32,30,0.14)`
  - `glow`: `0 18px 48px rgba(255,107,74,0.28)`

### 6.4 Motion

- Durations: `150ms` micro, `250ms` UI, `400ms` panels, `600ms` reveals.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo-ish).
- Animate only `transform` and `opacity`; never width/height/top.
- Scroll reveals: `whileInView`, `once: true`, `margin: "-80px"`.
- Reduced motion: Lenis disabled; all reveals render at rest; carousels still
  navigable without animation.

### 6.5 Iconography

- Lucide outline icons, `1.75px` stroke, 18–20 px in UI, 24 px in feature cards.
- Brand mark: custom “nest + horizon” SVG. No MMT sprite, logo, or photography.

---

## 7. Responsive behavior

Mobile-first breakpoints (Tailwind defaults + one extra):

| Name  | Min width | Behavior                                       |
| ----- | --------- | ---------------------------------------------- |
| `xs`  | 480px     | two-up chips, tighter card grid                |
| `sm`  | 640px     | 2-column destination grid                      |
| `md`  | 768px     | search fields 2-up; hotel cards horizontal     |
| `lg`  | 1024px    | desktop header, 3-column grids, filter sidebar |
| `xl`  | 1280px    | max container, 4-column offers                 |
| `2xl` | 1440px    | wider hero type, more whitespace               |

Key adaptations:

- **Header:** utility strip hidden < `lg`; hamburger sheet < `lg`; currency and
  login collapse into the sheet.
- **Search widget:** stacked fields < `md`; 2-up < `lg`; single row ≥ `lg`.
  Sticky bottom CTA on mobile results.
- **Results:** filters in a bottom sheet < `lg`; 280px sticky sidebar ≥ `lg`.
  Cards become vertical < `md`, horizontal ≥ `md`.
- **Detail pages:** gallery 1-up mobile, 2+1 mosaic ≥ `md`; sticky booking card
  only ≥ `lg`; mobile uses a bottom bar.
- **Footer:** accordion columns < `md`, 4-column grid ≥ `md`.
- **Touch:** 44px minimum targets; hover effects gated behind
  `@media (hover: hover)`; safe-area padding on sticky bars.

---

## 8. Observed content architecture (for Phase 4)

The archived homepage JSON exposes this card order:

1. Tertiary quick links (Where2Go, How2Go, travel card, MICE, gift cards,
   insurance, international flights)
2. Hotel cross-sell
3. Offers listing with categories (All, Flights, Hotels, Holidays, Trains, Cabs,
   Bus, Forex, Activities, Visa)
4. Flight brand store
5. Ad/brand store
6. Hotel pay-now block
7. Recent searches
8. Promotions
9. Static ad variant
10. App download
11. Trip ideas / handpicked collections
12. Top destinations

The flights landing page additionally exposes: trip-type tabs, From/To,
Departure/Return, Travellers & Class, “Book round trip for great savings”,
trending searches, recent searches, fare calendar, super offers, web check-in,
travel guidelines, and a long FAQ.

**TripNest Phase 4 order (decision):**

1. Hero + tabbed search
2. Trust strip
3. Offers carousel
4. Popular destinations
5. Trending hotels
6. Holiday ideas
7. “Why TripNest” / how it works
8. FAQ
9. Newsletter / app-style CTA

---

## 9. Copy and asset policy

- All TripNest copy is original. No MMT taglines, offer text, or FAQ answers are
  reused.
- No MMT logos, sprites, photography, or icon sheets are used.
- Destination/hotel/offer imagery will be original local SVG placeholders in
  Phase 1, replaced by licensed or generated placeholders later if desired.
- Airline names in seed data will be fictional (e.g., “Aeroline”, “Skylark”) to
  avoid implying real inventory.
- The footer states: “TripNest is a learning project. Not affiliated with any
  travel brand.”

---

## 10. Open questions / assumptions for review

1. **Brand direction:** deep lagoon + coral + editorial serif. If you prefer a
   warmer sand/terracotta palette, it can be swapped in `app/globals.css` without
   touching components.
2. **Market:** India-first (INR, Indian cities, domestic + international). The
   CSV seed will reflect that.
3. **Scope of trains/cabs:** static landing shells only; no search/results in the
   eight-phase plan unless requested.
4. **Checkout:** mock review + confirmation only; no payment, no auth, no PII
   persistence.
5. **Images:** local abstract SVGs in Phase 1; Phase 4 can add curated
   royalty-free photography if you want a more photographic feel.
