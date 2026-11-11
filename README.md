# Makeasytrips

Makeasytrips is an original, learning-purpose travel experience inspired by the structure and
flows of modern travel-booking products. It is **not** affiliated with, endorsed by, or
connected to any travel brand. There are no real bookings, payments, or customer accounts.
Enquiries, contact messages, and newsletter sign-ups are stored so the team can follow up, and a
single admin account protects the content dashboard. Catalogue photography is stored in Cloudinary.

The project is being built in phases. **Phases 1 (foundation), 2 (flights and hotels), 3
(holidays, offers, and APIs), 4 (home and editorial polish), 5 (mock booking review and
confirmation), 6 (quality pass: tests, accessibility, and performance), 7 (rent a car), 8
(enquiries, newsletter, and contact persistence), 9 (admin authentication and protected shell),
10 (enquiry stats dashboard), and 11 (Cloudinary media foundation) are complete.**

## What is in this build

- Next.js App Router with React Server Components by default and small client leaves
- TypeScript in strict mode with Zod for environment validation and catalogue row validation
- Tailwind CSS v4 theme with an original lagoon-teal, coral, and gold palette
- Fraunces display serif and Manrope UI sans via `next/font`
- Lenis smooth scrolling with `prefers-reduced-motion` support
- Motion (Framer Motion) shared variants, scroll reveals, and reduced-motion handling
- Responsive two-tier navbar, mobile navigation sheet, and footer
- Full home composition: hero with catalogue counts, tabbed GET search widget, trust strip,
  offer and holiday carousels, curated destinations, trending stays, featured self-drive cars,
  how-it-works, field notes, newsletter, FAQ, and a final call to action
- A typed, cached MongoDB data layer with 16 cities, 540 flights, 32 stays, 12 holidays, 12 offers,
  and 62 self-drive cars
- Flight search and results: route/date/traveller form, filters, sorting, active-filter chips,
  result cards, and a detail page with fare breakdown and a WhatsApp enquiry
- Hotel search and results: city/date/room form, filters, sorting, result cards, a landing page
  with featured stays, and a detail page with gallery, amenities, rate plans, and policies
- Rent a car (self-drive): city and pick-up/drop-off search, Daily Drives / Subscription /
  Weekday Pass plans, filters for budget, body style, transmission, fuel, seats, rating, model
  year, distance, FASTag, and delivery, plus detail pages with kilometre plans, add-ons, host
  details, policies, and a live price panel
- Holiday catalogue: destination-led browsing, theme/length/budget filters, sorting, featured and
  destination strips, and package detail pages with gallery, day-by-day itinerary, inclusions,
  departure picker, live demo totals, and similar packages
- Persisted lead capture: service enquiries, newsletter sign-ups, and contact messages are
  validated with Zod and written to MongoDB; enquiries still open a pre-filled WhatsApp message
- Contact page form for name, email, optional phone, and message, with inline validation and a
  saved-state confirmation
- Admin-only authentication: a single environment-configured account, scrypt password hash,
  eight-hour HS256 JWT in an HttpOnly cookie, optimistic proxy gate, and a protected `/admin`
  shell. Public visitors still browse without an account
- Live admin stats: range-filtered enquiry totals, new-lead count, newsletter and contact totals,
  a 30-day trend, service and status splits, the top 10 enquired items, and the latest leads, all
  read directly from MongoDB. Enquiries now store the catalogue item id and detail-page path so
  repeat interest groups correctly
- Protected enquiry management at `/admin/enquiries`: uncached, paginated search with service,
  status, and India-time date filters; enquiry details and audited new/contacted/closed status updates.
  Older enquiries without a status are treated as new.
- Cloudinary uploads in catalogue editors: server-signed uploads, 5 MB raster-only validation
  by magic bytes, per-catalogue folders, delivery URLs with `f_auto,q_auto`, and an append-only
  audit log. The API secret never reaches the browser
- Admin catalogue editors at `/admin/hotels`, `/admin/holidays`, `/admin/cars`, and `/admin/offers`
  create and edit records with audited saves and public catalogue cache invalidation. Editors accept
  one main image and up to four additional Cloudinary uploads; existing image URLs remain usable.
  Offer artwork is optional, with its icon and tone as a fallback. Removing a photo from a record
  does not delete the Cloudinary asset. Public cards use the main image; additional photos are
  shown in the hotel, holiday and car detail galleries and on offer cards.
