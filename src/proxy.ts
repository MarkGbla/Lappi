import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge-layer redirect for unauthenticated requests. This is a cheap
// convenience — auth is authoritatively verified inside each server action
// and API route via requireAuth()/getSession(). Per Next 16 proxy.md,
// don't rely on proxy alone for authorization.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/_next") ||
    /\.(ico|png|jpe?g|svg|webp|gif|webmanifest|js|css|map|woff2?|ttf)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token")

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
