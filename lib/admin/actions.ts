"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminEnv, isAdminConfigured, normaliseAdminEmail } from "./config";
import { ADMIN_LOGIN_PATH } from "./constants";
import { signAdminSession } from "./jwt";
import { timingSafeEqualString, verifyAdminPassword } from "./password";
import { clearLoginLimit, getLoginLimitStatus, recordLoginFailure } from "./rate-limit";
import { safeAdminRedirect } from "./redirect";
import { clearAdminSessionCookie, setAdminSessionCookie } from "./session";
import type { LoginState } from "./types";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email({ error: "Enter a valid email address." })),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue : "";
  const parsed = loginSchema.safeParse({
    email,
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return {
      error: "Enter a valid email address and password.",
      email,
    };
  }

  const env = getAdminEnv();

  if (!isAdminConfigured(env) || !env.email || !env.passwordHash || !env.jwtSecret) {
    console.error("Admin sign-in attempted before ADMIN_* environment variables were configured.");
    return {
      error: "Admin sign-in is not configured on this server.",
      email: parsed.data.email,
    };
  }

  const limitKey = `${await clientIp()}:${parsed.data.email}`;
  const limit = getLoginLimitStatus(limitKey);

  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      error: `Too many sign-in attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      email: parsed.data.email,
    };
  }

  // Verify both factors even when the email is wrong, so response timing does
  // not advertise whether an address is the configured admin.
  const [emailMatches, passwordMatches] = await Promise.all([
    Promise.resolve(timingSafeEqualString(parsed.data.email, normaliseAdminEmail(env.email))),
    verifyAdminPassword(parsed.data.password, env.passwordHash),
  ]);

  if (!emailMatches || !passwordMatches) {
    recordLoginFailure(limitKey);
    return {
      error: "Email or password is incorrect.",
      email: parsed.data.email,
    };
  }

  clearLoginLimit(limitKey);

  let token: string;

  try {
    token = await signAdminSession(env.email, { secret: env.jwtSecret });
  } catch (error) {
    console.error("Failed to create an admin session token", error);
    return {
      error: "Admin sign-in is not configured correctly on this server.",
      email: parsed.data.email,
    };
  }

  await setAdminSessionCookie(token);
  redirect(safeAdminRedirect(parsed.data.next));
}

export async function logoutAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect(ADMIN_LOGIN_PATH);
}
