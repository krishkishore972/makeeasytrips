"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

export type HeroSlide = {
  href: string;
  image: string;
  category: string;
  title: string;
  detail: string;
};

export function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const reducedMotion = useReducedMotion();
  const [viewport, api] = useEmblaCarousel({
    loop: slides.length > 1,
    duration: reducedMotion ? 0 : 25,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const sync = useCallback(() => {
    if (api) setSelected(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api, sync]);

  useEffect(() => {
    if (!api || slides.length < 2 || reducedMotion || paused || interacting) return;
    const timer = window.setInterval(() => api.scrollNext(), 6000);
    return () => window.clearInterval(timer);
  }, [api, slides.length, reducedMotion, paused, interacting]);

  if (!slides.length)
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-[2rem] border border-white/15 bg-brand-900 p-8 text-center text-white/80">
        Discover stays, holidays and self-drive cars.
      </div>
    );

  return (
    <section
      aria-label="Popular stays, holidays and cars"
      aria-roledescription="carousel"
      className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-lg"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
    >
      <div ref={viewport} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={`${slide.category}-${slide.href}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={index !== selected}
              className="relative aspect-[4/3] min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/45 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 pb-24 sm:p-8 sm:pb-24">
                <p className="text-[11px] font-extrabold tracking-[0.14em] text-brand-100 uppercase">
                  {slide.category}
                </p>
                <h2 className="mt-2 text-2xl leading-tight text-white sm:text-3xl">
                  {slide.title}
                </h2>
                <p className="mt-2 text-xs leading-5 text-white/80 sm:text-sm">{slide.detail}</p>
                <Link
                  href={slide.href}
                  tabIndex={index === selected ? undefined : -1}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-white underline underline-offset-4"
                >
                  Explore <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between gap-3 sm:inset-x-8">
          <p
            className="text-xs font-bold text-white"
            aria-live={paused || interacting || reducedMotion ? "polite" : "off"}
          >
            {selected + 1} / {slides.length}
          </p>
          <div className="flex gap-2">
            {!reducedMotion ? (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Play slides" : "Pause slides"}
                className="grid size-10 place-items-center rounded-full bg-brand-950/75 text-white hover:bg-brand-950"
              >
                {paused ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <Pause aria-hidden="true" className="size-4" />
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => api?.scrollPrev(Boolean(reducedMotion))}
              aria-label="Previous featured listing"
              className="grid size-10 place-items-center rounded-full bg-brand-950/75 text-white hover:bg-brand-950"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext(Boolean(reducedMotion))}
              aria-label="Next featured listing"
              className="grid size-10 place-items-center rounded-full bg-brand-950/75 text-white hover:bg-brand-950"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
