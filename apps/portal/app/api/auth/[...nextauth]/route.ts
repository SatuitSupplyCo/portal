import type { NextRequest } from "next/server"
import { handlers } from "@repo/auth"

const { GET: authGet, POST: authPost } = handlers

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>
}

export async function GET(request: NextRequest, _context: AuthRouteContext) {
  // Delegate to Auth.js handler while conforming to Next.js route signature.
  return authGet(request as never)
}

export async function POST(request: NextRequest, _context: AuthRouteContext) {
  // Delegate to Auth.js handler while conforming to Next.js route signature.
  return authPost(request as never)
}
