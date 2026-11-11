import { describe, expect, it } from "vitest";
import { signAdminSession, verifyAdminSession } from "@/lib/admin/jwt";
import {
  hashAdminPassword,
  timingSafeEqualString,
  verifyAdminPassword,
} from "@/lib/admin/password";
import {
  clearLoginLimit,
  getLoginLimitStatus,
  recordLoginFailure,
  resetLoginLimits,
} from "@/lib/admin/rate-limit";
import { safeAdminRedirect } from "@/lib/admin/redirect";

const SECRET = "test-admin-secret-that-is-long-enough-0123456789";
const EMAIL = "admin@example.com";
const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);

function tamperPayload(token: string, changes: Record<string, unknown>): string {
  const [header, payload, signature] = token.split(".");
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
  const nextPayload = Buffer.from(JSON.stringify({ ...parsed, ...changes }), "utf8").toString(
    "base64url",
  );

  return `${header}.${nextPayload}.${signature}`;
}

describe("admin JWT", () => {
  it("round-trips a signed session for the configured admin", async () => {
    const token = await signAdminSession(EMAIL, { secret: SECRET, now: NOW });
    const session = await verifyAdminSession(token, {
      secret: SECRET,
      expectedEmail: EMAIL,
      now: NOW + 1000,
    });

    expect(session).toEqual({
      email: EMAIL,
      issuedAt: Math.floor(NOW / 1000),
      expiresAt: Math.floor(NOW / 1000) + 8 * 60 * 60,
    });
  });

  it("rejects an expired token", async () => {
    const token = await signAdminSession(EMAIL, {
      secret: SECRET,
      now: NOW,
      ttlSeconds: 60,
    });

    expect(
      await verifyAdminSession(token, {
        secret: SECRET,
        expectedEmail: EMAIL,
        now: NOW + 61_000,
      }),
    ).toBeNull();
  });

  it("rejects a token whose payload was changed", async () => {
    const token = await signAdminSession(EMAIL, { secret: SECRET, now: NOW });
    const tampered = tamperPayload(token, { email: "attacker@example.com" });

    expect(
      await verifyAdminSession(tampered, {
        secret: SECRET,
        expectedEmail: EMAIL,
        now: NOW,
      }),
    ).toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const token = await signAdminSession(EMAIL, { secret: SECRET, now: NOW });

    expect(
      await verifyAdminSession(token, {
        secret: "a-different-secret-that-is-also-long-enough-000000",
        expectedEmail: EMAIL,
        now: NOW,
      }),
    ).toBeNull();
  });

  it("rejects a valid token for a different admin email", async () => {
    const token = await signAdminSession(EMAIL, { secret: SECRET, now: NOW });

    expect(
      await verifyAdminSession(token, {
        secret: SECRET,
        expectedEmail: "someone-else@example.com",
        now: NOW,
      }),
    ).toBeNull();
  });

  it("rejects a token issued in the future and malformed input", async () => {
    const token = await signAdminSession(EMAIL, {
      secret: SECRET,
      now: NOW + 10 * 60 * 1000,
    });

    expect(
      await verifyAdminSession(token, {
        secret: SECRET,
        expectedEmail: EMAIL,
        now: NOW,
      }),
    ).toBeNull();

    expect(await verifyAdminSession("not-a-token", { secret: SECRET })).toBeNull();
    expect(await verifyAdminSession("a.b.c", { secret: SECRET })).toBeNull();
    expect(await verifyAdminSession("", { secret: SECRET })).toBeNull();
  });

  it("refuses to sign with a short secret", async () => {
    await expect(signAdminSession(EMAIL, { secret: "short", now: NOW })).rejects.toThrow(
      /ADMIN_JWT_SECRET/,
    );
  });
});

describe("admin password hashing", () => {
  const password = "correct horse battery staple";

  it("accepts the matching password and rejects a wrong one", async () => {
    const hash = await hashAdminPassword(password);

    expect(hash.startsWith("scrypt:16384:8:1:")).toBe(true);
    await expect(verifyAdminPassword(password, hash)).resolves.toBe(true);
    await expect(verifyAdminPassword("correct horse battery stapl3", hash)).resolves.toBe(false);
  });

  it("fails closed for malformed or unsupported hashes", async () => {
    await expect(verifyAdminPassword(password, "")).resolves.toBe(false);
    await expect(verifyAdminPassword(password, "plain-text")).resolves.toBe(false);
    await expect(verifyAdminPassword(password, "scrypt:1:8:1:c2FsdA:aGFzaA")).resolves.toBe(false);
    await expect(
      verifyAdminPassword(password, "scrypt:16384:8:1:not-base64:not-base64"),
    ).resolves.toBe(false);
  });

  it("requires a 12-character minimum when creating a hash", async () => {
    await expect(hashAdminPassword("too-short")).rejects.toThrow(/12 characters/);
  });

  it("compares strings without leaking length differences", () => {
    expect(timingSafeEqualString("admin@example.com", "admin@example.com")).toBe(true);
    expect(timingSafeEqualString("admin@example.com", "admin@example.org")).toBe(false);
    expect(timingSafeEqualString("short", "a-much-longer-value")).toBe(false);
  });
});

describe("safeAdminRedirect", () => {
  it("allows only paths inside the admin area", () => {
    expect(safeAdminRedirect("/admin/hotels")).toBe("/admin/hotels");
    expect(safeAdminRedirect("/admin/hotels?page=2")).toBe("/admin/hotels?page=2");
    expect(safeAdminRedirect("/admin?tab=leads")).toBe("/admin?tab=leads");
    expect(safeAdminRedirect("/admin")).toBe("/admin");
  });

  it("falls back for open redirects, malformed values, and the login page", () => {
    expect(safeAdminRedirect(undefined)).toBe("/admin");
    expect(safeAdminRedirect("")).toBe("/admin");
    expect(safeAdminRedirect("https://example.com")).toBe("/admin");
    expect(safeAdminRedirect("//example.com")).toBe("/admin");
    expect(safeAdminRedirect("/admin\\evil")).toBe("/admin");
    expect(safeAdminRedirect("/admin/login")).toBe("/admin");
    expect(safeAdminRedirect("/admin/login?next=/admin")).toBe("/admin");
    expect(safeAdminRedirect("/administrator")).toBe("/admin");
    expect(safeAdminRedirect("/admin\nx")).toBe("/admin");
  });
});

describe("login rate limit", () => {
  it("blocks after five failures and resets after the window", () => {
    resetLoginLimits();
    const key = "127.0.0.1:admin@example.com";

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(getLoginLimitStatus(key, NOW).allowed).toBe(true);
      recordLoginFailure(key, NOW);
    }

    const blocked = getLoginLimitStatus(key, NOW);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(15 * 60);

    expect(getLoginLimitStatus(key, NOW + 15 * 60 * 1000 + 1).allowed).toBe(true);
  });

  it("clears the counter after a successful sign-in", () => {
    resetLoginLimits();
    const key = "127.0.0.1:admin@example.com";

    recordLoginFailure(key, NOW);
    recordLoginFailure(key, NOW);
    clearLoginLimit(key);

    expect(getLoginLimitStatus(key, NOW).allowed).toBe(true);
  });
});
