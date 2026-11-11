"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { CheckCircle2, ImageIcon, Loader2, Upload, X } from "lucide-react";
import {
  formatFileSize,
  IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_ACCEPT,
  UPLOAD_FOLDER_LABELS,
  type UploadFolder,
} from "@/lib/admin/uploads";
import { cn } from "@/lib/utils";
import { FormMessage } from "./form-controls";

export type UploadedImage = {
  publicId: string;
  url: string;
  secureUrl?: string;
  format: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
  folder: UploadFolder;
};

type UploadResponse = { ok: true; image: UploadedImage } | { ok: false; error?: string };

type ImageUploaderProps = {
  folder: UploadFolder;
  name?: string;
  initialUrl?: string;
  initialAlt?: string;
  onUploaded?: (image: UploadedImage | null) => void;
  className?: string;
};

function clientFileError(file: File): string | null {
  if (file.size === 0) return "That file is empty. Choose another image.";
  if (file.size > MAX_UPLOAD_BYTES) return "Images must be 5 MB or smaller.";

  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are supported.";
  }

  return null;
}

function isUploadResponse(value: unknown): value is UploadResponse {
  if (!value || typeof value !== "object" || !("ok" in value)) return false;
  const response = value as { ok?: unknown; image?: unknown };

  if (response.ok === true) {
    const image = response.image as { url?: unknown } | undefined;
    return Boolean(image && typeof image.url === "string");
  }

  return response.ok === false;
}

/**
 * Signed Cloudinary uploader for admin forms. The browser sends the file to
 * our route handler; the API secret never reaches the client. The hidden input
 * carries the resulting URL into the surrounding form when a `name` is given.
 */
export function ImageUploader({
  folder,
  name,
  initialUrl,
  initialAlt,
  onUploaded,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [image, setImage] = useState<{ url: string; width?: number; height?: number } | null>(
    initialUrl ? { url: initialUrl } : null,
  );
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function clearImage() {
    setImage(null);
    setError(null);
    setNotice(null);
    onUploaded?.(null);
  }

  async function handleFile(file: File) {
    const localError = clientFileError(file);

    if (localError) {
      setError(localError);
      setNotice(null);
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!isUploadResponse(payload) || payload.ok === false) {
        const message =
          isUploadResponse(payload) && payload.ok === false ? payload.error : undefined;
        throw new Error(message || "The upload did not complete. Try again.");
      }

      setImage({
        url: payload.image.url,
        width: payload.image.width,
        height: payload.image.height,
      });
      setNotice(
        `Uploaded ${formatFileSize(payload.image.bytes)} to ${UPLOAD_FOLDER_LABELS[folder]}.`,
      );
      onUploaded?.(payload.image);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The upload did not complete. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function pickFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    void handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      data-uploading={busy ? "true" : undefined}
      className={cn(
        "rounded-2xl border border-line bg-surface p-4 shadow-xs transition-colors",
        dragging && "border-brand-400 bg-brand-50/60",
        busy && "opacity-90",
        className,
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!busy) pickFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={UPLOAD_ACCEPT}
        aria-label="Choose an image to upload"
        className="sr-only"
        tabIndex={-1}
        disabled={busy}
        onChange={(event) => pickFiles(event.target.files)}
      />

      {name ? <input type="hidden" name={name} value={image?.url ?? ""} /> : null}

      {image ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
            <Image
              src={image.url}
              alt={initialAlt ?? "Uploaded image preview"}
              width={image.width ?? 640}
              height={image.height ?? 400}
              sizes="(min-width: 1024px) 28rem, 100vw"
              unoptimized
              className="h-52 w-full object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              disabled={busy}
              aria-label="Remove this image"
              className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-brand-950/75 text-white shadow-sm transition-colors hover:bg-brand-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              role="status"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success"
            >
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              {notice ?? "Image ready"}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[11px] font-extrabold text-ink-soft transition-colors hover:border-line-strong hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <Upload aria-hidden="true" className="size-3.5" />
              )}
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-canvas px-4 py-8 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            {busy ? (
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
            ) : (
              <ImageIcon aria-hidden="true" className="size-5" />
            )}
          </span>
          <p className="mt-3 text-xs font-extrabold text-ink">
            {busy ? "Uploading to Cloudinary…" : "Drop an image here"}
          </p>
          <p className="mt-1 max-w-xs text-[11px] leading-5 text-muted">
            JPEG, PNG, or WebP · up to 5 MB. Files are checked by content, not just filename.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 text-[11px] font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            ) : (
              <Upload aria-hidden="true" className="size-3.5" />
            )}
            {busy ? "Uploading…" : "Choose image"}
          </button>
          <p className="mt-2 text-[10px] font-semibold text-muted-soft">
            Saves to {UPLOAD_FOLDER_LABELS[folder]}
          </p>
        </div>
      )}

      <div aria-live="polite" className="empty:hidden">
        {busy ? (
          <p role="status" className="mt-3 text-[11px] font-semibold text-muted">
            Uploading. Keep this tab open.
          </p>
        ) : null}
        {error ? (
          <FormMessage tone="error" className="mt-3">
            {error}
          </FormMessage>
        ) : null}
      </div>
    </div>
  );
}
