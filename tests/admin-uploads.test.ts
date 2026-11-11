import { describe, expect, it } from "vitest";
import { parseCloudinaryUrl } from "@/lib/admin/cloudinary";
import {
  cloudinaryFolder,
  detectImageMimeType,
  formatFileSize,
  IMAGE_MIME_TYPES,
  isAllowedUploadOrigin,
  isContentLengthAllowed,
  isUploadFolder,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_REQUEST_BYTES,
  sanitiseUploadName,
  UPLOAD_FOLDERS,
  validateImageUpload,
} from "@/lib/admin/uploads";

const PNG_BYTES = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPEG_BYTES = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const WEBP_BYTES = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
]);
const SVG_BYTES = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

describe("image magic bytes", () => {
  it("detects JPEG, PNG, and WebP", () => {
    expect(detectImageMimeType(JPEG_BYTES)).toBe("image/jpeg");
    expect(detectImageMimeType(PNG_BYTES)).toBe("image/png");
    expect(detectImageMimeType(WEBP_BYTES)).toBe("image/webp");
  });

  it("rejects SVG, GIF, and short buffers", () => {
    expect(detectImageMimeType(SVG_BYTES)).toBeNull();
    expect(detectImageMimeType(Uint8Array.from([0x47, 0x49, 0x46, 0x38]))).toBeNull();
    expect(detectImageMimeType(Uint8Array.from([0xff, 0xd8]))).toBeNull();
  });
});

describe("validateImageUpload", () => {
  it("accepts supported raster images and suggests a safe name", () => {
    expect(
      validateImageUpload({
        name: "Harbour House Front!.PNG",
        type: "image/png",
        bytes: PNG_BYTES,
      }),
    ).toEqual({
      ok: true,
      mimeType: "image/png",
      extension: "png",
      suggestedName: "harbour-house-front.png",
    });
  });

  it("treats image/jpg as image/jpeg", () => {
    const result = validateImageUpload({
      name: "photo.jpg",
      type: "image/jpg",
      bytes: JPEG_BYTES,
    });

    expect(result.ok && result.mimeType).toBe("image/jpeg");
  });

  it("rejects empty files", () => {
    const result = validateImageUpload({
      name: "empty.png",
      type: "image/png",
      bytes: new Uint8Array(),
    });

    expect(result).toMatchObject({ ok: false, code: "empty-file" });
  });

  it("rejects files over the 5 MB limit before inspecting content", () => {
    const result = validateImageUpload({
      name: "huge.jpg",
      type: "image/jpeg",
      bytes: new Uint8Array(MAX_UPLOAD_BYTES + 1),
    });

    expect(result).toMatchObject({ ok: false, code: "file-too-large" });
  });

  it("rejects unsupported declared types", () => {
    for (const type of ["image/svg+xml", "image/gif", "application/pdf", ""]) {
      const result = validateImageUpload({ name: "file", type, bytes: PNG_BYTES });
      expect(result).toMatchObject({ ok: false, code: "unsupported-type" });
    }
  });

  it("rejects content that is not a supported raster image", () => {
    const result = validateImageUpload({ name: "logo.png", type: "image/png", bytes: SVG_BYTES });

    expect(result).toMatchObject({ ok: false, code: "invalid-content" });
  });

  it("rejects a declared type that disagrees with the bytes", () => {
    const result = validateImageUpload({ name: "photo.png", type: "image/png", bytes: JPEG_BYTES });

    expect(result).toMatchObject({ ok: false, code: "type-mismatch" });
  });

  it("covers every accepted MIME type", () => {
    expect(IMAGE_MIME_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
  });
});

describe("upload names and folders", () => {
  it("sanitises names and keeps a fallback", () => {
    expect(sanitiseUploadName("Goa / Beach -- 01.jpeg")).toBe("goa-beach-01");
    expect(sanitiseUploadName("???")).toBe("image");
    expect(sanitiseUploadName("A".repeat(200)).length).toBeLessThanOrEqual(80);
  });

  it("only allows known folders", () => {
    for (const folder of UPLOAD_FOLDERS) {
      expect(isUploadFolder(folder)).toBe(true);
    }

    expect(isUploadFolder("private")).toBe(false);
    expect(isUploadFolder(null)).toBe(false);
    expect(isUploadFolder("../hotels")).toBe(false);
  });

  it("prefixes Cloudinary folders with tripnest", () => {
    expect(cloudinaryFolder("hotels")).toBe("tripnest/hotels");
  });
});

describe("request guards", () => {
  it("requires an Origin that matches the public host", () => {
    expect(isAllowedUploadOrigin("http://localhost:3000", "localhost:3000")).toBe(true);
    expect(isAllowedUploadOrigin("https://tripnest.example", "TRIPNEST.EXAMPLE")).toBe(true);
    expect(isAllowedUploadOrigin("https://tripnest.example:443", "tripnest.example:443")).toBe(
      true,
    );
    expect(isAllowedUploadOrigin("https://tripnest.example:8443", "tripnest.example")).toBe(false);
    expect(isAllowedUploadOrigin("https://evil.example", "tripnest.example")).toBe(false);
    expect(isAllowedUploadOrigin(null, "tripnest.example")).toBe(false);
    expect(isAllowedUploadOrigin("not a url", "tripnest.example")).toBe(false);
  });

  it("prechecks multipart content length", () => {
    expect(isContentLengthAllowed(null)).toBe(true);
    expect(isContentLengthAllowed("")).toBe(true);
    expect(isContentLengthAllowed("1024")).toBe(true);
    expect(isContentLengthAllowed(String(MAX_UPLOAD_REQUEST_BYTES))).toBe(true);
    expect(isContentLengthAllowed(String(MAX_UPLOAD_REQUEST_BYTES + 1))).toBe(false);
    expect(isContentLengthAllowed("-1")).toBe(false);
    expect(isContentLengthAllowed("unknown")).toBe(false);
  });

  it("formats byte sizes for admin copy", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(MAX_UPLOAD_BYTES)).toBe("5.0 MB");
  });
});

describe("Cloudinary configuration", () => {
  it("parses the single-URL form", () => {
    expect(parseCloudinaryUrl("cloudinary://key:secret@demo-cloud")).toEqual({
      cloudName: "demo-cloud",
      apiKey: "key",
      apiSecret: "secret",
    });
  });

  it("decodes escaped credential characters", () => {
    expect(parseCloudinaryUrl("cloudinary://key%2F1:sec%40ret@demo-cloud")).toEqual({
      cloudName: "demo-cloud",
      apiKey: "key/1",
      apiSecret: "sec@ret",
    });
  });

  it("rejects malformed or incomplete URLs", () => {
    expect(parseCloudinaryUrl(undefined)).toBeNull();
    expect(parseCloudinaryUrl("")).toBeNull();
    expect(parseCloudinaryUrl("https://key:secret@demo-cloud")).toBeNull();
    expect(parseCloudinaryUrl("cloudinary://key@demo-cloud")).toBeNull();
    expect(parseCloudinaryUrl("cloudinary://:secret@demo-cloud")).toBeNull();
    expect(parseCloudinaryUrl("not a url")).toBeNull();
  });
});
