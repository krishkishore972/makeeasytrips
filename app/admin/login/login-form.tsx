"use client";

import { Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/lib/admin/actions";
import type { LoginState } from "@/lib/admin/types";

const initialState: LoginState = {};

const fieldClassName =
  "mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-soft focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const errorId = "admin-login-error";

  return (
    <form action={formAction} className="mt-8 space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="admin-email"
          className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
        >
          Admin email
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 mt-0.5 size-4 -translate-y-1/2 text-muted-soft"
          />
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={state.email ?? ""}
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? errorId : undefined}
            placeholder="admin@example.com"
            className={`${fieldClassName} pl-9`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="text-[10px] font-extrabold tracking-[0.12em] text-muted-soft uppercase"
        >
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 mt-0.5 size-4 -translate-y-1/2 text-muted-soft"
          />
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? errorId : undefined}
            className={`${fieldClassName} pl-9`}
          />
        </div>
      </div>

      {state.error ? (
        <p
          id={errorId}
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5 text-[11px] leading-5 font-bold text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn aria-hidden="true" className="size-4" />
            Sign in to admin
          </>
        )}
      </button>

      <p className="text-[11px] leading-5 text-muted-soft">
        Admin access only. The session is stored in an HttpOnly cookie and expires after eight
        hours.
      </p>
    </form>
  );
}
