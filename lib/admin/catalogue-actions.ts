"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { recordAuditEvent, requestAuditContext } from "@/lib/admin/audit";
import { invalidateCatalogueCache } from "@/lib/admin/cache";
import {
  CATALOGUE_META,
  CATALOGUE_UNIQUE_FIELDS,
  isCatalogueResource,
} from "@/lib/admin/catalogue-config";
import {
  catalogueModelName,
  catalogueFieldInUse,
  getCatalogueRecord,
  nextCatalogueSortOrder,
  writeCatalogueRecord,
} from "@/lib/admin/catalogue-data";
import { parseCatalogueForm } from "@/lib/admin/catalogue-form";
import type { CatalogueSaveState } from "@/lib/admin/catalogue-types";
import { requireAdminSession } from "@/lib/admin/session";

const conflictMessages: Record<string, string> = {
  id: "That id is already in use. Choose another.",
  slug: "That slug is already in use. Choose another.",
  code: "That promo code is already in use. Choose another.",
};

async function auditContext() {
  const requestHeaders = await headers();
  return requestAuditContext(requestHeaders);
}

export async function saveCatalogueAction(
  _previousState: CatalogueSaveState,
  formData: FormData,
): Promise<CatalogueSaveState> {
  const session = await requireAdminSession();
  const resourceValue = formData.get("_resource");

  if (!isCatalogueResource(resourceValue)) {
    return { status: "error", message: "Unknown catalogue section." };
  }

  const resource = resourceValue;
  const meta = CATALOGUE_META[resource];
  const recordIdValue = formData.get("_recordId");
  const recordId =
    typeof recordIdValue === "string" && recordIdValue.trim() ? recordIdValue.trim() : undefined;

  const existing = recordId ? await getCatalogueRecord(resource, recordId) : null;

  if (recordId && !existing) {
    return {
      status: "error",
      message: "That record no longer exists. Return to the list and try again.",
    };
  }

  const parsed = parseCatalogueForm(resource, formData, {
    fixedId: existing ? String(existing.id ?? recordId) : undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.message,
      fieldErrors: parsed.fieldErrors,
    };
  }

  const data = parsed.data;
  const dataId = String(data.id ?? "");
  const { ip, userAgent } = await auditContext();

  const conflicts: Record<string, string> = {};

  if (!existing && (await catalogueFieldInUse(resource, "id", dataId))) {
    conflicts.id = conflictMessages.id;
  }

  for (const field of CATALOGUE_UNIQUE_FIELDS[resource]) {
    const value = data[field];
    if (value === undefined || value === "") continue;

    if (await catalogueFieldInUse(resource, field, value, existing ? dataId : undefined)) {
      conflicts[field] = conflictMessages[field] ?? "That value is already in use.";
    }
  }

  if (Object.keys(conflicts).length > 0) {
    await recordAuditEvent({
      action: "catalogue.rejected",
      outcome: "rejected",
      actor: session.email,
      ip,
      userAgent,
      target: `${resource}/${dataId}`,
      message: "Catalogue save rejected because a unique field was already in use.",
      metadata: {
        resource,
        recordId: dataId,
        reason: "duplicate",
      },
    });

    return {
      status: "error",
      message: "A unique value is already in use. Check the highlighted fields.",
      fieldErrors: conflicts,
    };
  }

  const sortOrder = existing
    ? typeof existing.sort_order === "number"
      ? existing.sort_order
      : await nextCatalogueSortOrder(resource)
    : await nextCatalogueSortOrder(resource);

  try {
    await writeCatalogueRecord(resource, data, {
      existingId: existing ? dataId : undefined,
      sortOrder,
    });
  } catch (error) {
    console.error(`Failed to save ${resource} record ${dataId}`, error);

    await recordAuditEvent({
      action: "catalogue.rejected",
      outcome: "failed",
      actor: session.email,
      ip,
      userAgent,
      target: `${resource}/${dataId}`,
      message: "Catalogue save failed while writing to MongoDB.",
      metadata: {
        resource,
        recordId: dataId,
        reason: "write-failed",
      },
    });

    return {
      status: "error",
      message: "The record could not be saved. Check the values and try again.",
    };
  }

  const action = existing ? "catalogue.updated" : "catalogue.created";
  const titleValue = data[meta.titleField];

  // Clear the public process cache before redirecting so the next page load
  // reads the new document.
  invalidateCatalogueCache(catalogueModelName(resource));

  await recordAuditEvent({
    action,
    outcome: "success",
    actor: session.email,
    ip,
    userAgent,
    target: `${resource}/${dataId}`,
    message: `${existing ? "Updated" : "Created"} ${meta.singular} ${dataId}.`,
    metadata: {
      resource,
      recordId: dataId,
      sortOrder,
      title: typeof titleValue === "string" ? titleValue.slice(0, 200) : undefined,
    },
  });

  redirect(
    `/admin/${resource}?saved=${encodeURIComponent(dataId)}&mode=${
      existing ? "updated" : "created"
    }`,
  );
}
