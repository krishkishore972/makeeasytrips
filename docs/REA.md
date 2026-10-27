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
/flights                  Flight search + results (query-string driven)
/flights/[id]             Flight detail with fare breakdown and review hand-off
/hotels                   Hotel landing + results (query-string driven)
/hotels/[id]              Hotel detail: gallery, amenities, rate plans, policies
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

**Implementation note (Phase 2):** the observed product uses separate `/results` URLs. TripNest
keeps search and results on one route because the search form is a native `GET` form and the
server renders results from the same search params. That removes a client-only redirect step and
keeps every result view shareable.

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

| Field            | Type    | Example                                               |
| ---------------- | ------- | ----------------------------------------------------- |
| `id`             | string  | `off-001`                                             |
| `category`       | enum    | `flights` / `hotels` / `holidays` / `trains` / `cabs` |
| `eyebrow`        | string  | `Flights`                                             |
| `title`          | string  | `First flight, lighter fare`                          |
| `description`    | string  | …                                                     |
| `code`           | string  | `NESTFLY`                                             |
| `discount_label` | string  | `Up to 12% off`                                       |
| `icon`           | enum    | `plane` / `bed` / `palmtree` / `train` / `car` …      |
| `tone`           | enum    | `coral` / `teal` / `gold`                             |
| `cta_label`      | string  | `Search flights`                                      |
| `cta_href`       | string  | `/flights`                                            |
| `valid_until`    | date    | `2027-03-31`                                          |
| `terms`          | string  | …                                                     |
| `featured`       | boolean | `true`                                                |

### 5.5 `holidays.csv`

| Field              | Type        | Example                                           |
| ------------------ | ----------- | ------------------------------------------------- |
| `id`               | string      | `holi-goi-susegad-sea`                            |
| `slug`             | string      | `susegad-by-the-sea`                              |
| `title`            | string      | `Susegad by the Sea`                              |
| `city_code`        | string      | `GOI`                                             |
| `country`          | string      | `India`                                           |
| `days`             | number      | `4`                                               |
| `nights`           | number      | `3`                                               |
| `price_per_person` | number      | `24500`                                           |
| `rating`           | number      | `4.7`                                             |
| `review_count`     | number      | `214`                                             |
| `image`            | string      | `/images/holidays/coast.svg`                      |
| `gallery`          | JSON string | `["…"]`                                           |
| `themes`           | pipe list   | `beach\|food`                                     |
| `summary`          | string      | …                                                 |
| `highlights`       | JSON string | `["…"]`                                           |
| `inclusions`       | JSON string | `["…"]`                                           |
| `exclusions`       | JSON string | `["…"]`                                           |
| `itinerary`        | JSON string | `[{ "day": 1, "title": "...", "detail": "..." }]` |
| `departure_dates`  | JSON string | `["2026-11-14", "2026-11-28"]`                    |
| `featured`         | boolean     | `true`                                            |

### 5.6 Derived API response shapes

```ts
type ListResponse<T> = {
  data: T[];
  meta: Record<string, unknown>;
};
```

Route handlers implemented across Phases 2 and 3:

- `GET /api/flights?from=&to=&depart=&return=&pax=&cabin=&sort=&stops=&airlines=&window=&duration=&refundable=`
- `GET /api/flights/[id]`
- `GET /api/hotels?city=&checkin=&checkout=&rooms=&guests=&sort=&stars=&rating=&amenities=&price=&breakfast=&cancel=`
- `GET /api/hotels/[id]`
- `GET /api/holidays?destination=&theme=&duration=&price=&sort=&travellers=`
- `GET /api/holidays/[slug]`
- `GET /api/offers?category=`
- `GET /api/cities?scope=`

All inputs are parsed with Zod; invalid input returns `400` with a typed error, and unknown ids or
slugs return `404`. Successful list responses use `{ data, meta }` and set `Cache-Control` headers.

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

## 8. Observed content architecture (Phase 4 input)

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

**TripNest Phase 4 order (implemented in §13):**

1. Hero + tabbed search
2. Trust strip
3. Offers carousel
4. Popular destinations
5. Trending stays
6. Holiday ideas carousel
7. “Why TripNest” / how it works
8. Field notes + newsletter
9. FAQ
10. Final call to action

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

---

## 11. Phase 2 implementation record (flights and hotels)

