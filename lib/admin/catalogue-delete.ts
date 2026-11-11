"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { recordAuditEvent, requestAuditContext } from "@/lib/admin/audit";
import { invalidateCatalogueCache } from "@/lib/admin/cache";
import { isCatalogueResource } from "@/lib/admin/catalogue-config";
import {
  allOtherCatalogueImages,
  catalogueModelName,
  deleteCatalogueRecord,
  getCatalogueRecord,
} from "@/lib/admin/catalogue-data";
import { catalogueImageId, catalogueImageUrls } from "@/lib/admin/catalogue-images";
import { destroyCatalogueImage, getCloudinaryCredentials } from "@/lib/admin/cloudinary";
import { requireAdminSession } from "@/lib/admin/session";

export async function deleteCatalogueAction(
  _state: { error?: string },
  form: FormData,
): Promise<{ error?: string }> {
  const session = await requireAdminSession();
  const resource = form.get("resource");
  const id = form.get("id");
  if (!isCatalogueResource(resource) || typeof id !== "string" || !id.trim())
    return { error: "Invalid listing." };

  const context = requestAuditContext(await headers());
  try {
    const record = await getCatalogueRecord(resource, id);
    if (!record) return { error: "This listing no longer exists." };
    const urls = catalogueImageUrls(record);
    const cloudUrls = urls.filter((url) => {
      try {
        return new URL(url).hostname === "res.cloudinary.com";
      } catch {
        return false;
      }
    });
    const credentials = getCloudinaryCredentials();
    if (cloudUrls.length && !credentials)
      throw new Error("Cloudinary is not configured; the listing was not deleted.");
    const ids = cloudUrls.map((url) => catalogueImageId(url, credentials!.cloudName));
    if (ids.some((value) => !value))
      throw new Error(
        "A Cloudinary image is outside the managed upload folders; the listing was not deleted.",
      );
    const otherUrls = await allOtherCatalogueImages(resource, id);
    const used = new Set(
      otherUrls.map((url) => catalogueImageId(url, credentials?.cloudName ?? "")).filter(Boolean),
    );
    for (const publicId of new Set(ids)) {
      if (publicId && !used.has(publicId)) await destroyCatalogueImage(publicId);
    }
    if (!(await deleteCatalogueRecord(resource, id)))
      throw new Error("This listing no longer exists.");
    invalidateCatalogueCache(catalogueModelName(resource));
    await recordAuditEvent({
      action: "catalogue.deleted",
      outcome: "success",
      actor: session.email,
      ...context,
      target: `${resource}/${id}`,
      message: "Deleted catalogue listing and its unshared managed images.",
      metadata: { resource, recordId: id },
    });
  } catch (error) {
    console.error("Catalogue deletion failed", error);
    await recordAuditEvent({
      action: "catalogue.rejected",
      outcome: "failed",
      actor: session.email,
      ...context,
      target: `${resource}/${id}`,
      message: "Catalogue deletion failed.",
      metadata: { resource, recordId: id, reason: "delete-failed" },
    });
    return {
      error:
        error instanceof Error &&
        (error.message.includes("listing") || error.message.includes("Cloudinary image"))
          ? error.message
          : "Deletion failed. The listing may remain, but some photos may already have been deleted. Please retry.",
    };
  }
  redirect(`/admin/${resource}?deleted=${encodeURIComponent(id)}`);
}
