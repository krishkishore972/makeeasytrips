import type { Model } from "mongoose";
import type { CatalogueResource } from "@/lib/admin/catalogue-config";
import { summariseCatalogueRecord, type CatalogueSummary } from "@/lib/admin/catalogue-summary";
import { carSchema } from "@/lib/data/schemas";
import { CarModel, EventModel, HolidayModel, HotelModel, OfferModel } from "@/lib/models";
import dbConnect from "@/lib/mongodb";

type AnyDoc = Record<string, unknown>;

const models = {
  events: EventModel,
  hotels: HotelModel,
  holidays: HolidayModel,
  cars: CarModel,
  offers: OfferModel,
} as const;

function modelFor(resource: CatalogueResource): Model<AnyDoc> {
  return models[resource] as unknown as Model<AnyDoc>;
}

const adminProjection = {
  _id: 0,
  createdAt: 0,
  updatedAt: 0,
} as const;

/**
 * Admin reads intentionally bypass `readCollection`. The public catalogue is
 * process-cached, so an editor must always read the current database row; the
 * save action clears that cache afterwards.
 */
export async function listCatalogueRecords(
  resource: CatalogueResource,
): Promise<CatalogueSummary[]> {
  await dbConnect();

  const docs = await modelFor(resource)
    .find({}, adminProjection)
    .sort({ sort_order: 1 })
    .lean<AnyDoc[]>()
    .exec();

  return docs.flatMap((doc) => {
    const summary = summariseCatalogueRecord(
      resource,
      resource === "cars" ? { ...doc, ...carSchema.parse(doc) } : doc,
    );
    return summary ? [summary] : [];
  });
}

export async function getCatalogueRecord(
  resource: CatalogueResource,
  id: string,
): Promise<AnyDoc | null> {
  await dbConnect();

  const doc = await modelFor(resource).findOne({ id }, adminProjection).lean<AnyDoc>().exec();
  return doc && resource === "cars" ? { ...doc, ...carSchema.parse(doc) } : doc;
}

export async function nextCatalogueSortOrder(resource: CatalogueResource): Promise<number> {
  await dbConnect();

  const top = await modelFor(resource)
    .findOne()
    .sort({ sort_order: -1 })
    .select({ sort_order: 1 })
    .lean<{ sort_order?: number }>()
    .exec();

  return (typeof top?.sort_order === "number" ? top.sort_order : -1) + 1;
}

/**
 * Uniqueness checks run before every write so the operator sees a field-level
 * message instead of a raw duplicate-key error.
 */
export async function catalogueFieldInUse(
  resource: CatalogueResource,
  field: string,
  value: unknown,
  excludeId?: string,
): Promise<boolean> {
  await dbConnect();

  const filter: Record<string, unknown> = { [field]: value };
  if (excludeId && field !== "id") {
    filter.id = { $ne: excludeId };
  }

  const match = await modelFor(resource).exists(filter);
  return Boolean(match);
}

export type WriteCatalogueOptions = {
  existingId?: string;
  sortOrder: number;
};

export async function writeCatalogueRecord(
  resource: CatalogueResource,
  data: Record<string, unknown>,
  { existingId, sortOrder }: WriteCatalogueOptions,
): Promise<void> {
  await dbConnect();

  const payload: Record<string, unknown> = { ...data, sort_order: sortOrder };

  if (existingId) {
    const unsetImage = resource === "offers" && !data.image;
    if (unsetImage) delete payload.image;
    await modelFor(resource)
      .updateOne(
        { id: existingId },
        { $set: payload, ...(unsetImage ? { $unset: { image: 1 } } : {}) },
        { runValidators: true },
      )
      .exec();
    return;
  }

  await modelFor(resource).create(payload);
}

export function catalogueModelName(resource: CatalogueResource): string {
  return modelFor(resource).modelName;
}

export async function allOtherCatalogueImages(
  resource: CatalogueResource,
  id: string,
): Promise<string[]> {
  await dbConnect();
  const docs = await Promise.all(
    (Object.keys(models) as CatalogueResource[]).map((key) =>
      modelFor(key)
        .find(key === resource ? { id: { $ne: id } } : {}, { _id: 0, image: 1, gallery: 1 })
        .lean<AnyDoc[]>()
        .exec(),
    ),
  );
  const { catalogueImageUrls } = await import("@/lib/admin/catalogue-images");
  return docs.flat().flatMap(catalogueImageUrls);
}

export async function deleteCatalogueRecord(
  resource: CatalogueResource,
  id: string,
): Promise<boolean> {
  await dbConnect();
  const result = await modelFor(resource).deleteOne({ id }).exec();
  return result.deletedCount === 1;
}
