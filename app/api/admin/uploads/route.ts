import { recordAuditEvent, requestAuditContext } from "@/lib/admin/audit";
import { isCloudinaryConfigured, uploadCatalogueImage } from "@/lib/admin/cloudinary";
import { getAdminSession } from "@/lib/admin/session";
import {
  DEFAULT_UPLOAD_FOLDER,
  isAllowedUploadOrigin,
  isContentLengthAllowed,
  isUploadFolder,
  MAX_UPLOAD_BYTES,
  validateImageUpload,
  type UploadValidationResult,
} from "@/lib/admin/uploads";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

function rejectionStatus(result: Extract<UploadValidationResult, { ok: false }>): number {
  if (result.code === "file-too-large") return 413;
  if (result.code === "unsupported-type" || result.code === "invalid-content") return 415;
  if (result.code === "type-mismatch") return 415;
  return 400;
}

function publicHost(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-host");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().toLowerCase() || null;
  }

  return headers.get("host")?.trim().toLowerCase() || null;
}

export async function POST(request: Request): Promise<Response> {
  const session = await getAdminSession();

  if (!session) {
    return json({ ok: false, error: "Sign in again to upload images." }, 401);
  }

  const headers = request.headers;
  const origin = headers.get("origin");
  const host = publicHost(headers);
  const { ip, userAgent } = requestAuditContext(headers);
  const actor = session.email;

  if (!isAllowedUploadOrigin(origin, host)) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: "origin-check",
      message: "Upload request origin did not match the admin host.",
    });

    return json({ ok: false, error: "This upload request was not sent by the admin site." }, 403);
  }

  if (!isContentLengthAllowed(headers.get("content-length"))) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: "content-length",
      message: "Upload request body exceeded the 5 MB limit.",
    });

    return json({ ok: false, error: "Images must be 5 MB or smaller." }, 413);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, error: "Send the image as multipart form data." }, 400);
  }

  const file = formData.get("file");
  const folderValue = formData.get("folder");

  if (!(file instanceof File)) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: "form-data",
      message: "Upload request did not include a file part.",
    });

    return json({ ok: false, error: "Choose an image to upload." }, 400);
  }

  const folder = folderValue === null ? DEFAULT_UPLOAD_FOLDER : folderValue;

  if (!isUploadFolder(folder)) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: String(folder),
      message: "Upload request used an unknown Cloudinary folder.",
    });

    return json({ ok: false, error: "Choose a valid media folder." }, 400);
  }

  if (file.size === 0) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: file.name,
      message: "Uploaded file was empty.",
    });

    return json({ ok: false, error: "Choose an image to upload." }, 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: file.name,
      message: "Uploaded file exceeded the 5 MB limit.",
    });

    return json({ ok: false, error: "Images must be 5 MB or smaller." }, 413);
  }

  if (!isCloudinaryConfigured()) {
    console.error("Admin upload attempted before Cloudinary credentials were configured.");

    await recordAuditEvent({
      action: "upload.failed",
      outcome: "failed",
      actor,
      ip,
      userAgent,
      target: file.name,
      message: "Cloudinary credentials are not configured.",
    });

    return json({ ok: false, error: "Image storage is not configured on this server." }, 503);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateImageUpload({
    name: file.name,
    type: file.type,
    bytes,
  });

  if (!validation.ok) {
    await recordAuditEvent({
      action: "upload.rejected",
      outcome: "rejected",
      actor,
      ip,
      userAgent,
      target: file.name,
      message: `${validation.code}: ${validation.message}`,
      metadata: { folder, bytes: file.size, mimeType: file.type },
    });

    return json({ ok: false, error: validation.message }, rejectionStatus(validation));
  }

  try {
    const image = await uploadCatalogueImage({
      bytes,
      folder,
      fileName: validation.suggestedName,
      extension: validation.extension,
      mimeType: validation.mimeType,
    });

    await recordAuditEvent({
      action: "upload.created",
      outcome: "success",
      actor,
      ip,
      userAgent,
      target: image.publicId,
      message: `Uploaded ${validation.suggestedName} to ${folder}.`,
      metadata: {
        folder,
        url: image.url,
        publicId: image.publicId,
        format: image.format,
        mimeType: image.mimeType,
        bytes: image.bytes,
        width: image.width,
        height: image.height,
      },
    });

    return json({ ok: true, image }, 201);
  } catch (error) {
    console.error("Cloudinary upload failed", error);

    await recordAuditEvent({
      action: "upload.failed",
      outcome: "failed",
      actor,
      ip,
      userAgent,
      target: validation.suggestedName,
      message: error instanceof Error ? error.message : "Cloudinary upload failed.",
      metadata: { folder, bytes: file.size, mimeType: validation.mimeType },
    });

    return json({ ok: false, error: "Cloudinary could not store that image. Try again." }, 502);
  }
}
