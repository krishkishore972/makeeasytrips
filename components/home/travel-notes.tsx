import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { TravelNote } from "@/lib/home-content";
import { HOLIDAY_THEME_LABELS } from "@/lib/search-options";

type TravelNotesProps = {
  notes: TravelNote[];
};

export function TravelNotes({ notes }: TravelNotesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {notes.map((note) => (
        <article key={note.title} className="h-full">
          <Link
            href={note.href}
            className="group card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
              <Image
                src={note.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="flex items-center justify-between gap-2 text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase">
                <span>{HOLIDAY_THEME_LABELS[note.theme] ?? note.theme}</span>
                <span className="font-semibold tracking-normal normal-case">{note.readTime}</span>
              </p>
              <h3 className="mt-2 text-lg leading-tight">{note.title}</h3>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted">{note.excerpt}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[11px] font-extrabold text-brand-700">
                Read the note
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
