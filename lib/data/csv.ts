import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import type { ZodType } from "zod";

const cache = new Map<string, Promise<unknown>>();

async function parseCsv<T>(fileName: string, schema: ZodType<T>): Promise<T[]> {
  const filePath = path.join(process.cwd(), "data", fileName);
  const source = await readFile(filePath, "utf8");

  const parsed = Papa.parse<Record<string, string>>(source, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    const detail = parsed.errors
      .slice(0, 3)
      .map((error) => `${error.type}: ${error.message}`)
      .join("; ");
    throw new Error(`Could not parse data/${fileName}: ${detail}`);
  }

  return parsed.data.map((row, index) => {
    const result = schema.safeParse(row);

    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid row ${index + 2} in data/${fileName} — ${issues}`);
    }

    return result.data;
  });
}

/**
 * Parse a CSV catalogue once per server process and reuse the typed result.
 * The promise is cached (not just the value) so concurrent requests share one read.
 */
export function readCsvOnce<T>(fileName: string, schema: ZodType<T>): Promise<T[]> {
  const cached = cache.get(fileName);
  if (cached) return cached as Promise<T[]>;

  const promise = parseCsv(fileName, schema);
  cache.set(fileName, promise);
  return promise;
}
