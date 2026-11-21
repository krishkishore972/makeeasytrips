import { Types } from "mongoose";
import { enquiryServiceValues, type EnquiryService } from "@/lib/enquiry";
import { EnquiryModel, enquiryStatusValues, type EnquiryStatus } from "@/lib/models/enquiry";
import dbConnect from "@/lib/mongodb";
import { safeItemHref } from "@/lib/admin/stats";

export const ENQUIRIES_PAGE_SIZE = 25;
type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseEnquiryFilters(params: Params) {
  const service = one(params.service);
  const status = one(params.status);
  const q = (one(params.q) ?? "").trim().slice(0, 100);
  const date = (value: string | undefined) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
      ? undefined
      : value;
  };
  const pageValue = Number(one(params.page));
  return {
    service: enquiryServiceValues.includes(service as EnquiryService)
      ? (service as EnquiryService)
      : undefined,
    status: enquiryStatusValues.includes(status as EnquiryStatus)
      ? (status as EnquiryStatus)
      : undefined,
    q,
    from: date(one(params.from)),
    to: date(one(params.to)),
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 10000) : 1,
  };
}
export type EnquiryFilters = ReturnType<typeof parseEnquiryFilters>;

export function enquiryMongoFilter(filters: EnquiryFilters): Record<string, unknown> {
  const clauses: Record<string, unknown>[] = [];
  if (filters.service) clauses.push({ service: filters.service });
  if (filters.status === "new") clauses.push({ $or: [{ status: "new" }, { status: null }] });
  else if (filters.status) clauses.push({ status: filters.status });
  if (filters.q) {
    const literal = filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    clauses.push({
      $or: ["name", "phone", "title", "itemId"].map((field) => ({
        [field]: { $regex: literal, $options: "i" },
      })),
    });
  }
  if (filters.from || filters.to) {
    const createdAt: Record<string, Date> = {};
    if (filters.from) createdAt.$gte = new Date(`${filters.from}T00:00:00+05:30`);
    if (filters.to)
      createdAt.$lt = new Date(new Date(`${filters.to}T00:00:00+05:30`).getTime() + 86400000);
    clauses.push({ createdAt });
  }
  return clauses.length ? { $and: clauses } : {};
}

type EnquiryDoc = {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  service: EnquiryService;
  title: string;
  context?: string[];
  details?: string;
  itemId?: string;
  itemHref?: string;
  status?: EnquiryStatus | null;
  createdAt?: Date;
};
export function serialiseEnquiry(row: EnquiryDoc) {
  return {
    id: String(row._id),
    name: row.name,
    phone: row.phone,
    service: row.service,
    title: row.title,
    context: row.context ?? [],
    details: row.details,
    itemId: row.itemId,
    itemHref: safeItemHref(row.itemHref),
    status: row.status ?? ("new" as EnquiryStatus),
    createdAt: row.createdAt?.toISOString() ?? "",
  };
}

export async function listEnquiries(filters: EnquiryFilters) {
  await dbConnect();
  const filter = enquiryMongoFilter(filters);
  const [total, rows] = await Promise.all([
    EnquiryModel.countDocuments(filter),
    EnquiryModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((filters.page - 1) * ENQUIRIES_PAGE_SIZE)
      .limit(ENQUIRIES_PAGE_SIZE)
      .lean<EnquiryDoc[]>()
      .exec(),
  ]);
  return { total, rows: rows.map(serialiseEnquiry) };
}

export async function getEnquiry(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  await dbConnect();
  const row = await EnquiryModel.findById(id).lean<EnquiryDoc | null>().exec();
  return row ? serialiseEnquiry(row) : null;
}
