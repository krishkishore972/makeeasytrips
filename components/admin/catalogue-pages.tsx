import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CarFront,
  Plus,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { CatalogueForm } from "@/components/admin/catalogue-form";
import { CatalogueDelete } from "@/components/admin/catalogue-delete";
import {
  CATALOGUE_META,
  toCatalogueFormValues,
  type CatalogueResource,
} from "@/lib/admin/catalogue-config";
import { getCatalogueRecord, listCatalogueRecords } from "@/lib/admin/catalogue-data";
import { summariseCatalogueRecord, type CatalogueSummary } from "@/lib/admin/catalogue-summary";
import { requireAdminSession } from "@/lib/admin/session";
import { getCities } from "@/lib/data/cities";

type CatalogueSearchParams = Promise<Record<string, string | string[] | undefined>>;

type CataloguePageProps = {
  resource: CatalogueResource;
  searchParams: CatalogueSearchParams;
};

type CatalogueEditPageProps = {
  resource: CatalogueResource;
  params: Promise<{ id: string }>;
};

const resourceIcons: Record<CatalogueResource, LucideIcon> = {
  events: CalendarDays,
  hotels: Building2,
  holidays: CalendarDays,
  cars: CarFront,
  offers: Tag,
};

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function cityOptions() {
  const cities = await getCities().catch((error: unknown) => {
    console.error("Failed to load admin city options", error);
    return [];
  });

  return cities.map(({ code, name }) => ({ code, name }));
}

