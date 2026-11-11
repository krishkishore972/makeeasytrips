"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveCatalogueAction } from "@/lib/admin/catalogue-actions";
import {
  CATALOGUE_META,
  CATALOGUE_SECTIONS,
  type CatalogueField,
  type CatalogueMeta,
  type CatalogueOption,
  type CatalogueResource,
} from "@/lib/admin/catalogue-config";
import type { CatalogueSaveState } from "@/lib/admin/catalogue-types";
import {
  CheckboxField,
  Field,
  FormMessage,
  Select,
  TextArea,
  TextInput,
  fieldDescribedBy,
} from "./form-controls";
import { ImageUploader } from "./image-uploader";

const initialState: CatalogueSaveState = {};

type CityOption = { code: string; name: string };

type CatalogueFormProps = {
  resource: CatalogueResource;
  mode: "create" | "edit";
  record: Record<string, unknown>;
  cities: CityOption[];
};

function stringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function booleanValue(value: unknown): boolean {
  return value === true;
}

function listValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function CatalogueForm({ resource, mode, record, cities }: CatalogueFormProps) {
  const [state, formAction, pending] = useActionState(saveCatalogueAction, initialState);
  const [uploadWarning, setUploadWarning] = useState(false);
  const meta = CATALOGUE_META[resource];
  const sections = CATALOGUE_SECTIONS[resource];
  const recordId = stringValue(record.id);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      // React resets uncontrolled controls when an action resolves, including
      // when the server returns field errors. Successful saves redirect instead.
      onReset={(event) => event.preventDefault()}
      onSubmit={(event) => {
        if (event.currentTarget.querySelector('[data-uploading="true"]')) {
          event.preventDefault();
          setUploadWarning(true);
        } else {
          setUploadWarning(false);
        }
      }}
    >
      <input type="hidden" name="_resource" value={resource} />
      {mode === "edit" ? <input type="hidden" name="_recordId" value={recordId} /> : null}

      <FormMessage tone="error" className="text-sm">
        {uploadWarning ? "Wait for all photo uploads to finish before saving." : state.message}
      </FormMessage>

      {mode === "edit" ? (
        <p className="rounded-xl border border-line bg-surface px-3 py-2 text-[11px] font-semibold text-muted">
          Record id{" "}
          <span className="font-mono text-ink" translate="no">
            {recordId}
          </span>{" "}
          is fixed after creation.
        </p>
      ) : null}

      {sections.map((section) => (
        <section
          key={section.title}
          aria-labelledby={`${resource}-${section.title.replace(/\s+/g, "-")}`}
          className="rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <h2
            id={`${resource}-${section.title.replace(/\s+/g, "-")}`}
            className="text-lg leading-tight"
          >
            {section.title}
          </h2>
          {section.description ? (
            <p className="mt-1.5 text-xs leading-5 text-muted">{section.description}</p>
          ) : null}

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {section.fields
              .filter((field) => !(mode === "edit" && field.name === "id"))
              .map((field) => (
                <FieldControl
                  key={field.name}
                  field={field}
                  folder={meta.uploadFolder}
                  record={record}
                  cities={cities}
                  error={fieldErrors[field.name]}
                />
              ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-md backdrop-blur">
        <Link
          href={`/admin/${resource}`}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to {meta.label.toLowerCase()}
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          {pending ? "Saving…" : mode === "edit" ? "Save changes" : `Create ${meta.singular}`}
        </button>
      </div>
    </form>
  );
}

type FieldControlProps = {
  field: CatalogueField;
  folder: CatalogueMeta["uploadFolder"];
  record: Record<string, unknown>;
  cities: CityOption[];
  error?: string;
};

function FieldControl({ field, folder, record, cities, error }: FieldControlProps) {
  const value = record[field.name];
  const wide = field.wide ? "sm:col-span-2" : undefined;
  const describedBy = fieldDescribedBy(field.name, field.hint, error);

  if (field.kind === "image") {
    return (
      <div className="space-y-1.5 sm:col-span-2">
        <p className="flex items-center gap-1 text-xs font-extrabold text-ink-soft">
          {field.label}
          {field.required ? (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </p>
        {field.hint ? <p className="text-[11px] leading-5 text-muted">{field.hint}</p> : null}
        <ImageUploader
          folder={folder}
          name={field.name}
          initialUrl={stringValue(value) || undefined}
          initialAlt={field.label}
        />
        {error ? (
          <p role="alert" className="text-[11px] leading-5 font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (field.kind === "gallery") {
    return <GalleryEditor folder={folder} value={value} error={error} />;
  }

  if (field.kind === "multiselect") {
    const hintId = `${field.name}-hint`;
    const errorId = `${field.name}-error`;
    const describedBy = [field.hint ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <fieldset className={cn("space-y-2", wide)} aria-describedby={describedBy || undefined}>
        <legend className="flex items-center gap-1 text-xs font-extrabold text-ink-soft">
          {field.label}
          {field.required ? (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </legend>
        {field.hint ? (
          <p id={hintId} className="text-[11px] leading-5 text-muted">
            {field.hint}
          </p>
        ) : null}
        <div className="grid gap-2 rounded-xl border border-line bg-canvas p-3 sm:grid-cols-2">
          {field.options.map((option) => {
            const id = `${field.name}-${option.value}`;
            const selected = listValue(value).includes(option.value);

            return (
              <label
                key={option.value}
                htmlFor={id}
                className="flex items-center gap-2 text-[11px] font-bold text-ink-soft"
              >
                <input
                  id={id}
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  defaultChecked={selected}
                  className="size-4 rounded border-line-strong accent-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                />
                {option.label}
              </label>
            );
          })}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-[11px] leading-5 font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }

  if (field.kind === "itinerary") {
    return <ItineraryEditor field={field} value={value} error={error} className={wide} />;
  }

  return (
    <Field
      id={field.name}
      label={field.label}
      hint={field.hint}
      error={error}
      required={field.required}
      className={wide}
    >
      <SingleControl field={field} value={value} cities={cities} describedBy={describedBy} />
    </Field>
  );
}

type SingleControlProps = {
  field: Exclude<CatalogueField, { kind: "image" | "gallery" | "multiselect" | "itinerary" }>;
  value: unknown;
  cities: CityOption[];
  describedBy?: string;
};

function SingleControl({ field, value, cities, describedBy }: SingleControlProps) {
  if (field.kind === "select") {
    return (
      <Select
        id={field.name}
        name={field.name}
        defaultValue={stringValue(value)}
        required={field.required}
        describedBy={describedBy}
      >
        <option value="" disabled>
          Choose…
        </option>
        {field.options.map((option: CatalogueOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.kind === "city") {
    return (
      <Select
        id={field.name}
        name={field.name}
        defaultValue={stringValue(value)}
        required={field.required}
        describedBy={describedBy}
      >
        <option value="" disabled>
          Choose a city…
        </option>
        {cities.map((city) => (
          <option key={city.code} value={city.code}>
            {city.name} ({city.code})
          </option>
        ))}
      </Select>
    );
  }

  if (field.kind === "checkbox") {
    return (
      <CheckboxField
        id={field.name}
        name={field.name}
        label={field.label}
        defaultChecked={booleanValue(value)}
      />
    );
  }

  if (field.kind === "textarea" || field.kind === "list" || field.kind === "date-list") {
    const initial = field.kind === "textarea" ? stringValue(value) : listValue(value).join("\n");

    return (
      <TextArea
        id={field.name}
        name={field.name}
        rows={field.rows ?? (field.kind === "textarea" ? 4 : 5)}
        defaultValue={initial}
        placeholder={"placeholder" in field ? field.placeholder : undefined}
        required={field.required}
        describedBy={describedBy}
      />
    );
  }

  if (field.kind === "number") {
    return (
      <TextInput
        id={field.name}
        name={field.name}
        type="number"
        inputMode={field.step && field.step < 1 ? "decimal" : "numeric"}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        defaultValue={stringValue(value)}
        required={field.required}
        describedBy={describedBy}
      />
    );
  }

  return (
    <TextInput
      id={field.name}
      name={field.name}
      type={field.kind === "time" ? "time" : field.kind === "date" ? "date" : "text"}
      inputMode={field.kind === "text" ? field.inputMode : undefined}
      maxLength={field.kind === "text" ? field.maxLength : undefined}
      placeholder={field.kind === "text" ? field.placeholder : undefined}
      defaultValue={stringValue(value)}
      required={field.required}
      describedBy={describedBy}
      autoComplete="off"
      spellCheck={field.kind === "text" && field.name !== "code" ? undefined : false}
    />
  );
}

function GalleryEditor({
  folder,
  value,
  error,
}: {
  folder: CatalogueMeta["uploadFolder"];
  value: unknown;
  error?: string;
}) {
  const [slots, setSlots] = useState(() => listValue(value).map((url, id) => ({ id, url })));
  const [nextId, setNextId] = useState(slots.length);

  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-xs font-extrabold text-ink-soft">Additional photos</legend>
      <p className="text-[11px] leading-5 text-muted">
        Up to four additional photos, plus the main image. Removing a photo does not delete its
        Cloudinary asset.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {slots.map((slot, index) => (
          <div key={slot.id}>
            <p className="mb-1 text-xs font-bold text-muted">Photo {index + 2}</p>
            <ImageUploader
              folder={folder}
              name="gallery"
              initialUrl={slot.url || undefined}
              onUploaded={(image) => {
                if (!image) setSlots((current) => current.filter((item) => item.id !== slot.id));
                else
                  setSlots((current) =>
                    current.map((item) =>
                      item.id === slot.id ? { ...item, url: image.url } : item,
                    ),
                  );
              }}
            />
            {!slot.url ? (
              <button
                type="button"
                onClick={() => setSlots((current) => current.filter((item) => item.id !== slot.id))}
                className="mt-2 text-xs font-bold text-danger"
              >
                Remove photo slot
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {slots.length < 4 ? (
        <button
          type="button"
          onClick={() => {
            setSlots((current) => [...current, { id: nextId, url: "" }]);
            setNextId((current) => current + 1);
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-bold text-ink-soft"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add photo
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

type ItineraryRow = { day: string; title: string; detail: string };

type ItineraryEditorProps = {
  field: Extract<CatalogueField, { kind: "itinerary" }>;
  value: unknown;
  error?: string;
  className?: string;
};

function toRows(value: unknown): ItineraryRow[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;

    return [
      {
        day: stringValue(row.day),
        title: stringValue(row.title),
        detail: stringValue(row.detail),
      },
    ];
  });
}

function ItineraryEditor({ field, value, error, className }: ItineraryEditorProps) {
  const [rows, setRows] = useState<ItineraryRow[]>(() => toRows(value));

  function updateRow(index: number, key: keyof ItineraryRow, next: string) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: next } : row)),
    );
  }

  function addRow() {
    setRows((current) => [...current, { day: String(current.length + 1), title: "", detail: "" }]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="flex items-center gap-1 text-xs font-extrabold text-ink-soft">
        {field.label}
        {field.required ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      {field.hint ? <p className="text-[11px] leading-5 text-muted">{field.hint}</p> : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong bg-canvas px-3 py-6 text-center text-[11px] font-semibold text-muted">
          No days yet. Add the first day to describe the itinerary.
        </p>
      ) : null}

      <ol className="space-y-3">
        {rows.map((row, index) => (
          <li key={index} className="rounded-xl border border-line bg-canvas p-3">
            <div className="grid gap-3 sm:grid-cols-[5rem_1fr]">
              <div className="space-y-1.5">
                <label
                  htmlFor={`${field.name}-day-${index}`}
                  className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
                >
                  Day
                </label>
                <TextInput
                  id={`${field.name}-day-${index}`}
                  name={`${field.name}.day`}
                  type="number"
                  min={1}
                  step={1}
                  value={row.day}
                  onChange={(event) => updateRow(index, "day", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor={`${field.name}-title-${index}`}
                  className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
                >
                  Title
                </label>
                <TextInput
                  id={`${field.name}-title-${index}`}
                  name={`${field.name}.title`}
                  value={row.title}
                  onChange={(event) => updateRow(index, "title", event.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor={`${field.name}-detail-${index}`}
                  className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
                >
                  Detail
                </label>
                <TextArea
                  id={`${field.name}-detail-${index}`}
                  name={`${field.name}.detail`}
                  rows={2}
                  value={row.detail}
                  onChange={(event) => updateRow(index, "detail", event.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-danger hover:underline"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              Remove day
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[11px] font-extrabold text-ink-soft transition-colors hover:border-line-strong hover:bg-canvas"
      >
        <Plus aria-hidden="true" className="size-3.5" />
        Add day
      </button>

      {error ? (
        <p role="alert" className="text-[11px] leading-5 font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
