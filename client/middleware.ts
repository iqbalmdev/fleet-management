import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = request.cookies.get("fleet_auth") ?? request.cookies.get("fleet_session");
  const role = request.cookies.get("fleet_role")?.value;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const protectedPaths =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/school");

  if (protectedPaths && !auth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (auth && (pathname === "/login" || pathname === "/signup")) {
    const home = role === "driver" ? "/driver" : "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (auth && role === "driver" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/driver", request.url));
  }

  if (auth && role === "admin" && pathname.startsWith("/driver")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg)$).*)"],
};
