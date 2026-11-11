/**
 * Pure upload rules shared by the browser uploader, the admin route handler,
 * and tests. Nothing here reads environment variables or touches the network,
 * so the same limits are enforced on both sides of the request.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Multipart bodies add boundaries and part headers around the file. This is a
 * precheck only; the decoded file itself is still limited to MAX_UPLOAD_BYTES.
 */
export const MAX_UPLOAD_REQUEST_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

export const IMAGE_EXTENSIONS: Record<ImageMimeType, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const UPLOAD_ACCEPT = IMAGE_MIME_TYPES.join(",");

export const UPLOAD_FOLDERS = ["media", "hotels", "holidays", "cars", "offers"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const DEFAULT_UPLOAD_FOLDER: UploadFolder = "media";

export const UPLOAD_FOLDER_LABELS: Record<UploadFolder, string> = {
  media: "Media library",
  hotels: "Hotels",
  holidays: "Holidays",
  cars: "Cars",
  offers: "Offers",
};

export type UploadErrorCode =
  "empty-file" | "file-too-large" | "unsupported-type" | "invalid-content" | "type-mismatch";

export type UploadValidationResult =
  | {
      ok: true;
      mimeType: ImageMimeType;
      extension: "jpg" | "png" | "webp";
      suggestedName: string;
    }
  | {
      ok: false;
      code: UploadErrorCode;
      message: string;
    };

export function isUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

export function cloudinaryFolder(folder: UploadFolder): `tripnest/${UploadFolder}` {
  return `tripnest/${folder}`;
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;

  return signature.every((value, index) => bytes[offset + index] === value);
}

/**
 * Verify the file by its bytes rather than trusting the multipart MIME type.
 * SVG is deliberately absent: it can contain scripts and is not a raster photo.
 */
export function detectImageMimeType(bytes: Uint8Array): ImageMimeType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Turn the uploaded filename into a lower-case Cloudinary public-id prefix.
 * The extension is discarded because the real format comes from magic bytes.
 */
export function sanitiseUploadName(value: string): string {
  const withoutExtension = value
    .normalize("NFKD")
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .toLowerCase();

  return withoutExtension.slice(0, 80) || "image";
}

export function validateImageUpload(input: {
  name?: string;
  type: string;
  bytes: Uint8Array;
}): UploadValidationResult {
  const { bytes } = input;

  if (bytes.byteLength === 0) {
    return { ok: false, code: "empty-file", message: "Choose an image to upload." };
  }

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      code: "file-too-large",
      message: "Images must be 5 MB or smaller.",
    };
  }

  const declaredType = input.type.trim().toLowerCase().replace("image/jpg", "image/jpeg");

  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(declaredType)) {
    return {
      ok: false,
      code: "unsupported-type",
      message: "Only JPEG, PNG, and WebP images are supported.",
    };
  }

  const detectedType = detectImageMimeType(bytes);

  if (!detectedType) {
    return {
      ok: false,
      code: "invalid-content",
      message: "That file is not a valid JPEG, PNG, or WebP image.",
    };
  }

  if (detectedType !== declaredType) {
    return {
      ok: false,
      code: "type-mismatch",
      message: "The file contents do not match the declared image type.",
    };
  }

  const extension = IMAGE_EXTENSIONS[detectedType];
  const base = sanitiseUploadName(input.name ?? "image");

  return {
    ok: true,
    mimeType: detectedType,
    extension,
    suggestedName: `${base}.${extension}`,
  };
}

/**
 * Browsers send Origin on cross-origin and same-origin POST requests. Requiring
 * it to match the public host blocks a forged form from another site even
 * before the SameSite=Strict admin cookie is considered.
 */
export function isAllowedUploadOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const requestHost = new URL(`https://${host.trim()}`).host.toLowerCase();

    return originHost === requestHost;
  } catch {
    return false;
  }
}

export function isContentLengthAllowed(value: string | null): boolean {
  if (value === null || value.trim() === "") return true;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_UPLOAD_REQUEST_BYTES;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} KB`;

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}
