import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  HeartHandshake,
  Landmark,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
  Wallet,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { HolidayCard } from "@/components/holidays/holiday-card";
import { DestinationCard } from "@/components/home/destination-card";
import { Faq } from "@/components/home/faq";
import { HeroSearch } from "@/components/home/hero-search";
import { StayCard } from "@/components/home/stay-card";
import { TravelNotes } from "@/components/home/travel-notes";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { OfferCard } from "@/components/offers/offer-card";
import { Carousel } from "@/components/shared/carousel";
import { RevealGroup, RevealItem, ScrollReveal } from "@/components/shared/scroll-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { getHomePageData } from "@/lib/data/home";
import { HOME_FAQS, TRAVEL_NOTES } from "@/lib/home-content";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "TripNest — Travel that feels like yours." },
  description:
    "Compare flights, find a stay with character, and shape a holiday that feels like yours. An original learning-purpose travel experience.",
  alternates: {
    canonical: "/",
  },
};

const valueProps = [
  {
    icon: ShieldCheck,
    title: "Clear pricing",
    detail: "Every demo fare shows the full picture before you decide.",
  },
  {
    icon: HeartHandshake,
    title: "Human support",
    detail: "Trip designers who answer questions, not just chatbots.",
  },
  {
    icon: Wallet,
    title: "No hidden fees",
    detail: "The price you see is the price the demo shows you.",
  },
  {
    icon: Compass,
    title: "India-first",
    detail: "Routes, stays, and packages shaped around how India travels.",
  },
] as const;

const themes: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Slow beach days", href: "/holidays?theme=beach", icon: Waves },
  { label: "Mountain air", href: "/holidays?theme=mountains", icon: Mountain },
  { label: "Heritage walks", href: "/holidays?theme=heritage", icon: Landmark },
  { label: "Food trails", href: "/holidays?theme=food", icon: UtensilsCrossed },
];

const steps = [
  {
    number: "01",
    title: "Tell us the feeling",
    detail: "Start with a mood, a city, or a date. We keep the options focused instead of endless.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Compare the honest details",
    detail:
      "See the full fare, the cancellation rules, and what is actually included before you choose.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Go with a plan",
    detail: "Keep the itinerary, the stays, and the small extras together in one calm place.",
    icon: Sparkles,
  },
] as const;

