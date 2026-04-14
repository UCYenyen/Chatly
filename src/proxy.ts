import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthRoute =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/presension") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile");

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminQrRoute = pathname.startsWith("/admin/presension");

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    try {
      const url = new URL("/api/auth/get-session", request.url);
      url.protocol = "http:";

      const res = await fetch(url, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
      const session = await res.json();

      if (isAdminQrRoute) {
        if (
          !session ||
          (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_QR")
        ) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } else {
        if (!session || session.user.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch (error) {
      console.error("Error checking session in proxy:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-up",
    "/sign-in",
    "/forgot-password",
    "/schedule/:path*",
    "/presension/:path*",
    "/admin/:path*",
  ],
};
