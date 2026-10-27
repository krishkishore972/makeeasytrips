import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

/**
 * Minimal Chrome DevTools Protocol client for the local audit scripts.
 * It launches headless Chromium, connects to the first page target, and exposes
 * just enough of the protocol to navigate, evaluate, and send key events.
 */

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

function playwrightChromium() {
  const cache = join(homedir(), ".cache", "ms-playwright");
  if (!existsSync(cache)) return undefined;
  return readdirSync(cache)
    .filter((entry) => entry.startsWith("chromium-"))
    .sort()
    .reverse()
    .map((entry) => join(cache, entry, "chrome-linux64", "chrome"))
    .find((path) => existsSync(path));
}

export function findChrome() {
  const path = [...CHROME_CANDIDATES, playwrightChromium()].find(
    (candidate) => candidate && existsSync(candidate),
  );
  if (!path) {
    throw new Error("No Chrome binary found. Set CHROME_PATH to a Chromium or Chrome executable.");
  }
  return path;
}

export async function launchChrome({ port, profile, width = 1440, height = 1000 }) {
  const chrome = spawn(
    findChrome(),
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      `--window-size=${width},${height}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  chrome.stderr.on("data", () => {});

  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) break;
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("Chrome started without a page target.");

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const callbacks = pending.get(message.id);
    if (!callbacks) return;
    pending.delete(message.id);
    if (message.error) callbacks.reject(new Error(JSON.stringify(message.error)));
    else callbacks.resolve(message.result);
  });

  function send(method, params = {}) {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? "Page evaluation failed.");
    }
    return result.result.value;
  }

  async function waitFor(expression, timeout = 15000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(`Boolean(${expression})`)) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${expression}`);
  }

  async function setViewport({ width, height, deviceScaleFactor = 1, mobile = false }) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor,
      mobile,
    });
  }

  async function navigate(url) {
    await send("Page.navigate", { url });
    await waitFor(`document.readyState === "complete"`);
  }

  async function press(key, code, keyCode, text) {
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code,
      ...(text ? { text, unmodifiedText: text } : {}),
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
    });
    await sleep(250);
  }

  await send("Page.enable");
  await send("Runtime.enable");

  return {
    send,
    evaluate,
    waitFor,
    setViewport,
    navigate,
    press,
    close() {
      socket.close();
      chrome.kill();
    },
  };
}
