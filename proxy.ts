import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secretKey = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_prod"
const key = new TextEncoder().encode(secretKey)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isAuthRoute = pathname === "/login" || pathname === "/signup" || pathname === "/"
  const isPublicRoute = pathname === "/forgot-password" || pathname === "/verify-email" || pathname === "/reset-password"

  const sessionCookie = request.cookies.get("session")?.value
  let session = null

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ["HS256"],
      })
      session = payload
    } catch {
      // Invalid or expired token
    }
  }

  // Public routes accessible to everyone (auth and unauth)
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users away from protected routes
  if (isDashboardRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