Phase 2 turns the URL-state foundation into working search, filter, sort, and detail flows backed
by local CSV data. It stays inside the Phase 1 design system; no observed brand assets or copy are
used.

### 11.1 Data layer

| File                  | Purpose                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `lib/data/csv.ts`     | Reads a CSV once, parses with PapaParse, validates rows with Zod, caches   |
| `lib/data/schemas.ts` | Zod row schemas and inferred row types                                     |
| `lib/data/cities.ts`  | `getCities`, `getCity`, `getFlightCities`, `getHotelCities`                |
| `lib/data/flights.ts` | Search, facets, sorting, detail lookup, route alternatives, popular routes |
| `lib/data/hotels.ts`  | Search, facets, featured stays, city stats, detail lookup                  |
| `lib/data/index.ts`   | Barrel for the public data helpers                                         |

The cached promise is per file, so concurrent Server Component and route-handler calls share one
parse. CSV values are coerced in the schema (numbers, booleans, JSON arrays) rather than in every
consumer.

| File               | Rows | Shape highlights                                                                |
| ------------------ | ---- | ------------------------------------------------------------------------------- |
| `data/cities.csv`  | 16   | `code,name,region,airport,tagline,hotels` (10 flight + 8 hotel cities)          |
| `data/flights.csv` | 540  | 10 cities, 90 directional routes, `fare_economy/premium/business`, stops, times |
| `data/hotels.csv`  | 32   | 8 cities × 4 stays, price/night, star and guest ratings, amenities, policies    |

Fictional carriers: Aravalli Air (`AV`), Coastal Wings (`CW`), Deccan Sky (`DS`), Himalaya Jet
(`HJ`), Kaveri Air (`KA`), Monsoon Air (`MA`). Stays are original names such as The Salt House,
Casa Susegad, and Lodhi Courtyard.

### 11.2 Query contract

Flight params: `from`, `to`, `depart`, `return`, `pax`, `cabin`, `sort`, `stops`, `airlines`,
`window`, `duration`, `refundable`.

Hotel params: `city`, `checkin`, `checkout`, `rooms`, `guests`, `sort`, `price`, `stars`,
`rating`, `amenities`, `breakfast`, `cancel`.

`lib/validation/search.ts` parses each param with Zod, clamps out-of-range values, applies
sensible defaults (dates default forward from today, one room, two guests, economy cabin), and
returns a typed query plus a human-readable error for genuinely invalid combinations (for
example, a return date before departure or a missing city). Invalid input renders an inline alert
with a reset link; it never throws.

### 11.3 Routes and APIs

- `/flights`: search form, popular routes when no route is chosen, results with filter sidebar,
  sort, active-filter chips, mobile filter drawer, empty states, and loading skeletons.
- `/flights/[id]`: itinerary, fare breakdown per traveller and in total, baggage and policy
  details, same-route alternatives, and a hand-off to the Phase 5 review flow.
- `/hotels`: search form, featured stays and city cards when no city is chosen, results with
  filters, sort, chips, drawer, empty states, and skeletons.
- `/hotels/[id]`: Embla gallery, amenities, two clearly labelled demo rate plans (Saver and
  Flex), policies, an illustrative location panel, other stays, and a sticky price summary.
- `/api/flights`, `/api/flights/[id]`, `/api/hotels`, `/api/hotels/[id]`, `/api/cities`: JSON
  responses, `400` with a typed error for invalid query input, `404` for unknown ids.

Both result pages call `await connection()` before reading dates so the partial prerender shell
can stream the URL-dependent part instead of failing at build time.

### 11.4 Pricing rules

Fares are per traveller; the results and detail pages multiply by `pax`. Stay totals multiply the
nightly rate by nights and rooms, then apply 12% tax up to ₹7,500 per night and 18% above it.
`lib/pricing.ts` is the single source for both breakdowns, so cards, detail panels, and APIs agree.

### 11.5 Interaction verification

Verified against the production build with a headless Chromium driven over CDP:

| Check                     | Result                                                                     |
| ------------------------- | -------------------------------------------------------------------------- |
| Hotel star filter         | URL gains `stars=5`, list narrows 4 → 1, chip “5-star” appears             |
| Hotel sort                | Keyboard change sets `sort=price-asc`; prices reorder ₹6,800 → ₹15,200     |
| Mobile filter drawer      | Opens with focus on close, applies `stars=5`, Escape restores focus/scroll |
| Duplicate DOM ids         | None; filter ids are scoped per instance (`useId`)                         |
| Booking notice dialog     | Opens from “Reserve this stay”, focus on close, Escape returns to trigger  |
| Hotel gallery             | Next/previous update `aria-live` “Image 2 of 3” and the active dot         |
| Flight non-stop filter    | `stops=0` on BOM→DEL narrows 6 → 4 and removes one-stop rows               |
| Combined flight filters   | `stops=0&airlines=AV` narrows to 2 flights                                 |
| Flight detail for two pax | Business total reflects two travellers                                     |
| APIs                      | `200` for valid queries, `400` for incomplete flight query, `404` unknown  |

Server responses were also checked with `curl` for `/flights`, filtered flight URLs,
`/flights/[id]`, `/hotels`, filtered hotel URLs, `/hotels/[id]`, and all five API routes.

### 11.6 Deliberate gaps

- No map/list toggle, pagination, or fare calendar yet; the catalogue is small enough to render
  in one list, and paging would add state without adding learning value at this size.
- Detail pages hand off to the shared review flow: “Choose this rate” and “Reserve this stay”
  open `/booking/review` rather than a fake payment step.
- Filters are applied on the server after a URL change, so results update in one round trip
  instead of client-side filtering.
- Hotel galleries use six original SVG scenes rotated per property; real photography remains out
  of scope.

### 11.7 Next.js 16 notes

- `cacheComponents: true` and `partialPrefetching: true` are enabled. `dynamicParams` is not
  compatible and is not used.
- URL-dependent server content sits inside `<Suspense>`; `usePathname()` consumers in the navbar
  and mobile nav are wrapped the same way so the shell can prerender.
- `error.tsx` uses the Next 16 `retry` prop.
- `await connection()` is the documented escape hatch for `new Date()` defaults during prerender.

---

## 12. Phase 3 implementation record (holidays, offers, and APIs)

Phase 3 adds the holiday catalogue, package detail pages, the offer board, and the remaining
list/detail APIs. It reuses the Phase 2 cached CSV layer, Zod parsing, URL-state hook, filter
primitives, and design tokens. All package names, itineraries, offer codes, dates, and prices are
original demo content.

### 12.1 Data layer

| File                       | Purpose                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| `lib/data/holidays.ts`     | Search, facets, destinations, city stats, featured, similar packages  |
| `lib/data/offers.ts`       | Category listing, featured offers, category counts                    |
| `lib/data/schemas.ts`      | `holidaySchema`, `offerSchema`, JSON-cell parsing, inferred row types |
| `lib/data/index.ts`        | Barrel updated to export both helpers                                 |
| `lib/pricing.ts`           | `holidayPriceBreakdown` for per-person totals with 5% demo tax        |
| `lib/validation/search.ts` | `parseHolidaySearchParams`, `parseOfferSearchParams`                  |

| File                | Rows | Shape highlights                                                                    |
| ------------------- | ---- | ----------------------------------------------------------------------------------- |
| `data/holidays.csv` | 12   | 10 destinations, 10 themes, 3 duration bands, 4 price bands, JSON itinerary/gallery |
| `data/offers.csv`   | 12   | 5 service categories, copyable codes, tones, icons, validity, terms, featured flag  |

CSV cells that hold lists use either JSON arrays (`gallery`, `highlights`, `inclusions`,
`exclusions`, `itinerary`, `departure_dates`) or a pipe-separated list (`themes`). The schema
parses both, so row-level validation still reports the exact file and row. The cached promise is
per file, so pages and APIs share one parse per process.

Six original SVG scenes were added under `public/images/holidays/` (`coast`, `backwaters`,
`heritage`, `mountains`, `desert`, `city`) and reused across packages.

### 12.2 Query contract

Holiday params: `destination`, `theme` (comma list), `duration` (comma list), `price` (comma
list), `sort`, `travellers`, `depart`.

- `destination`: three-letter city code, uppercased; an unknown shape produces an inline error.
- `theme`: `beach`, `backwaters`, `mountains`, `heritage`, `food`, `wellness`, `wildlife`, `city`,
  `adventure`, `craft`.
- `duration`: `short` (2–3 days), `medium` (4–5), `long` (6+).
- `price`: `under-20k`, `20k-35k`, `35k-50k`, `over-50k` per person.
- `sort`: `recommended`, `price-asc`, `price-desc`, `rating`, `duration`.
- `travellers`: integer 1–9, default 2.
- `depart`: used on the detail page to preselect a departure when it matches the package list.

