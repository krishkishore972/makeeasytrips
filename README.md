# TripNest

TripNest is an original, learning-purpose travel experience inspired by the structure and
flows of modern travel-booking products. It is **not** affiliated with, endorsed by, or
connected to any travel brand. There are no real bookings, payments, accounts, or stored
personal details.

The project is being built in phases. **Phase 1 (foundation) is complete.** Search results,
filters, detail pages, and the mock checkout arrive in later phases.

## What is in this build

- Next.js App Router with React Server Components by default and small client leaves
- TypeScript in strict mode with Zod for environment validation
- Tailwind CSS v4 theme with an original lagoon-teal, coral, and gold palette
- Fraunces display serif and Manrope UI sans via `next/font`
- Lenis smooth scrolling with `prefers-reduced-motion` support
- Motion (Framer Motion) shared variants, scroll reveals, and reduced-motion handling
- Responsive two-tier navbar, mobile navigation sheet, demo login dialog, and footer
- Foundation home page: hero, static GET search widget, destinations, offers, and how-it-works
- Placeholder routes for every top-level travel line, plus editorial and legal pages
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

| Route                    | Phase 1 state                                                        |
| ------------------------ | -------------------------------------------------------------------- |
| `/`                      | Foundation home preview                                              |
| `/flights`               | Placeholder; accepts and echoes search query params                  |
| `/hotels`                | Placeholder for the Phase 2 search and results flow                  |
| `/holidays`              | Placeholder for the Phase 3 catalogue and detail pages               |
| `/trains`, `/cabs`       | Static shells, intentionally out of the current roadmap              |
| `/offers`                | Placeholder for the Phase 3 offer board                              |
| `/my-trips`, `/wishlist` | Static empty-state demos                                             |
| `/info/[slug]`           | About, how-it-works, help, legal, accessibility, contact, disclaimer |

The home search widget is a native `GET` form pointing at `/flights`. Submitting it puts the
route, dates, traveller count, and cabin in the URL, which proves the URL-state approach before
the results UI exists.

## Structure

```text
app/                  Routes, layouts, loading/error/not-found, global styles
components/
  home/               Home-specific search widget
  layout/             Navbar, mobile nav, login dialog, footer, newsletter
  providers/          Motion and Lenis providers
  shared/             Logo, section heading, scroll reveal, feature preview
docs/REA.md           Reverse-engineering notes, evidence, and design decisions
hooks/                Small client hooks (scroll state, media query)
lib/                  Site config, fonts, motion variants, utilities, info content
public/images/        Original abstract SVG placeholders
types/                Shared TypeScript types
```

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

## Data plan

Phase 1 does not read CSV yet. The next phase adds `/data` files and a typed, cached data layer:

```text
data/flights.csv
data/hotels.csv
data/cities.csv
data/offers.csv
data/holidays.csv
```

The loader will parse each file once, validate rows with Zod, cache the typed result, and expose
it through Server Components and `/app/api/...` route handlers. Search and filter state will live
in URL search params.

## Reverse-engineering notes

`docs/REA.md` records the Step 0 analysis: observed sitemap and layout patterns, inferred flows,
CSV schemas, responsive behaviour, design decisions, and limitations. Live MakeMyTrip capture was
blocked by an Akamai 403, so the analysis relies on archived snapshots and public page structure.
No proprietary code, logos, photography, or marketing copy was reused.

## Roadmap

1. **Phase 1 — Foundation (done):** setup, tokens, layout shell, motion, home preview, route
   scaffolding, error/loading states.
2. **Phase 2 — Flights and hotels:** CSV data layer, search widgets, URL-driven results, filters,
   sorting, result cards, detail shells.
3. **Phase 3 — Holidays, offers, and APIs:** catalogue, detail pages, route handlers, Zod query
   validation.
4. **Phase 4 — Home and editorial polish:** full home composition, carousels, FAQ, richer content.
5. **Phase 5 — Booking:** mock review, confirmation, no payment or persistence.
6. **Phase 6 — Quality:** accessibility audit, performance pass, tests, documentation.

## Disclaimer

TripNest is an independent learning project. It is not a travel agency. All prices, inventory,
ratings, and offers are fictional. Nothing on the site creates a booking or charges a card.
