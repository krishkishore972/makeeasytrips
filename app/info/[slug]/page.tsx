import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Info, ShieldCheck } from "lucide-react";
import {
  infoPages,
  infoPageSlugs,
  isInfoPageSlug,
  relatedInfoSlugs,
  type InfoPageSlug,
} from "@/lib/info-pages";

type InfoPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return infoPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    return {
      title: "Page not found",
    };
  }

  const page = infoPages[slug];

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/info/${slug}`,
    },
  };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    notFound();
  }

  const page = infoPages[slug];
  const related = relatedInfoSlugs.filter((item) => item !== slug).slice(0, 4);

  return (
    <div className="page-container py-10 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
          <li>
            <Link href="/" className="transition-colors hover:text-brand-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-muted-soft" />
          </li>
          <li>
            <span aria-current="page" className="text-ink">
              {page.title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-10">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.2vw,3rem)] leading-[1.05]">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{page.description}</p>

          <div className="mt-10 space-y-9">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl leading-tight">{section.heading}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              Back to TripNest
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/info/disclaimer"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              Read the demo disclaimer
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
            <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-muted uppercase">
              <Info aria-hidden="true" className="size-3.5 text-brand-500" />
              More about TripNest
            </p>
            <ul className="mt-3 space-y-1">
              {related.map((item: InfoPageSlug) => (
                <li key={item}>
                  <Link
                    href={`/info/${item}`}
                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    {infoPages[item].title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 text-muted-soft transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold text-brand-800">
              <ShieldCheck aria-hidden="true" className="size-4" />A learning project
            </p>
            <p className="mt-2 text-xs leading-6 text-muted">
              TripNest is not affiliated with any travel brand. No real bookings, payments, or
              accounts happen here.
            </p>
            <Link
              href="/info/disclaimer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 underline-offset-4 hover:underline"
            >
              Demo disclaimer
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
