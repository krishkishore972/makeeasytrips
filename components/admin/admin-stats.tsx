import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CarFront,
  CircleAlert,
  Clock3,
  Database,
  ImageIcon,
  Inbox,
  Mail,
  MessageSquare,
  Plane,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { EnquiryService } from "@/lib/enquiry";
import type { EnquiryStatus } from "@/lib/models/enquiry";
import {
  ENQUIRY_STATUS_LABELS,
  STATS_RANGE_VALUES,
  type AdminStats,
  type StatsRange,
  type StatsStatusSlice,
} from "@/lib/admin/stats";
import { cn } from "@/lib/utils";

const SERVICE_ICONS: Record<EnquiryService, LucideIcon> = {
  flight: Plane,
  hotel: Building2,
  holiday: CalendarDays,
  car: CarFront,
};

const SERVICE_STYLES: Record<EnquiryService, string> = {
  flight: "bg-sky-50 text-sky-700",
  hotel: "bg-brand-50 text-brand-700",
  holiday: "bg-gold-100 text-gold-600",
  car: "bg-success-soft text-success",
};

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-brand-50 text-brand-800",
  contacted: "bg-warning-soft text-warning",
  closed: "bg-success-soft text-success",
};

const RANGE_LABELS: Record<StatsRange, string> = {
  7: "7 days",
  30: "30 days",
  90: "90 days",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dayFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
});

const fullNumber = new Intl.NumberFormat("en-IN");

function formatDateTime(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

function formatDay(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);

  return Number.isNaN(date.getTime()) ? value : dayFormatter.format(date);
}

function plural(value: number, singular: string, pluralForm = `${singular}s`): string {
  return `${fullNumber.format(value)} ${value === 1 ? singular : pluralForm}`;
}

type AdminStatsProps = {
  email: string;
  stats: AdminStats;
};

