import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EnquiryStatusForm } from "@/components/admin/enquiry-status-form";
import { getEnquiry } from "@/lib/admin/enquiries";
import { requireAdminSession } from "@/lib/admin/session";
import { ENQUIRY_SERVICE_LABELS } from "@/lib/enquiry";

type Props = { params: Promise<{ id: string }> };
export default function EnquiryPage(props: Props) {
  return (
    <Suspense fallback={<p role="status">Loading enquiry…</p>}>
      <EnquiryContent {...props} />
    </Suspense>
  );
}
async function EnquiryContent({ params }: Props) {
  await requireAdminSession();
  await connection();
  const { id } = await params;
  const row = await getEnquiry(id);
  if (!row) notFound();
  return (
    <div className="space-y-5">
      <Link href="/admin/enquiries" className="text-xs font-bold text-brand-700">
        ← All enquiries
      </Link>
      <section className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div>
          <p className="eyebrow">{ENQUIRY_SERVICE_LABELS[row.service] ?? row.service} enquiry</p>
          <h1 className="mt-2 text-3xl">{row.title}</h1>
          <p className="mt-2 text-xs text-muted">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Date unavailable"}{" "}
            · India time
          </p>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold text-muted">Name</dt>
            <dd className="mt-1 text-sm">{row.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-muted">Phone</dt>
            <dd className="mt-1 text-sm">
              <a href={`tel:${row.phone}`} className="text-brand-700 underline">
                {row.phone}
              </a>
            </dd>
          </div>
          {row.itemId ? (
            <div>
              <dt className="text-xs font-bold text-muted">Listing ID</dt>
              <dd className="mt-1 text-sm">{row.itemId}</dd>
            </div>
          ) : null}
        </dl>
        {row.itemHref ? (
          <Link
            href={row.itemHref}
            className="inline-block text-xs font-bold text-brand-700 underline"
          >
            View related listing
          </Link>
        ) : null}
        {row.context.length ? (
          <div>
            <h2 className="text-sm font-bold">Enquiry details</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
              {row.context.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {row.details ? (
          <div>
            <h2 className="text-sm font-bold">Additional requirements</h2>
            <p className="mt-2 text-sm whitespace-pre-wrap text-muted">{row.details}</p>
          </div>
        ) : null}
        <div className="border-t border-line pt-5">
          <EnquiryStatusForm id={row.id} status={row.status} />
        </div>
      </section>
    </div>
  );
}