- Admins can delete a listing from its editor after confirmation. Its unshared Cloudinary photos
  in managed upload folders are deleted too; photos still used by another listing are retained.
  Cloudinary and MongoDB cannot be deleted atomically, so a failed operation can leave the listing
  in place with some photos already removed; retry the deletion in that case.
- Route-group split between the public site shell and the admin shell, plus `/admin` noindex and
  a `robots.txt` disallow rule
- Offer board: category tabs with counts, a featured banner, copyable demo codes, validity dates,
  and expandable terms
- JSON APIs at `/api/flights`, `/api/hotels`, `/api/holidays`, `/api/cars`, `/api/offers`,
  `/api/cities`, `/api/enquiries`, `/api/newsletter`, and `/api/contact`, validated with Zod
- Flights and trains stay in the codebase and remain routable, but are no longer linked from the
  navigation, home page, offers, or enquiry flow
- Editorial and legal information pages
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
npm test
npm run format:check
npm run build
npm run start
```

`npm run verify` runs the first five in order.

## Routes

| Route                  | State                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `/`                    | Full home composition with data-driven carousels, destinations, stays, and FAQ          |
| `/flights`             | Flight search, URL-driven results, filters, sorting, and empty states                   |
| `/flights/[id]`        | Flight detail with fare breakdown and WhatsApp enquiry form                             |
| `/hotels`              | Hotel landing, URL-driven results, filters, sorting, and featured stays                 |
| `/hotels/[id]`         | Hotel detail: gallery, amenities, rate plans, policies, location, price box             |
| `/rent-a-car`          | Self-drive landing: hero search, rental plans, featured cars, body styles, cities, FAQ  |
| `/rent-a-car/search`   | URL-driven car results with filters, sorting, plan tabs, and empty states               |
| `/rent-a-car/[id]`     | Car detail: specs, kilometre plans, add-ons, host, policies, reviews, price panel       |
| `/holidays`            | Holiday catalogue: destination strip, theme/length/budget filters, sort, featured trips |
| `/holidays/[slug]`     | Package detail: gallery, itinerary, inclusions, departure picker, live total, similar   |
| `/trains`, `/flights`  | Retained routes, hidden from the navigation and offers in this phase                    |
| `/cabs`                | Permanent redirect to `/rent-a-car`                                                     |
| `/offers`              | Offer board with category tabs, featured offer, copyable codes, and terms               |
| `/info/[slug]`         | About, how-it-works, help, legal, accessibility, disclaimer, and contact form           |
| `/admin`               | Protected admin overview; unauthenticated requests redirect to sign-in                  |
| `/admin/login`         | Single admin email/password sign-in; public visitors never need an account              |
| `/api/admin/uploads`   | Session- and origin-protected `POST` upload; JSON only, never cached                    |
| `/api/flights`         | JSON search API (query validation, `400` on invalid input)                              |
| `/api/flights/[id]`    | JSON flight detail (`404` when unknown)                                                 |
| `/api/hotels`          | JSON hotel search API                                                                   |
| `/api/hotels/[id]`     | JSON hotel detail with the stay price breakdown                                         |
| `/api/holidays`        | JSON holiday search API with per-person and traveller totals                            |
| `/api/holidays/[slug]` | JSON holiday detail with itinerary and price breakdown                                  |
| `/api/cars`            | JSON car search API with plan and rental-window validation                              |
| `/api/cars/[id]`       | JSON car detail with the rental price breakdown                                         |
| `/api/offers`          | JSON offer list, category filter, and category counts                                   |
| `/api/cities`          | City list, optionally scoped to `flights` or `hotels`                                   |
| `/api/enquiries`       | `POST` an enquiry, validated and saved; `201` with the record id                        |
| `/api/newsletter`      | `POST` an email, saved once per address; duplicate sign-ups stay idempotent             |
| `/api/contact`         | `POST` a contact message, validated and saved; `201` with the record id                 |

Search and filter state lives entirely in URL search params, so every results view is linkable
and the server renders the matching set:

- Flights: `from`, `to`, `depart`, `return`, `pax`, `cabin`, `sort`, `stops`, `airlines`,
  `window`, `duration`, `refundable`
- Hotels: `city`, `checkin`, `checkout`, `rooms`, `guests`, `sort`, `price`, `stars`, `rating`,
  `amenities`, `breakfast`, `cancel`
- Holidays: `destination`, `theme`, `duration`, `price`, `sort`, `travellers`, `depart`
- Rent a car: `city`, `start`, `end`, `mode` (`daily`, `subscription`, `weekday`), `sort`,
  `budget`, `type`, `transmission`, `fuel`, `seats`, `rating`, `year`, `distance`, `fastag`,
  `delivery`
- Offers: `category` (`all`, `hotels`, `holidays`, `cars`)
- Enquiries: each service detail page opens a WhatsApp form for name, phone number, and enquiry
  details, with the selected service context pre-filled.

Example:

```text
/flights?from=BOM&to=GOI&depart=2026-11-13&pax=2&cabin=economy&stops=0
/hotels?city=GOI&checkin=2026-11-13&checkout=2026-11-17&rooms=1&guests=2&stars=5
/rent-a-car/search?city=GOI&start=2026-11-13T10:00&end=2026-11-15T10:00&mode=daily&transmission=Automatic
/holidays?destination=GOI&theme=beach,food&duration=short&price=under-20k&travellers=3
/offers?category=holidays
```

## Structure

```text
app/                  Root layout, providers, global styles, robots
  (site)/             Public route group with the navbar and footer shell
    flights/          Retained search/results and detail pages (hidden from navigation)
    holidays/         Catalogue page, package detail, loading skeletons
    hotels/           Landing/results page, detail page, loading skeletons
    info/             Editorial and legal pages, including the contact form
    rent-a-car/       Self-drive landing, search/results, detail, loading skeletons
    offers/           Offer board and loading skeleton
  admin/              Sign-in page, protected dashboard shell, and media workspace
  api/                JSON route handlers: catalogue reads, lead writes, and admin uploads
