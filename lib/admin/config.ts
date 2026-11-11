export type AdminEnv = {
  email: string | null;
  passwordHash: string | null;
  jwtSecret: string | null;
};

export function normaliseAdminEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Read the single-admin configuration at request time. Values are intentionally
 * not validated at module load: a missing secret should break sign-in with a
 * clear message, not crash the whole build.
 */
export function getAdminEnv(): AdminEnv {
  const email = process.env.ADMIN_EMAIL?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const jwtSecret = process.env.ADMIN_JWT_SECRET?.trim();

  return {
    email: email ? normaliseAdminEmail(email) : null,
    passwordHash: passwordHash || null,
    jwtSecret: jwtSecret || null,
  };
}

export function isAdminConfigured(env: AdminEnv = getAdminEnv()): boolean {
  return Boolean(env.email && env.passwordHash && env.jwtSecret && env.jwtSecret.length >= 32);
}
