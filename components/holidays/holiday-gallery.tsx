import Image from "next/image";
import { Images } from "lucide-react";

type HolidayGalleryProps = {
  images: string[];
  title: string;
};

export function HolidayGallery({ images, title }: HolidayGalleryProps) {
  const [main, ...rest] = images;
  const secondary = rest.slice(0, 2);

  return (
    <section
      aria-label={`Illustrated gallery for ${title}`}
      className="grid gap-2 sm:grid-cols-[1.7fr_1fr]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-brand-950">
        <Image
          src={main}
          alt={`${title} — illustrated view 1`}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-brand-950/75 px-2.5 py-1.5 text-[10px] font-extrabold text-white backdrop-blur">
          <Images aria-hidden="true" className="size-3.5" />
          {images.length} views
        </span>
      </div>

      {secondary.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:grid-rows-2">
          {secondary.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-[16/10] min-h-0 overflow-hidden rounded-2xl border border-line bg-brand-50 sm:aspect-auto"
            >
              <Image
                src={src}
                alt={`${title} — illustrated view ${index + 2}`}
                fill
                sizes="(min-width: 1024px) 24vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
