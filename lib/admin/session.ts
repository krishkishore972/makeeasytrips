import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_LOGIN_PATH, ADMIN_SESSION_TTL_SECONDS } from "./constants";
import { verifyAdminSession, type AdminSession } from "./jwt";

export async function setAdminSessionCookie(token: string): Promise<void> {
  const store = await cookies();

  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSession(token);
}

/**
 * Authorization for Server Components, Server Actions, and route handlers.
 * The proxy is only an optimistic gate; every admin surface calls this too.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return session;
}
