import { UPLOAD_FOLDERS } from "@/lib/admin/uploads";

/** Extract only public IDs in folders managed by Makeasytrips's uploader. */
export function catalogueImageId(value: string, cloudName: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    if (parts[0] !== cloudName || parts[1] !== "image" || parts[2] !== "upload") return null;
    const root = parts.indexOf("tripnest", 3);
    if (
      root < 3 ||
      parts.length !== root + 3 ||
      !UPLOAD_FOLDERS.includes(parts[root + 1] as (typeof UPLOAD_FOLDERS)[number])
    )
      return null;
    const filename = parts[root + 2].replace(/\.(?:jpg|jpeg|png|webp)$/i, "");
    if (!/^[a-zA-Z0-9_-]+$/.test(filename)) return null;
    return `tripnest/${parts[root + 1]}/${filename}`;
  } catch {
    return null;
  }
}

export function catalogueImageUrls(record: Record<string, unknown>): string[] {
  return [
    ...new Set(
      [record.image, ...(Array.isArray(record.gallery) ? record.gallery : [])].filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      ),
    ),
  ];
}
