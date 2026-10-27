import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { launchChrome } from "./lib/cdp.mjs";

/**
 * axe-core audit for the TripNest routes.
 *
 * Usage (with the app already running):
 *   npm run audit:a11y                 # WCAG 2.2 AA
 *   npm run audit:a11y -- --best-practice
 *
 * Set BASE_URL to audit a different origin. Exits non-zero on any violation.
 */

const require = createRequire(import.meta.url);
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const PORT = Number(process.env.AUDIT_PORT ?? 9333);
const bestPractice = process.argv.includes("--best-practice");

const ROUTES = [
  ["home", "/"],
  ["flights", "/flights?from=BLR&to=BOM&depart=2026-11-13&pax=2&cabin=economy"],
  ["flight detail", "/flights/fl-blr-bom-03?from=BLR&to=BOM&depart=2026-11-13&pax=2&cabin=economy"],
  ["hotels", "/hotels?city=GOI&checkin=2026-11-13&checkout=2026-11-17&rooms=1&guests=2"],
  [
    "hotel detail",
    "/hotels/htl-bom-harbour-and-hush?checkin=2026-11-13&checkout=2026-11-17&rooms=1&guests=2",
  ],
  ["holidays", "/holidays"],
  ["holiday detail", "/holidays/susegad-by-the-sea?depart=2026-12-05&travellers=3"],
  ["offers", "/offers"],
  [
    "booking review",
    "/booking/review?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy",
  ],
  [
    "booking confirmation",
    "/booking/confirmation?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy&confirmed=1",
  ],
  ["about", "/info/about"],
  ["my trips", "/my-trips"],
  ["trains", "/trains"],
  ["not found", "/this-route-does-not-exist"],
];

const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const runOptions = bestPractice
  ? `{ runOnly: { type: "tag", values: ["best-practice"] }, resultTypes: ["violations"] }`
  : `{ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }, resultTypes: ["violations"] }`;

const session = await launchChrome({
  port: PORT,
  profile: join(tmpdir(), `tripnest-a11y-${process.pid}`),
  width: 1440,
  height: 1000,
});
await session.setViewport({ width: 1440, height: 1000 });

const failures = [];

for (const [name, path] of ROUTES) {
  await session.navigate(`${BASE_URL}${path}`);
  await session.waitFor(`document.querySelector("h1")`);
  await sleep(900);

  await session.evaluate(axeSource);
  const result = await session.evaluate(`axe.run(document, ${runOptions})`);

  const nodes = result.violations.reduce((total, violation) => total + violation.nodes.length, 0);
  console.log(
    `${nodes === 0 ? "PASS" : "FAIL"}  ${name} — ${result.violations.length} rules, ${nodes} nodes`,
  );

  for (const violation of result.violations) {
    console.log(
      `   [${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length})`,
    );
    for (const node of violation.nodes.slice(0, 4)) {
      console.log(`      ${node.target.join(" ")}`);
      console.log(`      ${node.failureSummary.split("\n").join(" | ").slice(0, 220)}`);
    }
  }

  if (result.violations.length > 0) failures.push(name);
}

session.close();

console.log(
  `\n${ROUTES.length - failures.length}/${ROUTES.length} pages clean (${bestPractice ? "best practice" : "WCAG 2.2 AA"}).`,
);
process.exit(failures.length > 0 ? 1 : 0);
