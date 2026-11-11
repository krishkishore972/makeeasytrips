/** Preserve the legacy illustrated gallery only for hotels without extra photos. */
export function hotelGalleryImages(image: string, gallery: string[] = []): string[] {
  const images = [...new Set([image, ...gallery].filter(Boolean))];
  if (images.length > 1) return images;

  const match = image.match(/^\/images\/stays\/stay-([1-6])\.svg$/);
  if (!match) return images.length ? images : ["/images/stays/stay-1.svg"];

  const start = Number(match[1]);
  return [0, 1, 2].map((offset) => `/images/stays/stay-${((start - 1 + offset) % 6) + 1}.svg`);
}
