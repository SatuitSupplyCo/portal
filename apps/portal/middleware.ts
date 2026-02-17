/**
 * Portal middleware — authentication + surface access enforcement.
 *
 * Runs on every request (except static assets). Ensures:
 * 1. Public routes (auth, api/auth) are accessible without session
 * 2. All other routes require authentication
 * 3. Users can only access surfaces their role permits
 */
import { auth } from "@repo/auth"
import { NextResponse } from "next/server"

const INTERNAL_ROLES = ["owner", "admin", "editor", "internal_viewer"]
const ADMIN_ROLES = ["owner", "admin"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // ── Public routes ────────────────────────────────────────────────
  if (pathname.startsWith("/api/auth") || pathname === "/api/health") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/auth")) {
    // Redirect authenticated users away from auth pages
    if (req.auth) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // Invitation pages are public (landing page handles auth redirect itself)
  if (pathname.startsWith("/invite")) {
    return NextResponse.next()
  }

  // ── Require authentication ───────────────────────────────────────
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const role = req.auth.user.role

  // ── Surface access enforcement ───────────────────────────────────
  if (pathname.startsWith("/internal") && !INTERNAL_ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith("/partners")) {
    if (!INTERNAL_ROLES.includes(role) && role !== "partner_viewer") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (pathname.startsWith("/vendors")) {
    if (!INTERNAL_ROLES.includes(role) && role !== "vendor_viewer") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|product/).*)"],
}