components/
  admin/              Admin shell, navigation, live stats, media workspace, form controls
  cars/               Search form, filters, cards, gallery, enquiry panel, skeletons
  enquiry/            Shared WhatsApp enquiry dialog and saved-state feedback
  flights/            Search form, filters, cards, popular routes, skeletons
  holidays/           Search form, filters, cards, gallery, itinerary, enquiry panel, skeletons
  home/               Home search widget, destination/stay cards, FAQ, field notes
  hotels/             Search form, filters, cards, gallery, skeletons
  info/               Contact form for the contact page
  layout/             Navbar, mobile nav, footer, newsletter
  offers/             Offer card, category tabs, copy-code button, icon mapper, skeletons
  providers/          Motion and Lenis providers
  search/             Shared filter group, flag, sort, drawer, chips, URL hook
  shared/             Logo, breadcrumbs, rating, amenities, empty state, reveals, carousel
  ui/                 Small primitives (buttons, dialogs, popovers, selects)
data/                 JSON seed fixtures: cities, flights, hotels, holidays, cars, offers
docs/REA.md           Reverse-engineering notes, evidence, and design decisions
docs/rent-a-car.md    Rent-a-car routes, data, pricing, plans, and deliberate gaps
hooks/                Small client hooks (scroll state, media query)
lib/
  admin/              JWT, scrypt password check, session, rate limit, stats, Cloudinary, audit
  enquiry.ts          Enquiry form schema, WhatsApp message builder, and number config
  data/               Cached MongoDB collection loader, Zod schemas, query and facet helpers
  models/             Mongoose models for catalogues plus enquiries, subscribers, and contact
  mongodb.ts          Cached Mongoose connection
  validation/         URL search-param and lead-form parsing with Zod
  pricing.ts          Fare, stay, holiday, and car-rental totals with tax bands
  search-options.ts   Filter, sort, cabin, amenity, holiday, car, and offer option tables
  dates.ts            Date parsing, labels, night counts, and rental windows
  home-content.ts     Original home FAQ and field-note copy
