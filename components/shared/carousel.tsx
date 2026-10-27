"use client";

import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Children, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

type CarouselProps = {
  /** Accessible name for the carousel region. */
  label: string;
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  /** Width of each slide at each breakpoint. */
  slideClassName?: string;
  controlsClassName?: string;
};

/**
 * Embla-backed carousel with always-available prev/next controls.
 *
 * The slide list is a real flex row, so server-rendered children stay in the
 * HTML and remain readable without JavaScript. Controls are 44px targets, the
 * selected slide is announced politely, and reduced-motion users get an
 * instant scroll instead of a tween.
 */
export function Carousel({
  label,
  children,
  className,
  viewportClassName,
  slideClassName = "basis-full sm:basis-1/2 lg:basis-1/3",
  controlsClassName,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const prefersReducedMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    duration: prefersReducedMotion ? 0 : 24,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const syncState = useCallback((api: EmblaApi) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    // Embla has no API before the first layout pass. Sync after the frame so
    // the controls reflect the real snap list without a cascading render.
    const frame = requestAnimationFrame(() => syncState(emblaApi));
    emblaApi.on("select", syncState).on("reInit", syncState);

    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", syncState).off("reInit", syncState);
    };
  }, [emblaApi, syncState]);

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className={cn("overflow-hidden", viewportClassName)} ref={emblaRef}>
        <div className="-ml-4 flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className={cn("min-w-0 shrink-0 grow-0 pl-4", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-5 flex items-center justify-between gap-4 sm:justify-end",
          controlsClassName,
        )}
      >
        <p className="text-[11px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
          <span data-carousel-status aria-live="polite" aria-atomic="true">
            {selectedIndex + 1} / {slides.length}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev(Boolean(prefersReducedMotion))}
            disabled={!canScrollPrev}
            aria-label={`Previous slide in ${label}`}
            className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext(Boolean(prefersReducedMotion))}
            disabled={!canScrollNext}
            aria-label={`Next slide in ${label}`}
            className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
