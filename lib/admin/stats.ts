import { ENQUIRY_SERVICE_LABELS, enquiryServiceValues, type EnquiryService } from "@/lib/enquiry";
import dbConnect from "@/lib/mongodb";
import { ContactMessageModel } from "@/lib/models/contact-message";
import { EnquiryModel, enquiryStatusValues, type EnquiryStatus } from "@/lib/models/enquiry";
import { NewsletterSubscriberModel } from "@/lib/models/newsletter-subscriber";

export const STATS_RANGE_VALUES = [7, 30, 90] as const;
export type StatsRange = (typeof STATS_RANGE_VALUES)[number];
export const DEFAULT_STATS_RANGE: StatsRange = 30;

/** The trend sparkline always shows a month, even when the filter is 7 days. */
const TREND_DAYS = 30;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const ITEM_HREF_PATTERN = /^\/(?:hotels|holidays|rent-a-car|flights)\/[a-z0-9][a-z0-9-]*$/i;

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export function parseStatsRange(value: unknown): StatsRange {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return STATS_RANGE_VALUES.includes(parsed as StatsRange)
    ? (parsed as StatsRange)
    : DEFAULT_STATS_RANGE;
}

/**
 * Start of the Indian calendar day, `daysAgo` days before the given instant.
 * India has a fixed +05:30 offset, so no timezone database is needed.
 */
export function istDayStart(date: Date, daysAgo = 0): Date {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const midnightUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - daysAgo,
  );

  return new Date(midnightUtc - IST_OFFSET_MS);
}

export function istDayKey(date: Date): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function safeItemHref(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return ITEM_HREF_PATTERN.test(value) ? value : undefined;
}

export type StatsEnquiryRow = {
  id?: string | null;
  name?: string | null;
  phone?: string | null;
  service: EnquiryService;
  title: string;
  itemId?: string | null;
  itemHref?: string | null;
  status?: EnquiryStatus | null;
  createdAt: Date | string;
};

export type StatsServiceSlice = {
  service: EnquiryService;
  label: string;
  count: number;
};

export type StatsStatusSlice = {
  status: EnquiryStatus;
  label: string;
  count: number;
};

export type StatsPopularItem = {
  key: string;
  service: EnquiryService;
  serviceLabel: string;
  title: string;
  href?: string;
  count: number;
  lastAt: string;
};

export type StatsTrendPoint = {
  date: string;
  count: number;
};

export type StatsRecentEnquiry = {
  id: string | null;
  name: string;
  phone: string;
  service: EnquiryService;
  serviceLabel: string;
  title: string;
  href?: string;
  status: EnquiryStatus;
  createdAt: string;
};

export type EnquiryStatsSummary = {
  range: StatsRange;
  enquiriesInRange: number;
  serviceSplit: StatsServiceSlice[];
  statusSplit: StatsStatusSlice[];
  trend: StatsTrendPoint[];
  topItems: StatsPopularItem[];
  recentEnquiries: StatsRecentEnquiry[];
};

