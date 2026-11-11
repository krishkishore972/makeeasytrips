import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

function isSupportedParams(n: number, r: number, p: number): boolean {
  return (
    Number.isInteger(n) &&
    n >= 4096 &&
    n <= 1_048_576 &&
    (n & (n - 1)) === 0 &&
    Number.isInteger(r) &&
    r >= 1 &&
    r <= 16 &&
    Number.isInteger(p) &&
    p >= 1 &&
    p <= 4
  );
}

/**
 * Hash a password for ADMIN_PASSWORD_HASH. Format:
 * scrypt:N:r:p:saltBase64Url:hashBase64Url
 *
 * Colons are used instead of the more common `$` separators because Next's
 * env loader expands `$name` inside .env values, which would silently corrupt
 * the stored hash before this module ever sees it.
 */
export async function hashAdminPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error("Choose a password with at least 12 characters.");
  }

  const salt = randomBytes(SALT_LENGTH);
  const hash = await deriveKey(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join(":");
}

/**
 * Verify a password against the stored hash. Malformed or unsupported hashes
 * fail closed so a broken .env.local cannot accidentally grant access.
 */
export async function verifyAdminPassword(password: string, encoded: string): Promise<boolean> {
  const separator = encoded.includes(":") ? ":" : "$";
  const parts = encoded.split(separator);

  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);

  if (!isSupportedParams(n, r, p)) {
    return false;
  }

  let salt: Buffer;
  let expected: Buffer;

  try {
    salt = Buffer.from(parts[4], "base64url");
    expected = Buffer.from(parts[5], "base64url");
  } catch {
    return false;
  }

  if (salt.length < 8 || expected.length < 32 || expected.length > 128) {
    return false;
  }

  try {
    const actual = await deriveKey(password, salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: Math.max(64 * 1024 * 1024, 128 * n * r + 1024),
    });

    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Constant-time comparison for the configured admin email. */
export function timingSafeEqualString(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return timingSafeEqual(leftBytes, rightBytes);
}
