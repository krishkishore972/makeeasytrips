import Image from "next/image";

export function EventGallery({ title, images }: { title: string; images: string[] }) {
  const unique = [...new Set(images)].slice(0, 5);
  return (
    <section aria-label={`Photos of ${title}`} className="space-y-3">
      {unique.map((src, index) => (
        <div
          key={src}
          className={`relative overflow-hidden rounded-2xl bg-brand-50 ${
            index === 0 ? "aspect-[16/10]" : "aspect-[16/7]"
          }`}
        >
          <Image
            src={src}
            alt={`${title} — photo ${index + 1}`}
            fill
            preload={index === 0}
            sizes="(min-width: 1024px) 65vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </section>
  );
}
