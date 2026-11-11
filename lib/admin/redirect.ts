import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "./constants";

/**
 * Only allow redirects back into the admin area. This prevents the login form
 * from being used as an open redirect, and keeps `next` from pointing at the
 * login page itself (which would loop).
 */
export function safeAdminRedirect(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string") {
    return ADMIN_HOME_PATH;
  }

  const target = value.trim();
  const isAdminPath =
    target === ADMIN_HOME_PATH ||
    target.startsWith(`${ADMIN_HOME_PATH}/`) ||
    target.startsWith(`${ADMIN_HOME_PATH}?`);

  if (!isAdminPath) {
    return ADMIN_HOME_PATH;
  }

  if (
    target.startsWith("//") ||
    target.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(target) ||
    target === ADMIN_LOGIN_PATH ||
    target.startsWith(`${ADMIN_LOGIN_PATH}?`)
  ) {
    return ADMIN_HOME_PATH;
  }

  return target;
}
