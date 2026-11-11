import { ADMIN_SESSION_TTL_SECONDS } from "./constants";
import { getAdminEnv, normaliseAdminEmail } from "./config";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type AdminSession = {
  email: string;
  issuedAt: number;
  expiresAt: number;
};

type SignOptions = {
  secret?: string;
  now?: number;
  ttlSeconds?: number;
  jti?: string;
};

type VerifyOptions = {
  secret?: string;
  expectedEmail?: string;
  now?: number;
};

type JwtPayload = {
  sub?: unknown;
  email?: unknown;
  iat?: unknown;
  exp?: unknown;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function resolveSecret(secret: string | undefined): string {
  const value = secret ?? getAdminEnv().jwtSecret;

  if (!value || value.length < 32) {
    throw new Error("ADMIN_JWT_SECRET must be set to at least 32 characters.");
  }

  return value;
}

/**
 * Sign a compact HS256 JWT using Web Crypto so the same code runs in the
 * proxy, route handlers, Server Components, and tests.
 */
export async function signAdminSession(email: string, options: SignOptions = {}): Promise<string> {
  const secret = resolveSecret(options.secret);
  const now = options.now ?? Date.now();
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + (options.ttlSeconds ?? ADMIN_SESSION_TTL_SECONDS);

  const header = bytesToBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = bytesToBase64Url(
    encoder.encode(
      JSON.stringify({
        sub: "admin",
        email: normaliseAdminEmail(email),
        iat: issuedAt,
        exp: expiresAt,
        jti: options.jti ?? crypto.randomUUID(),
      }),
    ),
  );
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    encoder.encode(signingInput),
  );

  return `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verify the signature, claims, expiry, and admin identity. Returns null for
 * anything untrusted so callers only have to handle "signed in" or "not".
 */
export async function verifyAdminSession(
  token: string,
  options: VerifyOptions = {},
): Promise<AdminSession | null> {
  let secret: string;

  try {
    secret = resolveSecret(options.secret);
  } catch {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  try {
    const header = JSON.parse(decoder.decode(base64UrlToBytes(encodedHeader))) as {
      alg?: unknown;
      typ?: unknown;
    };

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const validSignature = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      base64UrlToBytes(encodedSignature),
      encoder.encode(`${encodedHeader}.${encodedPayload}`),
    );

    if (!validSignature) {
      return null;
    }

    const payload = JSON.parse(decoder.decode(base64UrlToBytes(encodedPayload))) as JwtPayload;

    if (
      payload.sub !== "admin" ||
      typeof payload.email !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    const expectedEmail = normaliseAdminEmail(options.expectedEmail ?? getAdminEnv().email ?? "");

    if (!expectedEmail || payload.email !== expectedEmail) {
      return null;
    }

    const nowSeconds = Math.floor((options.now ?? Date.now()) / 1000);

    if (payload.exp <= nowSeconds || payload.iat > nowSeconds + 300) {
      return null;
    }

    return {
      email: payload.email,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}