Offer params: `category` (`all`, `flights`, `hotels`, `holidays`, `trains`, `cabs`). Unknown values
render a warning and fall back to `all`; the API returns `400`.

Facets are computed from the destination-scoped catalogue, so counts stay meaningful when a
destination is selected. Theme filters use OR within the theme group and AND across groups.

### 12.3 Routes and APIs

- `/holidays`: search form, featured strip, destination cards with counts and starting prices,
  theme/length/budget filters, sort, active chips, mobile drawer, empty states, and skeletons.
- `/holidays/[slug]`: illustrated gallery, trip overview, highlights, day-by-day itinerary,
  inclusions/exclusions, plain-language notes, departure picker, traveller stepper, live price
  breakdown, review hand-off, and similar packages scored by shared city and themes.
- `/offers`: category tabs with counts, featured offer banner, copyable codes with `aria-live`
  feedback, validity, expandable terms, CTA links, invalid-category warning, and skeletons.
- `/api/holidays`, `/api/holidays/[slug]`, `/api/offers`: JSON responses with `{ data, meta }`,
  `Cache-Control`, `400` for invalid input, and `404` for unknown slugs.

### 12.4 Pricing rules

Holiday prices are per person on twin sharing. The demo total multiplies by `travellers`, then
adds a flat 5% tax and fee. `holidayPriceBreakdown` is shared by cards, the detail panel, and both
holiday APIs, so every surface agrees. No single supplement, child rate, or real availability is
modelled.

### 12.5 Interaction verification

Verified against the production build with a headless Chromium driven over CDP (41 checks):

| Check                  | Result                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| Holiday catalogue      | 12 cards, featured strip, and 10 destination cards render              |
| Theme filter           | `theme=beach` narrows 12 → 3; an active chip appears                   |
| Combined filters       | `theme=beach&price=under-20k` narrows to 1 package                     |
| Sort                   | `sort=price-asc` persists in the URL and reorders results              |
| Reset                  | Clears theme/price and restores 12 cards                               |
| Mobile filter drawer   | Opens, applies `theme=heritage` (5 results), closes via “Show results” |
| Holiday detail         | Itinerary, gallery, similar packages, and their own city names render  |
| Traveller stepper      | Total moves ₹51,450 → ₹77,175 as travellers go 2 → 3                   |
| Departure picker       | Selecting 5 Dec 2026 updates the summary and `aria-pressed` state      |
| Booking hand-off       | Opens the shared review step from “Reserve this holiday”               |
| Offer board            | 12 offers render; featured banner and category counts are correct      |
| Offer category tab     | `category=flights` narrows to 3 offers and marks the active tab        |
| Invalid offer category | Warning appears and the board falls back to all 12 offers              |
| Copy code              | Clipboard feedback announces “Offer code copied”                       |
| Mobile offers          | No horizontal overflow at 390px; all six category tabs remain usable   |
| Console / network      | No console errors and no failed requests during the run                |

Server responses were checked with `curl` for `/holidays`, filtered holiday URLs,
`/holidays/[slug]`, `/offers`, `/offers?category=flights`, and all three new API routes, including
`400` for invalid destination/category and `404` for an unknown holiday slug.

### 12.6 Deliberate gaps

- Holiday and offer catalogues are deliberately small and rendered in one list; there is no
  pagination, infinite scroll, or fare calendar at this size.
- “Similar packages” is a deterministic score over shared city and themes, not a recommendation
  model.
- Offers are a board, not a checkout: codes are copied but never applied, and there is no offer
  detail route.
- Trains and cabs remain static shells, so their offers link to those shells.
- Because detail content streams inside `<Suspense>`, an unknown slug renders the custom
  not-found UI with HTTP `200` after the shell has flushed (the same behaviour as the Phase 2
  flight and hotel details). The JSON APIs still return `404`.
- Booking is a mock review and confirmation flow only; no payment, account, inventory hold, or
  persistence exists.

### 12.7 Next.js 16 notes

- The Phase 3 routes follow the same PPR pattern: URL-dependent content is wrapped in
  `<Suspense>`, and `await connection()` runs before reading search params or date defaults.
- New loading routes (`/holidays`, `/holidays/[slug]`, `/offers`) reuse the skeleton components.
- `generateMetadata` for holiday details runs independently of the streamed page and returns a
  safe fallback title for unknown slugs.

