import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  value: undefined as string | undefined,
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "tripnest_admin" && store.value ? { name, value: store.value } : undefined,
    set: store.set,
    delete: store.delete,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { signAdminSession } from "@/lib/admin/jwt";
import {
  clearAdminSessionCookie,
  getAdminSession,
  setAdminSessionCookie,
} from "@/lib/admin/session";

const SECRET = "session-test-secret-that-is-long-enough-0123456789";
const EMAIL = "admin@example.com";

describe("admin session cookie", () => {
  beforeEach(() => {
    store.value = undefined;
    store.set.mockClear();
    store.delete.mockClear();
    vi.stubEnv("ADMIN_JWT_SECRET", SECRET);
    vi.stubEnv("ADMIN_EMAIL", EMAIL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets an HttpOnly, strict, eight-hour cookie in development", async () => {
    await setAdminSessionCookie("signed-token");

    expect(store.set).toHaveBeenCalledWith("tripnest_admin", "signed-token", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/",
      maxAge: 8 * 60 * 60,
    });
  });

  it("clears the cookie on sign-out", async () => {
    await clearAdminSessionCookie();

    expect(store.delete).toHaveBeenCalledWith("tripnest_admin");
  });

  it("returns the session for a valid token and null for a tampered one", async () => {
    const token = await signAdminSession(EMAIL, { secret: SECRET });

    store.value = token;
    await expect(getAdminSession()).resolves.toMatchObject({ email: EMAIL });

    const [header, payload, signature] = token.split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...claims, email: "attacker@example.com" }),
      "utf8",
    ).toString("base64url");

    store.value = `${header}.${tamperedPayload}.${signature}`;
    await expect(getAdminSession()).resolves.toBeNull();

    store.value = undefined;
    await expect(getAdminSession()).resolves.toBeNull();
  });
});