export function AdminStatsView({ email, stats }: AdminStatsProps) {
  const serviceTotal = stats.serviceSplit.reduce((sum, slice) => sum + slice.count, 0);
  const maxService = Math.max(1, ...stats.serviceSplit.map((slice) => slice.count));
  const maxTrend = Math.max(1, ...stats.trend.map((point) => point.count));
  const topService = [...stats.serviceSplit].sort((left, right) => right.count - left.count)[0];
  const newCount = stats.statusSplit.find((slice) => slice.status === "new")?.count ?? 0;
  const trendTotal = stats.trend.reduce((sum, point) => sum + point.count, 0);

  const metrics = [
    {
      label: "Enquiries",
      value: fullNumber.format(stats.enquiriesInRange),
      detail: `in the last ${RANGE_LABELS[stats.range]} · ${fullNumber.format(stats.totals.enquiries)} all time`,
      icon: Inbox,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "New leads",
      value: fullNumber.format(newCount),
      detail: `awaiting a first reply · ${fullNumber.format(stats.enquiriesInRange - newCount)} handled`,
      icon: Clock3,
      tone: "bg-warning-soft text-warning",
    },
    {
      label: "Newsletter",
      value: fullNumber.format(stats.totals.newsletterInRange),
      detail: `new in range · ${fullNumber.format(stats.totals.newsletter)} subscribers`,
      icon: Mail,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Contact messages",
      value: fullNumber.format(stats.totals.contactInRange),
      detail: `new in range · ${fullNumber.format(stats.totals.contact)} all time`,
      icon: MessageSquare,
      tone: "bg-success-soft text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Overview</p>
            <h1 className="mt-2 text-[clamp(1.7rem,3.4vw,2.3rem)] leading-tight">
              The enquiry desk at a glance.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Signed in as <span className="font-bold text-ink">{email}</span>. Counts are read live
              from MongoDB, so a new enquiry appears on the next load.
            </p>
          </div>

          <nav aria-label="Stats range" className="shrink-0">
            <p className="mb-1.5 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
              Range
            </p>
            <div className="inline-flex rounded-xl border border-line bg-canvas p-1">
              {STATS_RANGE_VALUES.map((range) => {
                const active = range === stats.range;

                return (
                  <Link
                    key={range}
                    href={range === 30 ? "/admin" : `/admin?range=${range}`}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-8 items-center rounded-lg px-3 text-[11px] font-extrabold transition-colors",
                      active
                        ? "bg-brand-700 text-white shadow-sm"
                        : "text-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {RANGE_LABELS[range]}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1.5 text-[10px] font-semibold text-muted-soft">
          <Clock3 aria-hidden="true" className="size-3" />
          Updated {formatDateTime(stats.generatedAt)} IST
        </p>
      </section>

      <section aria-label="Key metrics">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
            <article
              key={label}
              className="rounded-2xl border border-line bg-surface p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn("grid size-9 place-items-center rounded-xl", tone)}>
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <TrendingUp aria-hidden="true" className="size-4 text-muted-soft" />
              </div>
              <p className="mt-3 text-3xl leading-none font-extrabold tracking-tight text-ink">
                {value}
              </p>
              <h2 className="mt-1 text-xs font-extrabold text-ink-soft">{label}</h2>
              <p className="mt-1 text-[10px] leading-4 text-muted">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
        <section
          aria-labelledby="trend-heading"
          className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="trend-heading" className="flex items-center gap-2 text-xl leading-tight">
                <BarChart3 aria-hidden="true" className="size-4 text-brand-600" />
                Daily enquiries
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                Last 30 days · {plural(trendTotal, "enquiry", "enquiries")}
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-brand-800 uppercase">
              IST
            </span>
          </div>

          <figure className="mt-6">
            <div className="flex h-36 items-end gap-1" aria-hidden="true">
              {stats.trend.map((point) => (
                <div
                  key={point.date}
                  className="flex h-full flex-1 items-end"
                  title={`${formatDay(point.date)}: ${plural(point.count, "enquiry", "enquiries")}`}
                >
                  <span
                    className={cn(
                      "w-full rounded-t-[3px] transition-colors",
                      point.count === 0 ? "bg-brand-100" : "bg-brand-600",
                    )}
                    style={{
                      height: `${Math.max(point.count === 0 ? 3 : 7, (point.count / maxTrend) * 100)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-muted-soft">
              <span>{formatDay(stats.trend[0]?.date ?? "")}</span>
              <span>Today</span>
            </div>
            <figcaption className="sr-only">
              Daily enquiry counts for the last 30 days. The same values are listed in the table
              below.
            </figcaption>
            <table className="sr-only">
              <caption>Daily enquiry counts, last 30 days</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Enquiries</th>
                </tr>
              </thead>
              <tbody>
                {stats.trend.map((point) => (
                  <tr key={point.date}>
                    <th scope="row">{point.date}</th>
                    <td>{point.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </section>

        <div className="space-y-6">
          <section
            aria-labelledby="service-heading"
            className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
          >
            <h2 id="service-heading" className="text-xl leading-tight">
              Service mix
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              {serviceTotal === 0
                ? "No enquiries in this range yet."
                : `Across ${plural(serviceTotal, "enquiry", "enquiries")} in range.`}
            </p>

            <ul className="mt-4 space-y-3">
              {stats.serviceSplit.map((slice) => {
                const Icon = SERVICE_ICONS[slice.service];

                return (
                  <li key={slice.service}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-ink-soft">
                        <Icon aria-hidden="true" className="size-3.5 text-muted" />
                        {slice.label}
                      </span>
                      <span className="font-extrabold text-ink">
                        {fullNumber.format(slice.count)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          slice.count === maxService ? "bg-brand-700" : "bg-brand-400",
                        )}
                        style={{ width: `${(slice.count / maxService) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
              {stats.statusSplit.map((slice) => (
                <StatusTile key={slice.status} slice={slice} />
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-brand-950 p-5 text-white shadow-xs sm:p-6">
            <p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.12em] text-brand-200 uppercase">
              <TrendingUp aria-hidden="true" className="size-3.5" />
              Busiest service
            </p>
            <p className="mt-2 text-2xl leading-tight font-extrabold">
              {topService && topService.count > 0 ? topService.label : "No enquiries yet"}
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-brand-100/75">
              {topService && topService.count > 0
                ? `${plural(topService.count, "enquiry", "enquiries")} in the last ${RANGE_LABELS[stats.range]}.`
                : "Once enquiries arrive, the leading service and repeat interest will appear here."}
            </p>
          </section>
        </div>
      </div>

      <section
        aria-labelledby="top-items-heading"
        className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="top-items-heading" className="text-xl leading-tight">
              Most enquired items
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Top 10 stays, packages, cars, and flights in the last {RANGE_LABELS[stats.range]}.
            </p>
          </div>
          <span className="rounded-full bg-canvas px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-muted uppercase">
            By enquiry count
          </span>
        </div>

        {stats.topItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left text-xs">
              <thead>
                <tr className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                  <th scope="col" className="w-10 pb-2">
                    #
                  </th>
                  <th scope="col" className="pb-2">
                    Item
                  </th>
                  <th scope="col" className="pb-2">
                    Service
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Enquiries
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Last
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topItems.map((item, index) => (
                  <tr key={item.key} className="border-t border-line">
                    <td className="py-3 font-extrabold text-muted-soft">{index + 1}</td>
                    <td className="max-w-[18rem] py-3 pr-3">
                      {item.href ? (
                        <Link
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-extrabold text-ink underline-offset-2 hover:text-brand-700 hover:underline"
                        >
                          <span className="line-clamp-1">{item.title}</span>
                          <ArrowUpRight aria-hidden="true" className="size-3 shrink-0" />
                        </Link>
                      ) : (
                        <span className="font-extrabold text-ink">{item.title}</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                          SERVICE_STYLES[item.service],
                        )}
                      >
                        {item.serviceLabel}
                      </span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-ink">{item.count}</td>
                    <td className="py-3 text-right text-[11px] whitespace-nowrap text-muted">
                      {formatDateTime(item.lastAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No enquiries in this range"
            detail="Try a longer range, or check the public detail pages to confirm the enquiry dialog is saving."
          />
        )}
      </section>

      <section
        aria-labelledby="recent-heading"
        className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="recent-heading" className="text-xl leading-tight">
              Recent enquiries
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              The latest eight leads in the selected range. Follow up on WhatsApp or call directly.
            </p>
          </div>
          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-warning uppercase">
            {plural(newCount, "new lead")}
          </span>
        </div>

        {stats.recentEnquiries.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
              <thead>
                <tr className="text-[10px] font-extrabold tracking-[0.1em] text-muted-soft uppercase">
                  <th scope="col" className="pb-2">
                    Name
                  </th>
                  <th scope="col" className="pb-2">
                    Phone
                  </th>
                  <th scope="col" className="pb-2">
                    Item
                  </th>
                  <th scope="col" className="pb-2">
                    Status
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEnquiries.map((enquiry, index) => (
                  <tr
                    key={enquiry.id ?? `${enquiry.createdAt}-${index}`}
                    className="border-t border-line"
                  >
                    <td className="py-3 pr-3 font-extrabold whitespace-nowrap text-ink">
                      {enquiry.name}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {enquiry.phone ? (
                        <a
                          href={`tel:+91${enquiry.phone}`}
                          className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                        >
                          +91 {enquiry.phone}
                        </a>
                      ) : (
                        <span className="text-muted-soft">—</span>
                      )}
                    </td>
                    <td className="max-w-[18rem] py-3 pr-3">
                      <span className="line-clamp-1 font-semibold text-ink-soft">
                        {enquiry.title}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-bold text-muted-soft">
                        {enquiry.serviceLabel}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                          STATUS_STYLES[enquiry.status],
                        )}
                      >
                        {ENQUIRY_STATUS_LABELS[enquiry.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[11px] whitespace-nowrap text-muted">
                      {formatDateTime(enquiry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No recent enquiries"
            detail="Submitted enquiries from the public detail pages will appear here with their contact details."
          />
        )}
      </section>

      <section
        aria-labelledby="workspace-heading"
        className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <h2 id="workspace-heading" className="text-lg leading-tight">
          Workspace status
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          <WorkspaceItem
            icon={Database}
            label="MongoDB"
            value="Connected"
            detail="Lead and catalogue collections are reachable."
            ready
          />
          <WorkspaceItem
            icon={ImageIcon}
            label="Cloudinary"
            value={
              process.env.CLOUDINARY_URL ||
              (process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET)
                ? "Configured"
                : "Missing keys"
            }
            detail="Signed media uploads arrive with the catalogue editor."
            ready={Boolean(
              process.env.CLOUDINARY_URL ||
              (process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET),
            )}
          />
          <WorkspaceItem
            icon={ShieldCheck}
            label="Admin session"
            value="Protected"
            detail="JWT, HttpOnly cookie, and request-level checks are active."
            ready
          />
        </ul>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5 text-[11px] leading-5 text-muted">
          <BarChart3 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
          Next up: Cloudinary uploads and catalogue editing for hotels, offers, cars, and holidays.
        </p>
      </section>
    </div>
  );
}

function StatusTile({ slice }: { slice: StatsStatusSlice }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/50 px-2 py-2 text-center">
      <dt className="text-[9px] font-extrabold tracking-[0.08em] text-muted-soft uppercase">
        {slice.label}
      </dt>
      <dd className="mt-0.5 text-lg leading-none font-extrabold text-ink">
        {fullNumber.format(slice.count)}
      </dd>
    </div>
  );
}

function WorkspaceItem({
  icon: Icon,
  label,
  value,
  detail,
  ready,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  ready: boolean;
}) {
  return (
    <li className="rounded-xl border border-line bg-canvas/40 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg",
            ready ? "bg-brand-50 text-brand-700" : "bg-warning-soft text-warning",
          )}
        >
          <Icon aria-hidden="true" className="size-3.5" />
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-[0.06em] uppercase",
            ready ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
          )}
        >
          {value}
        </span>
      </div>
      <p className="mt-2 text-xs font-extrabold text-ink">{label}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-muted">{detail}</p>
    </li>
  );
}

function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-line bg-canvas/40 px-4 py-8 text-center">
      <span className="mx-auto grid size-10 place-items-center rounded-xl bg-surface text-muted-soft shadow-xs">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <p className="mt-2 text-sm font-extrabold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-muted">{detail}</p>
    </div>
  );
}

export function AdminStatsUnavailable() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-xs sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
        <CircleAlert aria-hidden="true" className="size-5" />
      </span>
      <h1 className="mt-4 text-2xl leading-tight">Stats are temporarily unavailable.</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        The dashboard could not read the lead collections. Check that{" "}
        <code className="rounded bg-canvas px-1.5 py-0.5 text-[11px] font-bold">MONGODB_URI</code>{" "}
        is set and the database is reachable, then reload this page.
      </p>
      <Link
        href="/admin"
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        Try again
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}

export function AdminStatsFallback() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading the enquiry dashboard</span>
      <div className="shimmer-surface h-36 rounded-2xl border border-line" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="shimmer-surface h-32 rounded-2xl border border-line"
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
        <div className="shimmer-surface h-64 rounded-2xl border border-line" aria-hidden="true" />
        <div className="shimmer-surface h-64 rounded-2xl border border-line" aria-hidden="true" />
      </div>
      <div className="shimmer-surface h-72 rounded-2xl border border-line" aria-hidden="true" />
    </div>
  );
}