---

## 13. Phase 4 implementation record (home and editorial polish)

Phase 4 replaces the foundation home preview with a catalogue-driven composition. The page keeps
the Phase 1 hero and search widget, then adds an editorial sequence built from the same cached CSV
data as the search pages. All copy, package names, offer codes, and imagery remain original demo
content.

### 13.1 Composition order

1. Hero with catalogue counts and links into the current edit
2. Tabbed GET search widget
3. Trust strip
4. Offers carousel (six offers, one from each travel line where possible)
5. Curated destination cards (five city codes)
6. Trending stays (four guest-favourite stays)
7. Holiday ideas carousel (four featured packages)
8. How it works
9. Field notes and newsletter
10. FAQ
11. Final call to action

The home page is a static Server Component at build time. It reads the cached CSV layer through
`getHomePageData()` and needs no `connection()` because it does not depend on search params or
the current date.

### 13.2 Data composition

| File                  | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `lib/data/home.ts`    | `getHomePageData`, curated destination codes, stays, holidays, and offers |
| `lib/home-content.ts` | Original FAQ answers and three field notes                                |

`getHomePageData()` returns destinations, stays, holidays, offers, and catalogue counts. The
destination list is deliberately curated (`UDR`, `GOI`, `IXL`, `COK`, `JAI`) rather than sorted
alphabetically, so the opening screen mixes lakes, coast, mountains, backwaters, and heritage.
Each destination uses its most relevant featured package, city stats, and an original SVG scene.

Offers are selected with a category-first pass, then filled from the remaining list. That keeps
the home carousel from being all flights simply because the CSV is ordered that way. Stays and
holidays use the existing featured helpers and sort by rating.

Hero counts are derived from the catalogue (`16` cities, `32` stays, `12` holidays) instead of the
earlier hardcoded `60+` and `1,200+` claims.

### 13.3 Components and interaction

| Component                               | Role                                                              |
| --------------------------------------- | ----------------------------------------------------------------- |
| `components/shared/carousel.tsx`        | Embla carousel with prev/next controls and a polite slide counter |
| `components/home/destination-card.tsx`  | Image-led destination card with count and starting price          |
| `components/home/stay-card.tsx`         | Compact featured-stay card with rating and nightly price          |
| `components/home/faq.tsx`               | Native `<details>` disclosures for the home FAQ                   |
| `components/home/travel-notes.tsx`      | Three field-note cards linking to valid holiday themes            |
| `components/home/hero-search.tsx`       | Existing tabbed search widget, unchanged                          |
| `components/offers/offer-card.tsx`      | Reused inside the home offers carousel                            |
| `components/holidays/holiday-card.tsx`  | Reused inside the home holiday carousel                           |
| `components/layout/newsletter-form.tsx` | Existing demo newsletter form, reused in the field-notes panel    |

The carousel renders every slide in the server HTML, so links and prices are readable without
JavaScript. Controls are 44px targets, the selected slide is announced through
`aria-live="polite"`, and `useReducedMotion()` sets the Embla duration to zero. Embla's initial
state is synced after `requestAnimationFrame` so the effect does not trigger a cascading render.

The FAQ uses native disclosures rather than a custom accordion: keyboard behaviour, focus, and
`open` state come from the browser. The newsletter form stays a client leaf and confirms that no
email was stored or sent.

### 13.4 Link and content corrections

The foundation home linked destinations with display names (`?destination=udaipur`) and used
`theme=mountain`. Phase 4 replaces those with catalogue codes and enum values:

- Destinations: `/holidays?destination=UDR`, `GOI`, `IXL`, `COK`, `JAI`
- Themes: `beach`, `mountains`, `heritage`, `food`, plus field-note links to `wellness` and `city`

All 33 internal links rendered on the home page were fetched during verification and returned a
status below `400`.

### 13.5 Interaction verification

Verified against the production build with headless Chromium over CDP (27 checks):

