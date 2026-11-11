import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import { verifyAdminSession } from "@/lib/admin/jwt";

/**
 * Optimistic gate for the admin area. It verifies the JWT signature and expiry
 * so an obviously unauthenticated request never renders the shell, but the
 * admin layout and every action still call requireAdminSession().
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  let isSignedIn = false;

  if (token) {
    const session = await verifyAdminSession(token);
    isSignedIn = Boolean(session);
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isSignedIn) {
      return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (!isSignedIn) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
