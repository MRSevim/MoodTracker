import { routes } from "./utils/routes";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const authenticatedRoutes = [routes.dashboard, routes.settings];

export const middleware = async (request: NextRequest) => {
  const requiresAuth = authenticatedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && requiresAuth) {
    return NextResponse.redirect(new URL(routes.signIn, request.url));
  }

  if (sessionCookie && request.nextUrl.pathname.startsWith(routes.signIn)) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