public/images/        Original abstract SVG placeholders, including six car body styles
scripts/              MongoDB seed and enquiry backfill, axe-core accessibility, lab performance audits
tests/                Vitest suites for dates, pricing, validation, leads, admin auth, stats, and data
types/                Shared TypeScript types
vitest.config.ts      Vitest config with the @ alias and Mongo fixture mock
proxy.ts              Optimistic /admin gate that checks the JWT before rendering
```

## Data layer

Catalogue reads come from MongoDB. `lib/data/mongo.ts` loads each collection once per server
process, validates every document with the same Zod schemas the app uses, strips internal fields,
and caches the typed promise. Server Components and the API route handlers share the same helpers,
so there is no second source of truth.

The catalogue is read-only from the app. Three separate collections accept writes from the lead
forms: `enquiries`, `newsletter_subscribers`, and `contact_messages`. Their route handlers call
`dbConnect()` directly and let Mongoose create the documents, so the catalogue cache is never
involved in a write.

### MongoDB setup

```bash
# .env.local
MONGODB_URI=mongodb+srv://...
MONGODB_DB=tripnest

npm run db:seed        # validate the JSON fixtures, then upsert every row
npm run db:seed:fresh  # clear the six catalogue collections first, then seed
```

The seed fixtures in `data/*.json` are the authored catalogue. The seed script validates them with
Zod before writing, so the database cannot drift from the TypeScript contract. Each document also
stores a private `sort_order` so the original authoring order survives; reads sort by it and
project it back out.

Because collection reads are cached per process, restart the dev server after re-seeding to pick up
changes (or run the seed before starting it).

Service enquiries open WhatsApp with `NEXT_PUBLIC_WHATSAPP_NUMBER` (default `917013114599`). Next.js
inlines the value at build time, so set it in `.env.local` before building for another number.

| Collection               | Rows  | Notes                                                                  |
| ------------------------ | ----- | ---------------------------------------------------------------------- |
| `cities`                 | 16    | 10 flight cities and 8 hotel cities, with airport and tagline          |
| `flights`                | 540   | 10 cities, 90 directional routes, 6 fictional airlines, 3 cabins       |
| `hotels`                 | 32    | 4 stays in each of 8 cities, fictional names, amenities, policies      |
| `cars`                   | 62    | 12 car cities, 6 body styles, 12 fictional hosts, hourly demo rates    |
| `holidays`               | 12    | 10 destinations, 10 themes, day-by-day itineraries, departure dates    |
| `offers`                 | 12    | 7 visible rows across stays, holidays, and cars; flights/trains kept   |
| `enquiries`              | grows | name, normalised phone, service, item title, context lines, timestamps |
| `newsletter_subscribers` | grows | unique lowercased email, source, timestamps                            |
| `contact_messages`       | grows | name, email, optional phone, message, timestamps                       |

All fares, taxes, ratings, and availability are fictional demo values. Nothing is held or charged,
and no booking is persisted. Enquiries, newsletter emails, and contact messages are persisted so the
team can follow up; `db:seed:fresh` only clears the six catalogue collections and leaves them intact.

The models in `lib/models/` mirror the Zod row shapes, use the existing snake_case field names, and
add unique indexes on `id` (and `code` for cities). The lead models add a descending `createdAt`
index for triage and make `email` unique for newsletter sign-ups. `lib/mongodb.ts` caches one
connection across requests and dev reloads.

### Admin access

The dashboard belongs to one administrator and is configured entirely through environment
variables. Public visitors never sign in, and there is no customer-account collection.

```bash
# .env.local
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=scrypt:16384:8:1:...
ADMIN_JWT_SECRET=<at least 32 random characters>

# Cloudinary — either the three separate values or the single URL
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# CLOUDINARY_URL=cloudinary://api-key:api-secret@your-cloud

npm run admin:hash-password   # prompts twice with hidden input
```

The hash script prints the complete `ADMIN_PASSWORD_HASH=...` line to paste into `.env.local`.
The colons are deliberate: Next's env loader expands `$name`, so a `$`-separated hash would be
corrupted before the app reads it. Passwords must be at least 12 characters. To rotate, generate a
new hash and restart; changing `ADMIN_JWT_SECRET` invalidates every existing session. If all three
`CLOUDINARY_*` credentials are present they win; otherwise the app parses `CLOUDINARY_URL`.

Open `/admin/login`. The session lasts eight hours in an HttpOnly, SameSite=Strict cookie
(`Secure` when `NODE_ENV` is production). `proxy.ts` performs the optimistic redirect, and the
admin layout, pages, actions, and upload route verify the token again. Five failed attempts per IP
and email are throttled for 15 minutes in memory. Uploads and later catalogue edits append to the
`audit_logs` collection; there is still no password reset, 2FA, or user list. This is a
single-operator demo, and the login throttle resets when the process restarts.

`/admin` is the live stats dashboard. Use the 7/30/90-day links to change the range
(`?range=7`); the URL is the only state. Counts come from MongoDB on every request rather than the
public catalogue's process cache, so a new enquiry appears on the next load. The page shows totals
and range counts, new leads, newsletter and contact volume, a 30-day IST trend, service and status
splits, the ten most enquired items, and the eight latest leads with call links. Lead rows are
private admin data; the `/api/enquiries` route is write-only and the dashboard is behind the session
check.

Catalogue editors upload images directly. The browser posts multipart data to
`/api/admin/uploads`; the route handler checks the admin JWT and the request `Origin`, enforces a
5 MB limit, then verifies the file's magic bytes rather than trusting its MIME type. JPEG, PNG,
and WebP are accepted; SVG, GIF, and spoofed extensions are rejected. Successful files land in
`tripnest/{media|hotels|holidays|cars|offers}`, and the returned URL uses `f_auto,q_auto` so
Cloudinary negotiates the best format. `next.config.ts` allows only this cloud name on
`res.cloudinary.com`. Immutable uploads are not cache-busted; catalogue cache invalidation lives in
`lib/admin/cache.ts` and runs after catalogue mutations.

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
curl -s "http://localhost:3000/api/cars?city=GOI&start=2026-11-13T10:00&end=2026-11-15T10:00" | head -c 400
curl -s "http://localhost:3000/api/cars/car-maruti-suzuki-swift" | head -c 400
curl -s "http://localhost:3000/api/offers?category=cars" | head -c 400
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/cars/nope"   # 404
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/hotels/nope"   # 404
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/holidays/nope" # 404
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/flights?from=BOM" # 400
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/cars?city=GO"     # 400
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/offers?category=nope" # 400
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/cabs"                # 308 → /rent-a-car
```

Lead forms are `POST`-only and return the saved record id, so they can be checked without a browser:

```bash
curl -s -X POST "http://localhost:3000/api/enquiries" -H "Content-Type: application/json" \
  -d '{"name":"Demo User","phone":"9876543210","service":"hotel","title":"Harbour & Hush","context":["2 guests"]}'
curl -s -X POST "http://localhost:3000/api/newsletter" -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}'
curl -s -X POST "http://localhost:3000/api/contact" -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","message":"Please share two stay options."}'
curl -s -o /dev/null -w "%{http_code}\n" -X POST "http://localhost:3000/api/enquiries" \
  -H "Content-Type: application/json" -d '{"name":"X","phone":"123","service":"train","title":""}' # 400
```

On the home page, the offer and holiday carousels use previous/next controls with a polite slide
counter, the FAQ uses native disclosures, and the newsletter confirms that the email was saved.
Destination and theme links point at real catalogue query params:

```bash
curl -s "http://localhost:3000/holidays?destination=UDR" | grep -o "Lake City in Three Acts"
curl -s "http://localhost:3000/holidays?theme=mountains" | grep -o "High Desert"
```

In the UI, changing a filter or sort order should update the URL and re-render the server-driven
result list. Filters use one shared client hook (`useSearchParamsUpdater`) so the back button and
shared links behave as expected.

## Quality

### Tests

`npm test` runs Vitest in a Node environment with the `@` alias. The suite targets the logic that
is easy to get quietly wrong and hard to see in the UI:

| File                              | Coverage                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `tests/dates.test.ts`             | ISO validation, leap years, rollover, night clamping, rental windows, India-time labels     |
| `tests/pricing.test.ts`           | Flight, stay, holiday, and car breakdowns, tax rounding, per-room and per-day scaling       |
| `tests/utils.test.ts`             | INR formatting, compaction, pluralisation, query strings, class merging                     |
| `tests/validation-search.test.ts` | Flight, hotel, holiday, car, and offer URL parsing, defaults, clamping, error copy          |
| `tests/validation-forms.test.ts`  | Enquiry, newsletter, and contact payloads, phone normalisation, caps, invalid services      |
| `tests/data.test.ts`              | Catalogue counts, lookup, filters, sorts, facets, popular routes, similar packages and cars |
| `tests/fixtures.test.ts`          | Every JSON seed fixture validated against the same Zod schemas used for MongoDB reads       |
| `tests/admin-auth.test.ts`        | JWT signing, tamper and expiry rejection, scrypt hashing, redirect safety, login throttle   |
| `tests/admin-session.test.ts`     | Cookie flags, session verification, tampered-token rejection, and sign-out clearing         |
| `tests/admin-stats.test.ts`       | Range parsing, IST day boundaries, service/status splits, item grouping, trend, safe links  |
| `tests/admin-uploads.test.ts`     | Magic bytes, MIME spoofing, size limits, folders, origin guard, Cloudinary URL parsing      |

152 tests across 11 files. They run in about 600 ms and need no browser, server, or database: the
Mongo collection loader is mocked with the same seed fixtures. The lead schemas are exercised by
`tests/validation-forms.test.ts`; the route handlers themselves are verified against MongoDB
manually. The admin token, cookie, and stats tests run entirely in Node.

### Accessibility

The app targets WCAG 2.2 AA. Automated checks use axe-core over 17 routes:

```bash
npm run build && npm run start   # in one terminal
npm run audit:a11y               # WCAG 2.2 AA
npm run audit:a11y -- --best-practice
```

Both audits currently report **17/17 pages clean**. They need a running app and a local Chrome;
set `CHROME_PATH` if Chrome is not in a standard location, and `BASE_URL` to point at another
origin.

The route set covers home, flight search and detail, hotel search and detail, the holiday
catalogue and detail, offers, the rent-a-car landing, car search and detail, about, the contact
form, the admin sign-in page, trains, and the not-found page.

Keyboard behaviour verified in the browser:

- The first <kbd>Tab</kbd> reveals “Skip to content”; activating it moves focus to `<main>`.
- Every interactive control shows a 2px focus outline.
- The date picker opens with <kbd>Enter</kbd>, closes with <kbd>Escape</kbd>, and returns focus to
  its trigger.
- The mobile navigation traps focus inside the sheet and returns it to the menu button.
- Carousel controls advance with <kbd>Enter</kbd> and announce the new slide.
- The review acknowledgement toggles with <kbd>Space</kbd>.

Semantics: one `<h1>` per page, landmark regions, labelled inputs and groups, `aria-current` on
the active gallery image, `role="img"` with a text label for star ratings, native `<details>` for
FAQs and offer terms, and no `aria-label` that contradicts visible text.

Contrast is fixed in the token layer rather than per component:

| Token        | Before    | After     | Ratio on white |
| ------------ | --------- | --------- | -------------- |
| `muted`      | `#5b6b67` | `#4a5a56` | 5.61 → 7.27    |
| `muted-soft` | `#7c8b87` | `#5f6e6a` | 3.56 → 5.35    |
| `accent-500` | `#ff6b4a` | `#c2410c` | 2.82 → 5.18    |
| `accent-600` | `#e25536` | `#9a3412` | 3.76 → 7.31    |
| `accent-700` | `#b73c24` | `#7f2d18` | 5.70 → 9.17    |
| `gold-600`   | `#c98a18` | `#8a5a0a` | 2.94 → 5.92    |
| `success`    | `#178a6b` | `#0f6b52` | 4.30 → 6.47    |
| `warning`    | `#b7791f` | `#8a5a0a` | 3.64 → 5.92    |

Bright coral (`#ff6b4a`) and gold (`#f2b544`) remain in decorative gradients and fills where no
text sits on top. White text on the dark header moved from 45–55% opacity to 60–75%, taking it from
4.38:1 to at least 6.75:1 on `brand-950`.

### Performance

`npm run audit:perf` measures 13 routes in headless Chromium at 390×844, with 2× CPU throttling
and a cold cache. It fails if LCP exceeds 2.5 s, CLS exceeds 0.1, JS exceeds 350 kB, or total
transfer exceeds 600 kB.

Latest run on the production build:

| Metric         | Range            |
| -------------- | ---------------- |
| LCP            | 0.08–0.71 s      |
| CLS            | 0 on every route |
| JavaScript     | 181–289 kB       |
| Total transfer | 277–400 kB       |
| DOM nodes      | 479–1,736        |

The main levers: Server Components by default, the cached MongoDB collection loader, `next/image`
with explicit `sizes`, `priority` only on above-the-fold art, `display: swap` fonts, Suspense
boundaries around search-param work, and animations limited to `transform`/`opacity`.

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

`cities`, `flights`, `hotels`, `cars`, `holidays`, and `offers` are implemented (see **Data layer**
above). They share the same cached collection loader and Zod row schemas, so every consumer keeps
one typed source of truth. Flights and trains keep their data and routes but are hidden from the
navigation in this phase; trains remain a static shell.

`enquiries`, `newsletter_subscribers`, and `contact_messages` are the write side of the data layer.
They are intentionally small, append-only records. Enquiries also store the catalogue `itemId` and
`itemHref`, plus a `status` (`new`, `contacted`, or `closed`) for the dashboard's item popularity and
lead split. Older rows that only had a title can be linked once with:

```bash
npm run db:backfill-enquiries -- --dry-run   # preview matches and misses
npm run db:backfill-enquiries                # write itemId, itemHref, and status
```

The backfill matches unique catalogue titles per service and is idempotent; ambiguous titles and
unmatched rows are reported and left untouched.

## Reverse-engineering notes

`docs/REA.md` records the Step 0 analysis and the Phase 2–10 implementation records: observed
sitemap and layout patterns, inferred flows, catalogue schemas, responsive behaviour, design
decisions, verification, and limitations. Live MakeMyTrip capture was blocked by an Akamai 403, so the
analysis relies on archived snapshots and public page structure. Phase 7 uses REA browser captures
of Zoomcar's public pages plus its published `llms-full.txt` to model a self-drive rental flow.
No proprietary code, logos, photography, or marketing copy was reused.

## Roadmap

1. **Phase 1 — Foundation (done):** setup, tokens, layout shell, motion, home preview, route
   scaffolding, error/loading states.
2. **Phase 2 — Flights and hotels (done):** catalogue data layer, search widgets, URL-driven
   results, filters, sorting, result cards, detail shells.
3. **Phase 3 — Holidays, offers, and APIs (done):** holiday catalogue and detail pages, offer
   board, route handlers, Zod query validation.
4. **Phase 4 — Home and editorial polish (done):** full home composition, accessible carousels,
   curated destinations and stays, field notes, newsletter, and FAQ.
5. **Phase 5 — Booking (done, later replaced):** URL-driven review and confirmation for flights,
   stays, and holidays, deterministic demo references, and no payment or persistence. Phase 8
   replaced this flow with saved enquiries and a WhatsApp hand-off.
6. **Phase 6 — Quality (done):** accessibility audit, performance pass, tests, documentation.
7. **Phase 7 — Rent a car (done):** Zoomcar-style self-drive landing, search, and detail pages,
   a 62-car catalogue, car pricing with GST and kilometre plans, shared enquiry integration,
   flights/trains hidden from the navigation, and `/cabs` redirects to `/rent-a-car`.
8. **Phase 8 — Lead persistence (done):** service enquiries, newsletter sign-ups, and contact
   messages are validated with Zod and saved in MongoDB, with idempotent newsletter sign-ups and
   a contact form on `/info/contact`.
9. **Phase 9 — Admin authentication (done):** one environment-configured admin account, a scrypt
   password hash, an eight-hour HS256 JWT in an HttpOnly cookie, an optimistic proxy gate, login
   throttling, and a protected `/admin` shell.
10. **Phase 10 — Enquiry stats (done):** `itemId`/`itemHref` capture on every detail page, an
    idempotent backfill for existing rows, a lead `status` field, and a live `/admin` dashboard with
    7/30/90-day ranges, service and status splits, a 30-day IST trend, top items, and recent leads.
11. **Phase 11 — Cloudinary media foundation (done):** a signed admin upload route, 5 MB
    raster-only validation by magic bytes, per-catalogue Cloudinary folders, `f_auto,q_auto`
    delivery URLs, an append-only audit log, and shared admin form controls. The standalone media
    workspace was later removed in favour of uploading directly in the catalogue editors.

## Disclaimer

Makeasytrips is an independent learning project. It is not a travel agency. All prices, inventory,
ratings, and offers are fictional. Nothing on the site creates a booking or charges a card.
