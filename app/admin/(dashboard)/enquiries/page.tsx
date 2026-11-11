import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdminSession } from "@/lib/admin/session";
import {
  ENQUIRIES_PAGE_SIZE,
  listEnquiries,
  parseEnquiryFilters,
  type EnquiryFilters,
} from "@/lib/admin/enquiries";
import { ENQUIRY_SERVICE_LABELS, enquiryServiceValues } from "@/lib/enquiry";
import { enquiryStatusValues } from "@/lib/admin/enquiry-status";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export default function EnquiriesPage(props: Props) {
  return (
    <Suspense fallback={<p role="status">Loading enquiries…</p>}>
      <EnquiriesContent {...props} />
    </Suspense>
  );
}

function pageHref(filters: EnquiryFilters, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, page }))
    if (value) params.set(key, String(value));
  return `/admin/enquiries?${params}`;
}

async function EnquiriesContent({ searchParams }: Props) {
  await requireAdminSession();
  await connection();
  const filters = parseEnquiryFilters(await searchParams);
  const data = await listEnquiries(filters).catch(() => null);
  const control = "min-h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink";
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="eyebrow">Leads</p>
        <h1 className="mt-2 text-3xl">Enquiries</h1>
        <p className="mt-2 text-sm text-muted">
          Search and follow up on submitted service enquiries. Dates use India time.
        </p>
        <form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" method="get">
          <label className="space-y-1 text-xs font-bold">
            Search
            <input
              name="q"
              defaultValue={filters.q}
              maxLength={100}
              placeholder="Name, phone or listing"
              className={`${control} block w-full`}
            />
          </label>
          <label className="space-y-1 text-xs font-bold">
            Service
            <select
              name="service"
              defaultValue={filters.service ?? ""}
              className={`${control} block w-full`}
            >
              <option value="">All services</option>
              {enquiryServiceValues.map((value) => (
                <option value={value} key={value}>
                  {ENQUIRY_SERVICE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold">
            Status
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className={`${control} block w-full`}
            >
              <option value="">All statuses</option>
              {enquiryStatusValues.map((value) => (
                <option value={value} key={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold">
            From
            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className={`${control} block w-full`}
            />
          </label>
          <label className="space-y-1 text-xs font-bold">
            To
            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className={`${control} block w-full`}
            />
          </label>
          <div className="flex items-end gap-2">
            <button className="min-h-10 rounded-xl bg-brand-700 px-4 text-xs font-bold text-white">
              Apply filters
            </button>
            <Link href="/admin/enquiries" className="px-3 py-3 text-xs font-bold text-brand-700">
              Clear
            </Link>
          </div>
        </form>
      </section>
      {!data ? (
        <p role="alert" className="text-danger">
          Enquiries could not be loaded. Please try again.
        </p>
      ) : (
        <section aria-label="Enquiry results" className="space-y-3">
          <p className="text-xs font-bold text-muted">
            {data.total} {data.total === 1 ? "enquiry" : "enquiries"}
          </p>
          {data.rows.length === 0 ? (
            <p className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
              No enquiries found for these filters.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.rows.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/admin/enquiries/${row.id}`}
                    className="block rounded-2xl border border-line bg-surface p-4 hover:border-brand-200"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-extrabold">{row.name}</span>
                      <span className="text-xs font-bold text-brand-700">
                        {row.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {ENQUIRY_SERVICE_LABELS[row.service] ?? row.service} · {row.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {row.phone} ·{" "}
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Date unavailable"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <nav aria-label="Enquiry pages" className="flex gap-4 text-xs font-bold text-brand-700">
            {filters.page > 1 ? (
              <Link href={pageHref(filters, filters.page - 1)}>Previous</Link>
            ) : null}
            {filters.page * ENQUIRIES_PAGE_SIZE < data.total ? (
              <Link href={pageHref(filters, filters.page + 1)}>Next</Link>
            ) : null}
          </nav>
        </section>
      )}
    </div>
  );
}