| Check                       | Result                                                                      |
| --------------------------- | --------------------------------------------------------------------------- |
| Hero heading and counts     | Correct heading; derived counts render as `16`, `32`, and `12`              |
| Section order               | Eleven sections appear in the planned order                                 |
| Destination and theme links | City codes and valid theme values only                                      |
| Carousels                   | Two carousels, 10 slides server-rendered, counters start at 1 / 6 and 1 / 4 |
| Carousel controls           | Previous disabled at start; next advances to 2 / 6                          |
| FAQ                         | Opens on click and shows the demo answer                                    |
| Newsletter                  | Submits to the demo confirmation state                                      |
| Internal links              | All 33 home links respond below 400                                         |
| Mobile layout               | No horizontal overflow at 390px; one full slide visible and scrollable      |
| Reduced motion              | Reveals are visible; carousel advances without a tween                      |
| Console / network           | No console errors and no failed requests                                    |

`curl` checks confirmed `200` for each destination and theme link, and confirmed the destination
filters actually return the expected package (`UDR` → Lake City in Three Acts, `IXL` → High Desert,
`COK` → Backwater Houseboat Drift, `JAI` → Fort and Courtyard Loop). Theme checks confirmed
`mountains`, `wellness`, and `city` return matching packages.

### 13.6 Deliberate gaps

- The home edit is curated in code, not managed by a CMS. Changing the five destination cards
  means editing `HOME_DESTINATION_CODES`.
- Carousels do not autoplay. Explicit controls are easier to understand, kinder to reduced-motion
  users, and keep the page calm.
- The FAQ is static editorial content, not searchable and not connected to the support pages.
- Field notes are short teasers; there is no article route behind them. They link into filtered
  holiday results instead.
- Offers are still a board, not an applied discount, and the newsletter remains a demo form.

### 13.7 Next.js 16 notes

- The home route stays static (`○ /`) because all data comes from cached CSVs at build time.
- Server-rendered carousel slides avoid a client-only empty state; hydration only adds the Embla
  behaviour and control state.
- The carousel's initial sync runs in `requestAnimationFrame`; calling `setState` directly in the
  effect body tripped the React hooks lint rule and caused an unnecessary render.
- `data-carousel-status` is a small test hook on the visible counter; it does not change the
  accessible announcement.

---

## 14. Phase 5 implementation record (mock booking review and confirmation)

Phase 5 adds the shared review and confirmation flow for flights, stays, and holidays. The scope
is deliberately narrow: no payment, no account, no inventory hold, and no stored personal data.
A booking is a **linkable selection**, not a record. Both routes rebuild everything from the URL
and the cached CSV catalogue, so refreshing, bookmarking, or sharing a link produces the same
result without a database.

### 14.1 Routes and query contract

| Route                   | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `/booking/review`       | Shared review step for a flight, stay, or holiday selection   |
| `/booking/confirmation` | Demo reference, summary, and next steps after acknowledgement |

Both routes are `noindex, nofollow` and render a friendly recovery state instead of a `404` when
a link is incomplete, unknown, or stale.

| Type      | Required params                                                                              |
| --------- | -------------------------------------------------------------------------------------------- |
| `flight`  | `type`, `id`, `depart`, `pax` (1–9), `cabin`                                                 |
| `hotel`   | `type`, `id`, `checkin`, `checkout`, `rooms` (1–4), `guests` (1–12), `plan` (`saver`/`flex`) |
| `holiday` | `type`, `slug`, `depart`, `travellers` (1–9)                                                 |

`confirmed=1` is required on the confirmation route. The review form adds `acknowledge=1` as a
required checkbox. Without `confirmed=1`, a confirmation link shows “Confirm your demo booking
first.” and links back to the review step, so the confirmation cannot be reached by editing a URL
alone.

### 14.2 Validation, resolution, and pricing

| File                        | Purpose                                                                     |
| --------------------------- | --------------------------------------------------------------------------- |
| `lib/validation/booking.ts` | Zod discriminated union, friendly per-field messages, date-order refinement |
| `lib/booking.ts`            | Selection resolver, summary model, deterministic reference, review links    |

`parseBookingParams` never throws. It returns `{ selection, error }`, and the error text is
written for a traveller rather than a developer (“Check-out needs to be after check-in.”). The
hotel branch uses `superRefine` to reject a check-out that is not after check-in; the holiday
branch re-checks the date against the package's `departure_dates` during resolution.

`resolveBooking` loads the product through the existing cached helpers and reuses the Phase 2–3
pricing functions, so the review total always matches the detail page:

- Flights: `flightFareBreakdown(fare, pax)`
- Stays: `hotelStayBreakdown(perNight, nights, rooms, tax)`, where Flex adds ₹900 per night
- Holidays: `holidayPriceBreakdown(pricePerPerson, travellers)` with 5% demo tax