export async function CatalogueListPage({ resource, searchParams }: CataloguePageProps) {
  // The layout already checked the session; checking again keeps this page safe
  // if it is ever rendered through another layout.
  await requireAdminSession();
  const params = await searchParams;
  const saved = single(params.saved);
  const mode = single(params.mode);
  const deleted = single(params.deleted);

  // Admin catalogue reads are uncached so an edit appears immediately.
  await connection();

  const records = await listCatalogueRecords(resource).catch((error: unknown) => {
    console.error(`Failed to load admin ${resource}`, error);
    return null;
  });

  const meta = CATALOGUE_META[resource];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{meta.label}</p>
            <h1 className="mt-2 text-[clamp(1.7rem,3.4vw,2.3rem)] leading-tight">
              {records === null
                ? `Manage ${meta.label.toLowerCase()}`
                : `${records.length} ${records.length === 1 ? meta.singular : meta.label.toLowerCase()}`}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{meta.description}</p>
          </div>
          <Link
            href={`/admin/${resource}/new`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            <Plus aria-hidden="true" className="size-4" />
            New {meta.singular}
          </Link>
        </div>
      </section>

      {saved ? (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-xs leading-5 font-semibold text-success"
        >
          Saved {mode === "created" ? "new " : ""}
          {meta.singular}{" "}
          <span className="font-mono" translate="no">
            {saved}
          </span>
          . The public catalogue cache was refreshed.
        </div>
      ) : null}

      {deleted ? (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-xs font-semibold text-success"
        >
          Deleted {meta.singular} <span className="font-mono">{deleted}</span>.
        </div>
      ) : null}

      {records === null ? (
        <p className="rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-xs font-semibold text-danger">
          {meta.label} could not be read from MongoDB. Check the database connection and reload this
          page.
        </p>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-5 py-12 text-center">
          <p className="text-sm font-extrabold text-ink">No {meta.label.toLowerCase()} yet</p>
          <p className="mt-1 text-xs text-muted">
            Create the first record to publish it on the public site.
          </p>
          <Link
            href={`/admin/${resource}/new`}
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            <Plus aria-hidden="true" className="size-4" />
            New {meta.singular}
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((record) => (
            <CatalogueRow key={record.id} resource={resource} record={record} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CatalogueRow({
  resource,
  record,
}: {
  resource: CatalogueResource;
  record: CatalogueSummary;
}) {
  const Icon = resourceIcons[resource];

  return (
    <li>
      <Link
        href={record.editHref}
        className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50/40 sm:p-4"
      >
        <span className="relative hidden size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas sm:block">
          {record.image ? (
            <Image
              src={record.image}
              alt=""
              fill
              sizes="56px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-muted-soft">
              <Icon aria-hidden="true" className="size-5" />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-extrabold text-ink">{record.title}</span>
            {record.featured ? (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-extrabold tracking-[0.08em] text-brand-700 uppercase">
                Featured
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted">{record.subtitle}</span>
          <span className="mt-1 block text-[10px] font-semibold text-muted-soft">
            {record.meta}
          </span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-extrabold text-brand-700">
          Edit
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </Link>
    </li>
  );
}

export async function CatalogueCreatePage({ resource }: { resource: CatalogueResource }) {
  await requireAdminSession();
  await connection();

  const cities = await cityOptions();
  const meta = CATALOGUE_META[resource];

  return (
    <CatalogueEditorShell
      resource={resource}
      mode="create"
      title={`New ${meta.singular}`}
      description={`Add ${/^[aeiou]/i.test(meta.singular) ? "an" : "a"} ${meta.singular} to the public ${meta.label.toLowerCase()} catalogue.`}
      record={toCatalogueFormValues(resource, {})}
      cities={cities}
    />
  );
}

export async function CatalogueEditPage({ resource, params }: CatalogueEditPageProps) {
  await requireAdminSession();
  await connection();

  const { id } = await params;
  const [record, cities] = await Promise.all([
    getCatalogueRecord(resource, id).catch((error: unknown) => {
      console.error(`Failed to load ${resource} record ${id}`, error);
      return null;
    }),
    cityOptions(),
  ]);

  if (!record) {
    notFound();
  }

  const summary = summariseCatalogueRecord(resource, record);
  const meta = CATALOGUE_META[resource];

  return (
    <CatalogueEditorShell
      resource={resource}
      mode="edit"
      title={summary?.title ?? `Edit ${meta.singular}`}
      description={`Editing ${meta.singular} ${id}. Saving clears the public catalogue cache.`}
      record={toCatalogueFormValues(resource, record)}
      cities={cities}
      publicHref={summary?.publicHref}
    />
  );
}

function CatalogueEditorShell({
  resource,
  mode,
  title,
  description,
  record,
  cities,
  publicHref,
}: {
  resource: CatalogueResource;
  mode: "create" | "edit";
  title: string;
  description: string;
  record: Record<string, unknown>;
  cities: { code: string; name: string }[];
  publicHref?: string;
}) {
  const meta = CATALOGUE_META[resource];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/${resource}`}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-muted transition-colors hover:text-brand-700"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            All {meta.label.toLowerCase()}
          </Link>
          <h1 className="mt-2 text-[clamp(1.6rem,3.2vw,2.2rem)] leading-tight">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-6 text-muted">{description}</p>
        </div>

        {publicHref ? (
          <Link
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[11px] font-extrabold text-ink-soft transition-colors hover:border-line-strong hover:bg-canvas"
          >
            View on site
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>

      <CatalogueForm
        // Cache Components preserves this editor across navigations. Reset
        // its state and uncontrolled inputs when the saved record changes.
        key={`${resource}:${mode}:${JSON.stringify(record)}`}
        resource={resource}
        mode={mode}
        record={record}
        cities={cities}
      />
      {mode === "edit" && typeof record.id === "string" ? (
        <CatalogueDelete resource={resource} id={record.id} title={title} />
      ) : null}
    </div>
  );
}

export function CataloguePageFallback() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading the catalogue editor</span>
      <div className="shimmer-surface h-32 rounded-2xl border border-line" aria-hidden="true" />
      <div className="shimmer-surface h-48 rounded-2xl border border-line" aria-hidden="true" />
      <div className="shimmer-surface h-64 rounded-2xl border border-line" aria-hidden="true" />
    </div>
  );
}
