import { randomUUID } from "node:crypto";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import {
  cloudinaryFolder,
  type ImageMimeType,
  type UploadFolder,
  sanitiseUploadName,
} from "@/lib/admin/uploads";

export type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export type UploadedImage = {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  mimeType: ImageMimeType;
  bytes: number;
  width: number;
  height: number;
  folder: UploadFolder;
};

/**
 * Accept the single CLOUDINARY_URL form as well as the three separate
 * variables. Keeping this pure lets the configuration path be tested without
 * touching Cloudinary.
 */
export function parseCloudinaryUrl(value: string | null | undefined): CloudinaryCredentials | null {
  const raw = value?.trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "cloudinary:") return null;

    const apiKey = decodeURIComponent(parsed.username).trim();
    const apiSecret = decodeURIComponent(parsed.password).trim();
    const cloudName = parsed.hostname.trim();

    if (!apiKey || !apiSecret || !cloudName) return null;

    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

export function getCloudinaryCredentials(): CloudinaryCredentials | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  return parseCloudinaryUrl(process.env.CLOUDINARY_URL);
}

export function isCloudinaryConfigured(
  credentials: CloudinaryCredentials | null = getCloudinaryCredentials(),
): boolean {
  return Boolean(credentials?.cloudName && credentials.apiKey && credentials.apiSecret);
}

function requireCredentials(): CloudinaryCredentials {
  const credentials = getCloudinaryCredentials();

  if (!credentials) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL).",
    );
  }

  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
    secure: true,
  });

  return credentials;
}

function uploadBuffer(bytes: Uint8Array, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, response) => {
      if (error) {
        reject(new Error(error.message || "Cloudinary rejected the upload."));
        return;
      }

      if (!response) {
        reject(new Error("Cloudinary returned no upload response."));
        return;
      }

      resolve(response);
    });

    stream.end(Buffer.from(bytes));
  });
}

/**
 * Upload a validated raster image with server-held credentials. The file is
 * streamed from memory, so no upload body is written to the application disk.
 */
export async function uploadCatalogueImage(input: {
  bytes: Uint8Array;
  folder: UploadFolder;
  fileName: string;
  extension: "jpg" | "png" | "webp";
  mimeType: ImageMimeType;
}): Promise<UploadedImage> {
  requireCredentials();

  const publicId = `${sanitiseUploadName(input.fileName)}-${randomUUID().slice(0, 8)}`;

  const result = await uploadBuffer(input.bytes, {
    folder: cloudinaryFolder(input.folder),
    public_id: publicId,
    resource_type: "image",
    format: input.extension,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    unique_filename: true,
    overwrite: false,
    tags: ["tripnest", `tripnest-${input.folder}`],
  });

  return {
    publicId: result.public_id,
    url: cloudinary.url(result.public_id, {
      secure: true,
      transformation: [{ fetch_format: "auto", quality: "auto" }],
    }),
    secureUrl: result.secure_url,
    format: result.format,
    mimeType: input.mimeType,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    folder: input.folder,
  };
}

export async function destroyCatalogueImage(publicId: string): Promise<void> {
  requireCredentials();
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary did not confirm image deletion.");
  }
}
