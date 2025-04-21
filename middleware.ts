import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simplified middleware for demo purposes
  // In a real application, you would verify JWT tokens or session cookies

  const isAuthenticated = request.cookies.get("isAuthenticated")?.value === "true"
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isAuthPage && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If the user is authenticated and trying to access auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