export default async function HomePage() {
  const { destinations, stays, holidays, offers, counts } = await getHomePageData();
  const featuredDestination = destinations[0];
  const featuredStay = stays[0];

  return (
    <>
      <section className="hero-mesh relative overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="absolute top-[-8rem] right-[-6rem] size-[26rem] rounded-full bg-accent-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-10rem] left-[-8rem] size-[28rem] rounded-full bg-brand-400/20 blur-3xl"
        />

        <div className="page-container relative pt-10 pb-28 sm:pt-14 lg:pt-20 lg:pb-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <ScrollReveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-brand-100 uppercase backdrop-blur">
                <Sparkles aria-hidden="true" className="size-3.5 text-gold-500" />
                India, thoughtfully planned
              </p>

              <h1 className="mt-5 text-[clamp(2.9rem,6vw,4.9rem)] leading-[0.96] font-semibold tracking-[-0.04em] text-white">
                Travel that feels <span className="text-gradient-sun italic">like yours.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-[1.0625rem] sm:leading-8">
                Flights, stays, and holiday ideas gathered with a little more care. Compare what
                matters, skip the noise, and build a trip that sounds like you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#plan"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
                >
                  Start planning
                  <ArrowDown aria-hidden="true" className="size-4" />
                </Link>
                <Link
                  href="/holidays"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
                >
                  Browse holidays
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
                {[
                  { value: formatCompactNumber(counts.cities), label: "cities on the map" },
                  { value: formatCompactNumber(counts.hotels), label: "demo stays" },
                  { value: formatCompactNumber(counts.holidays), label: "holiday ideas" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-display text-2xl font-semibold text-white sm:text-3xl">
                      {stat.value}
                    </dd>
                    <dd className="mt-1 text-[11px] font-semibold tracking-wide text-white/60 uppercase">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </ScrollReveal>

            <ScrollReveal delay={0.12} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 shadow-lg">
                <Image
                  src="/images/hero-coast.svg"
                  alt="Abstract illustration of a teal coastline at dusk"
                  fill
                  priority
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent"
                />

                {featuredDestination ? (
                  <Link
                    href={`/holidays/${featuredDestination.holiday.slug}`}
                    className="absolute top-4 left-4 max-w-[14rem] rounded-xl border border-white/15 bg-brand-950/55 p-3.5 text-white backdrop-blur-md transition-colors hover:bg-brand-950/75"
                  >
                    <p className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] text-brand-200 uppercase">
                      <MapPin aria-hidden="true" className="size-3" />
                      This week&apos;s edit
                    </p>
                    <p className="mt-1.5 font-display text-lg leading-tight text-white">
                      {featuredDestination.holiday.title}
                    </p>
                    <p className="mt-1 text-[11px] text-white/60">
                      {featuredDestination.city.name} · {featuredDestination.holiday.nights} nights
                      · from {formatCurrency(featuredDestination.minPrice)}
                    </p>
                  </Link>
                ) : null}

                {featuredStay ? (
                  <Link
                    href={`/hotels/${featuredStay.hotel.id}`}
                    className="absolute right-4 bottom-4 w-[12.5rem] rounded-xl border border-line bg-surface p-3.5 shadow-md transition-colors hover:border-brand-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
                        Stay of the week
                      </p>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-extrabold text-brand-800">
                        <Star aria-hidden="true" className="size-2.5 fill-gold-500 text-gold-500" />
                        {featuredStay.hotel.guest_rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1.5 font-display text-base leading-tight text-ink">
                      {featuredStay.hotel.name}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {featuredStay.hotel.area}, {featuredStay.cityName} · from{" "}
                      {formatCurrency(featuredStay.hotel.price_per_night)}/night
                    </p>
                  </Link>
                ) : null}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="plan" className="relative z-10 scroll-mt-24">
        <div className="page-container -mt-20 lg:-mt-24">
          <ScrollReveal>
            <HeroSearch />
          </ScrollReveal>
        </div>
      </section>

      <section aria-label="Why TripNest" className="border-b border-line bg-surface">
        <div className="page-container grid grid-cols-1 gap-x-6 gap-y-7 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
          {valueProps.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon aria-hidden="true" className="size-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-padding border-y border-line bg-brand-50/60">
        <div className="page-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Offers and extras"
              title="A little extra, on us."
              description="Small savings for the things you were going to book anyway. Codes are demo-only and never charge a card."
              action={{ label: "View all offers", href: "/offers" }}
            />
          </ScrollReveal>

          <ScrollReveal className="mt-10" delay={0.06}>
            <Carousel label="Featured offers">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} className="h-full" />
              ))}
            </Carousel>
          </ScrollReveal>
        </div>
      </section>

      <section id="destinations" className="section-padding scroll-mt-24">
        <div className="page-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Handpicked destinations"
              title="Go where the light is different."
              description="Five places to start with, each shaped into a short escape with room to breathe. Every package is original demo content."
              action={{ label: "All holidays", href: "/holidays" }}
            />
          </ScrollReveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" stagger={0.09}>
            {destinations.map((destination, index) => (
              <RevealItem key={destination.city.code} className="h-full">
                <DestinationCard destination={destination} priority={index === 0} />
              </RevealItem>
            ))}
          </RevealGroup>

          <ScrollReveal className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-extrabold tracking-[0.14em] text-muted-soft uppercase">
              Or plan by feeling
            </span>
            {themes.map((theme) => {
              const Icon = theme.icon;

              return (
                <Link
                  key={theme.href}
                  href={theme.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                >
                  <Icon aria-hidden="true" className="size-3.5 text-brand-500" />
                  {theme.label}
                </Link>
              );
            })}
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding border-y border-line bg-surface">
        <div className="page-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Trending stays"
              title="Rooms with a point of view."
              description="A small edit of guest-favourite stays from the demo catalogue, chosen for character rather than a chain logo."
              action={{ label: "Browse stays", href: "/hotels" }}
            />
          </ScrollReveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.09}>
            {stays.map((stay, index) => (
              <RevealItem key={stay.hotel.id} className="h-full">
                <StayCard stay={stay} priority={index === 0} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-padding">
        <div className="page-container">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Holiday ideas"
              title="Packages with room to breathe."
              description="Short escapes and slower weeks, with the itinerary, transfers, and a few meals already thought through."
              action={{ label: "All holiday ideas", href: "/holidays" }}
            />
          </ScrollReveal>

          <ScrollReveal className="mt-10" delay={0.06}>
            <Carousel label="Holiday ideas">
              {holidays.map((entry) => (
                <HolidayCard
                  key={entry.holiday.id}
                  holiday={entry.holiday}
                  cityName={entry.cityName}
                  travellers={2}
                />
              ))}
            </Carousel>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding border-y border-line bg-brand-50/60">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <ScrollReveal>
              <SectionHeading
                eyebrow="How it works"
                title="Less browsing. More going."
                description="TripNest is built around a simple idea: the best trip planning feels like a conversation, not a spreadsheet."
              />
              <Link
                href="/info/how-it-works"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700 underline-offset-4 hover:underline"
              >
                Read the longer version
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </ScrollReveal>

            <RevealGroup className="space-y-3" stagger={0.1}>
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <RevealItem key={step.number}>
                    <div className="group flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs transition-colors hover:border-brand-200 sm:gap-5 sm:p-6">
                      <div className="relative flex flex-col items-center">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-2 text-[10px] font-extrabold tracking-[0.14em] text-muted-soft"
                        >
                          {step.number}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl leading-tight">{step.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-muted">{step.detail}</p>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="page-container grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <ScrollReveal>
              <SectionHeading
                eyebrow="Field notes"
                title="Small ideas for better trips."
                description="Short, practical notes from the catalogue — no listicles, no urgency, just a few things worth knowing before you go."
              />
            </ScrollReveal>

            <ScrollReveal className="mt-8" delay={0.06}>
              <TravelNotes notes={TRAVEL_NOTES} />
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1}>
            <aside className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-xs sm:p-8">
              <p className="eyebrow">Postcards, occasionally</p>
              <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2rem)] leading-tight">
                One useful note, every other Thursday.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                A short read on where to go, when to go, and what to leave behind. No countdown
                timers, no daily noise.
              </p>
              <div className="mt-6">
                <NewsletterForm />
              </div>
              <p className="mt-4 text-[11px] leading-5 text-muted-soft">
                Demo only — no email is stored, sent, or shared.
              </p>
            </aside>
          </ScrollReveal>
        </div>
      </section>

      <section id="faq" className="section-padding border-t border-line bg-surface">
        <div className="page-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Questions"
              title="The things people ask before they go."
              description="Straight answers about the demo, the prices, and what happens after you find something you like."
            />
            <Link
              href="/info/help"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700 underline-offset-4 hover:underline"
            >
              More help
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <Faq items={HOME_FAQS} />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <ScrollReveal>
            <div className="hero-mesh relative overflow-hidden rounded-[2rem] px-6 py-12 text-white sm:px-10 lg:px-16 lg:py-16">
              <div
                aria-hidden="true"
                className="absolute top-[-7rem] right-[-4rem] size-72 rounded-full bg-accent-500/25 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute right-12 bottom-[-5rem] size-56 rounded-full bg-gold-500/15 blur-3xl"
              />

              <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="eyebrow text-brand-200">Your next trip</p>
                  <h2 className="mt-3 max-w-2xl text-[clamp(2rem,4vw,3.25rem)] leading-[1.04] text-white">
                    The best trips start with a feeling.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                    Tell us whether you need salt air, mountain quiet, or a long table with friends.
                    We will help you find the shape of it.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/holidays"
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-extrabold text-white shadow-glow transition-colors hover:bg-accent-600"
                    >
                      Find your holiday
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                    <Link
                      href="/info/contact"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
                    >
                      Talk to a trip designer
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                  <p className="mt-5 text-[11px] leading-5 text-white/65">
                    Demo experience. No real bookings, payments, or personal data.
                  </p>
                </div>

                <div className="relative hidden lg:block" aria-hidden="true">
                  <div className="mx-auto grid aspect-square max-w-[18rem] place-items-center rounded-full border border-white/15 bg-white/5">
                    <div className="grid size-48 place-items-center rounded-full border border-white/15 bg-white/5">
                      <div className="relative grid size-28 place-items-center rounded-full bg-accent-500 shadow-glow">
                        <SunMark />
                      </div>
                    </div>
                  </div>
                  <span className="absolute top-6 right-0 rounded-full border border-white/15 bg-brand-950/50 px-3 py-1.5 text-[11px] font-bold text-white/80 backdrop-blur">
                    beach
                  </span>
                  <span className="absolute bottom-10 left-0 rounded-full border border-white/15 bg-brand-950/50 px-3 py-1.5 text-[11px] font-bold text-white/80 backdrop-blur">
                    mountains
                  </span>
                  <span className="absolute top-1/2 -right-2 rounded-full border border-white/15 bg-brand-950/50 px-3 py-1.5 text-[11px] font-bold text-white/80 backdrop-blur">
                    heritage
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function SunMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-14 text-white" aria-hidden="true">
      <circle cx="24" cy="17" r="5" fill="currentColor" opacity="0.95" />
      <path
        d="M9 32c4.5-8.8 10.5-13.2 15-13.2S34.5 23.2 39 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M14 38c3.6-5.8 7.2-8.7 10-8.7s6.4 2.9 10 8.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeOpacity="0.65"
        strokeWidth="2.5"
      />
    </svg>
  );
}