export type AdminStats = EnquiryStatsSummary & {
  generatedAt: string;
  totals: {
    enquiries: number;
    newsletter: number;
    newsletterInRange: number;
    contact: number;
    contactInRange: number;
  };
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function statusOf(value: EnquiryStatus | null | undefined): EnquiryStatus {
  return value && enquiryStatusValues.includes(value) ? value : "new";
}

/**
 * Pure aggregation over enquiry rows. Kept separate from Mongo so the range,
 * grouping, and trend rules can be tested without a database.
 */
export function buildEnquiryStats(
  enquiries: readonly StatsEnquiryRow[],
  options: { range: StatsRange; now?: Date },
): EnquiryStatsSummary {
  const now = options.now ?? new Date();
  const rangeStart = istDayStart(now, options.range - 1);
  const trendStart = istDayStart(now, TREND_DAYS - 1);

  const inRange = enquiries
    .map((row) => ({ row, date: toDate(row.createdAt) }))
    .filter(({ date }) => !Number.isNaN(date.getTime()) && date >= rangeStart)
    .sort((left, right) => right.date.getTime() - left.date.getTime());

  const serviceCounts = new Map<EnquiryService, number>(
    enquiryServiceValues.map((service) => [service, 0]),
  );
  const statusCounts = new Map<EnquiryStatus, number>(
    enquiryStatusValues.map((status) => [status, 0]),
  );

  for (const { row } of inRange) {
    serviceCounts.set(row.service, (serviceCounts.get(row.service) ?? 0) + 1);
    const status = statusOf(row.status);
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  const popular = new Map<
    string,
    {
      service: EnquiryService;
      title: string;
      itemId?: string;
      href?: string;
      count: number;
      lastAt: number;
    }
  >();

  for (const { row, date } of inRange) {
    const itemId = row.itemId?.trim() || undefined;
    const href = safeItemHref(row.itemHref);
    const key = `${row.service}:${itemId ?? href ?? row.title.trim().toLowerCase()}`;
    const existing = popular.get(key);

    if (existing) {
      existing.count += 1;
      if (date.getTime() > existing.lastAt) {
        existing.lastAt = date.getTime();
        existing.title = row.title;
      }
      if (!existing.href && href) existing.href = href;
      if (!existing.itemId && itemId) existing.itemId = itemId;
      continue;
    }

    popular.set(key, {
      service: row.service,
      title: row.title,
      itemId,
      href,
      count: 1,
      lastAt: date.getTime(),
    });
  }

  const topItems: StatsPopularItem[] = Array.from(popular.entries())
    .map(([key, item]) => ({
      key,
      service: item.service,
      serviceLabel: ENQUIRY_SERVICE_LABELS[item.service],
      title: item.title,
      href: item.href,
      count: item.count,
      lastAt: new Date(item.lastAt).toISOString(),
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        Date.parse(right.lastAt) - Date.parse(left.lastAt) ||
        left.title.localeCompare(right.title),
    )
    .slice(0, 10);

  const trendCounts = new Map<string, number>();

  for (const row of enquiries) {
    const date = toDate(row.createdAt);
    if (Number.isNaN(date.getTime()) || date < trendStart) continue;
    const key = istDayKey(date);
    trendCounts.set(key, (trendCounts.get(key) ?? 0) + 1);
  }

  const trend: StatsTrendPoint[] = Array.from({ length: TREND_DAYS }, (_, index) => {
    const date = istDayKey(istDayStart(now, TREND_DAYS - 1 - index));
    return { date, count: trendCounts.get(date) ?? 0 };
  });

  return {
    range: options.range,
    enquiriesInRange: inRange.length,
    serviceSplit: enquiryServiceValues.map((service) => ({
      service,
      label: ENQUIRY_SERVICE_LABELS[service],
      count: serviceCounts.get(service) ?? 0,
    })),
    statusSplit: enquiryStatusValues.map((status) => ({
      status,
      label: ENQUIRY_STATUS_LABELS[status],
      count: statusCounts.get(status) ?? 0,
    })),
    trend,
    topItems,
    recentEnquiries: inRange.slice(0, 8).map(({ row, date }) => ({
      id: row.id ?? null,
      name: row.name?.trim() || "Unknown",
      phone: row.phone?.trim() || "",
      service: row.service,
      serviceLabel: ENQUIRY_SERVICE_LABELS[row.service],
      title: row.title,
      href: safeItemHref(row.itemHref),
      status: statusOf(row.status),
      createdAt: date.toISOString(),
    })),
  };
}

type EnquiryDocument = {
  _id: unknown;
  name?: string;
  phone?: string;
  service: EnquiryService;
  title: string;
  itemId?: string;
  itemHref?: string;
  status?: EnquiryStatus;
  createdAt: Date;
};

/**
 * Live admin reads. Unlike the public catalogue, nothing here is cached: the
 * dashboard should reflect an enquiry the moment MongoDB has it.
 */
export async function getAdminStats(range: StatsRange): Promise<AdminStats> {
  await dbConnect();

  const now = new Date();
  const queryStart = istDayStart(now, Math.max(range, TREND_DAYS) - 1);
  const rangeStart = istDayStart(now, range - 1);

  const [
    documents,
    totalEnquiries,
    totalNewsletter,
    totalContact,
    newsletterInRange,
    contactInRange,
  ] = await Promise.all([
    EnquiryModel.find({ createdAt: { $gte: queryStart } })
      .select({
        _id: 1,
        name: 1,
        phone: 1,
        service: 1,
        title: 1,
        itemId: 1,
        itemHref: 1,
        status: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .lean<EnquiryDocument[]>()
      .exec(),
    EnquiryModel.countDocuments().exec(),
    NewsletterSubscriberModel.countDocuments().exec(),
    ContactMessageModel.countDocuments().exec(),
    NewsletterSubscriberModel.countDocuments({ createdAt: { $gte: rangeStart } }).exec(),
    ContactMessageModel.countDocuments({ createdAt: { $gte: rangeStart } }).exec(),
  ]);

  const enquiries: StatsEnquiryRow[] = documents.map((document) => ({
    id: document._id ? String(document._id) : null,
    name: document.name,
    phone: document.phone,
    service: document.service,
    title: document.title,
    itemId: document.itemId,
    itemHref: document.itemHref,
    status: document.status,
    createdAt: document.createdAt,
  }));

  const summary = buildEnquiryStats(enquiries, { range, now });

  return {
    ...summary,
    generatedAt: now.toISOString(),
    totals: {
      enquiries: totalEnquiries,
      newsletter: totalNewsletter,
      newsletterInRange,
      contact: totalContact,
      contactInRange,
    },
  };
}
