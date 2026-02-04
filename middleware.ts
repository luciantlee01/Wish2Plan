import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Let the app layout handle authentication checks
  // This middleware just passes through - authentication is checked in app/app/layout.tsx
  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*"],
}

