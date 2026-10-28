import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { launchChrome } from "./lib/cdp.mjs";

/**
 * Lab performance check: mobile viewport, 2x CPU throttling, cold cache.
 *
 * Usage (with the app already running):
 *   npm run audit:perf
 *
 * Budgets: LCP <= 2500 ms, CLS <= 0.1, JS <= 350 kB, transfer <= 600 kB.
 * Set BASE_URL to audit a different origin. Exits non-zero when a budget fails.
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const PORT = Number(process.env.AUDIT_PORT ?? 9334);

const BUDGETS = { lcp: 2500, cls: 0.1, js: 350, transferred: 600 };

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
  ["rent a car", "/rent-a-car"],
  [
    "car search",
    "/rent-a-car/search?city=GOI&start=2026-11-13T10:00&end=2026-11-15T10:00&mode=daily",
  ],
  ["car detail", "/rent-a-car/car-maruti-suzuki-swift?start=2026-11-13T10:00&end=2026-11-15T10:00"],
  [
    "booking review",
    "/booking/review?type=flight&id=fl-blr-bom-03&depart=2026-11-13&pax=2&cabin=economy",
  ],
  [
    "car booking review",
    "/booking/review?type=car&id=car-maruti-suzuki-swift&start=2026-11-13T10:00&end=2026-11-15T10:00&plan=included&delivery=0&addons=",
  ],
];

const session = await launchChrome({
  port: PORT,
  profile: join(tmpdir(), `tripnest-perf-${process.pid}`),
  width: 390,
  height: 844,
});

await session.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await session.send("Network.enable");
await session.send("Network.setCacheDisabled", { cacheDisabled: true });
await session.send("Emulation.setCPUThrottlingRate", { rate: 2 });

await session.send("Page.addScriptToEvaluateOnNewDocument", {
  source: `
    window.__perf = { lcp: 0, lcpElement: "", cls: 0, fcp: 0 };
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;
      window.__perf.lcp = last.startTime;
      const element = last.element;
      if (element) {
        const name = String(element.className || "").split(" ")[0];
        window.__perf.lcpElement = element.tagName.toLowerCase() + (name ? "." + name : "");
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__perf.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") window.__perf.fcp = entry.startTime;
      }
    }).observe({ type: "paint", buffered: true });
  `,
});

const results = [];

for (const [name, path] of ROUTES) {
  await session.navigate(`${BASE_URL}${path}`);
  await sleep(3000);

  const metrics = await session.evaluate(`(() => {
    const perf = window.__perf;
    const resources = performance.getEntriesByType("resource");
    const sum = (entries) => entries.reduce((total, entry) => total + (entry.transferSize || 0), 0);
    const scripts = resources.filter((entry) => entry.name.endsWith(".js"));
    const images = resources.filter((entry) => /\\\\.(svg|png|jpg|webp|avif)/.test(entry.name));
    const navigation = performance.getEntriesByType("navigation")[0];
    return {
      fcp: Math.round(perf.fcp),
      lcp: Math.round(perf.lcp),
      lcpElement: perf.lcpElement,
      cls: Number(perf.cls.toFixed(4)),
      domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd ?? 0),
      transferred: Math.round(sum(resources) / 1024),
      js: Math.round(sum(scripts) / 1024),
      images: Math.round(sum(images) / 1024),
      nodes: document.querySelectorAll("*").length,
    };
  })()`);

  results.push({ name, ...metrics });
  console.log(
    `${name.padEnd(16)} FCP ${String(metrics.fcp).padStart(4)}ms  LCP ${String(metrics.lcp).padStart(4)}ms  CLS ${metrics.cls}  JS ${String(metrics.js).padStart(4)}kB  img ${String(metrics.images).padStart(4)}kB  total ${String(metrics.transferred).padStart(4)}kB  nodes ${metrics.nodes}  LCP:${metrics.lcpElement}`,
  );
}

session.close();

const failures = [];
for (const entry of results) {
  if (entry.lcp > BUDGETS.lcp) failures.push(`${entry.name} LCP ${entry.lcp}ms`);
  if (entry.cls > BUDGETS.cls) failures.push(`${entry.name} CLS ${entry.cls}`);
  if (entry.js > BUDGETS.js) failures.push(`${entry.name} JS ${entry.js}kB`);
  if (entry.transferred > BUDGETS.transferred)
    failures.push(`${entry.name} transfer ${entry.transferred}kB`);
}

console.log(
  `\nWorst LCP ${Math.max(...results.map((entry) => entry.lcp))}ms, worst CLS ${Math.max(...results.map((entry) => entry.cls))}, largest JS ${Math.max(...results.map((entry) => entry.js))}kB.`,
);
console.log(
  failures.length === 0
    ? `PASS budgets (LCP ${BUDGETS.lcp}ms, CLS ${BUDGETS.cls}, JS ${BUDGETS.js}kB, transfer ${BUDGETS.transferred}kB).`
    : `FAIL budgets:\n- ${failures.join("\n- ")}`,
);

process.exit(failures.length > 0 ? 1 : 0);
