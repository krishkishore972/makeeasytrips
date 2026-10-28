"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CarGalleryProps = {
  images: string[];
  name: string;
  city: string;
};

export function CarGallery({ images, name, city }: CarGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [index, setIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect).on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`Illustrated gallery for the ${name}`}
      className="relative overflow-hidden rounded-2xl border border-line bg-brand-950"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {images.map((src, imageIndex) => (
            <div
              key={`${src}-${imageIndex}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${imageIndex + 1} of ${images.length}`}
              className="relative aspect-[16/10] min-w-0 flex-[0_0_100%] sm:aspect-[16/9]"
            >
              <Image
                src={src}
                alt={`${name} in ${city} — illustrated view ${imageIndex + 1}`}
                fill
                priority={imageIndex === 0}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-brand-950/75 px-2.5 py-1.5 text-[10px] font-extrabold text-white backdrop-blur">
        <Images aria-hidden="true" className="size-3.5" />
        {images.length} views
      </span>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous image"
            className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-surface"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next image"
            className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-surface"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-950/55 px-2 py-1.5 backdrop-blur">
            {images.map((src, dotIndex) => (
              <button
                key={`${src}-dot-${dotIndex}`}
                type="button"
                onClick={() => emblaApi?.scrollTo(dotIndex)}
                aria-label={`Go to image ${dotIndex + 1}`}
                aria-current={dotIndex === index ? "true" : undefined}
                className="grid size-6 place-items-center rounded-full"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all",
                    dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                />
              </button>
            ))}
          </div>

          <p aria-live="polite" className="sr-only">
            Image {index + 1} of {images.length}
          </p>
        </>
      ) : null}
    </section>
  );
}