References are derived, not stored: an FNV-1a hash of the canonical (sorted) selection params,
rendered as `TN-FL-…`, `TN-ST-…`, or `TN-HL-…`. The same URL always produces the same reference.
Verified examples: `TN-FL-WIB38P`, `TN-ST-D2OUQS`, `TN-HL-NOEMDR`.

### 14.3 Components and interaction

| Component                                    | Role                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `components/booking/booking-progress.tsx`    | Three-step indicator with `aria-current="step"`                   |
| `components/booking/booking-summary.tsx`     | Shared selection card and price panel                             |
| `components/booking/booking-confirm.tsx`     | Native GET form with hidden params and a required acknowledgement |
| `components/booking/booking-empty-state.tsx` | Recovery state with browse links                                  |
| `components/booking/booking-skeletons.tsx`   | Streaming fallback for both routes                                |

The acknowledgement form is a plain HTML `GET` form, not a Server Action. That keeps the flow
stateless, makes the confirmation link shareable, and means the app needs no mutation endpoint.
It collects only hidden selection params plus the checkbox; there are no name, email, phone, or
payment fields anywhere in the flow.

Hand-offs were added at the three product surfaces and the old `BookingNoticeDialog` was removed:

- Flight detail: “Continue with this fare” → `/booking/review?type=flight…`
- Hotel rate plans and price aside: “Choose this rate” / “Reserve this stay” → `type=hotel…`
- Holiday booking panel: “Reserve this holiday” → `type=holiday…` (disabled until a departure is chosen)

### 14.4 Copy and documentation corrections

Phase 5 made the earlier “arrives in Phase 5” copy inaccurate, so it was updated across the app:
the home FAQ, help centre, cancellation guide, payment page, my-trips page, wishlist links,
flight return-leg note, holiday FAQ, and the README. Trains and cabs remain static shells and say
so. The README now documents the booking params, example URLs, and verification commands.

### 14.5 Verification

Verified against the production build with headless Chromium over CDP (41 checks, all passing):

| Check                | Result                                                       |
| -------------------- | ------------------------------------------------------------ |
| Hand-off links       | All three product types carry the correct selection params   |
| Review content       | Route, dates, plan, inclusions, and totals render correctly  |
| Personal-data inputs | Only `hidden` and `checkbox` inputs exist in the review form |
| Acknowledgement      | Checkbox is `required`; submitting reaches confirmation      |
| References           | `TN-FL-…`, `TN-ST-…`, `TN-HL-…`; stable across reloads       |
| Totals               | ₹7,400 flight, ₹91,568 hotel Flex, ₹77,175 holiday           |
| Guard                | Unconfirmed confirmation link shows the review prompt        |
| Invalid states       | Bad dates, unknown type, and missing product recover cleanly |
| Metadata             | Both routes are `noindex, nofollow`                          |
| Mobile               | No horizontal overflow at 390px on either route              |
| Console / network    | No console errors and no failed requests                     |

`curl` checks confirmed `200` responses and the expected copy for all three types, the unconfirmed
guard, reversed hotel dates, an unknown booking type, and a missing flight id. The booking SVG was
parsed to confirm it is well-formed and served with a `200`.

### 14.6 Deliberate gaps

- Nothing is persisted. The reference is a hash of the URL, not a reservation, and there is no
  “my trips” record to return to.
- No traveller details are collected, so the confirmation cannot show passenger or guest names.
- No payment, cancellation, refund, or inventory hold exists, and the confirmation page says so.
- Return-leg flight selection and combined fares are still not modelled; the flight flow books a
  single outbound fare.
- Holiday departures must match the package's published demo dates; arbitrary dates are rejected.
- Offers are not applied to booking totals; they remain a browsable board.

### 14.7 Next.js 16 notes

- Both booking routes build as partial prerenders (`◐`): a static shell plus a streamed
  search-param-dependent section.
- Reading `searchParams` happens after `await connection()` inside `<Suspense>`, which is required
  with `cacheComponents` and keeps the static shell cacheable.
- The native `GET` form avoids a Server Action and keeps the confirmation URL reproducible; no
  route handler or mutation layer was added.
- `robots: { index: false, follow: false }` is set per route because these pages are meaningless
  without a selection.
- `bookingConfirmationHref` exists as a helper for future links but is intentionally unused while
  confirmation requires the acknowledgement form.
