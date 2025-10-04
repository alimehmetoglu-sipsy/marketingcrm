import { auth } from "@/lib/auth-middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkMenuPermission } from "@/lib/permissions"

export default auth(async function middleware(req: NextRequest & { auth: any }) {
  const session = req.auth
  const pathname = req.nextUrl.pathname

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Route permission mapping
  const routePermissions: { [key: string]: string } = {
    "/dashboard": "dashboard",
    "/leads": "leads",
    "/investors": "investors",
    "/tasks": "tasks",
    "/activities": "activities",
    "/reports": "reports",
    "/settings/lead-fields": "settings.leadFields",
    "/settings/investor-fields": "settings.investorFields",
    "/settings/activity-types": "settings.activityTypes",
    "/settings/users": "settings.users",
    "/settings/roles": "settings.roles",
    "/settings": "settings",
  }

  // Check permission for the current route
  for (const [route, permission] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      const hasPermission = checkMenuPermission(session.user?.permissions, permission)

      if (!hasPermission) {
        // Redirect to dashboard with error
        const dashboardUrl = new URL("/dashboard", req.url)
        dashboardUrl.searchParams.set("error", "unauthorized")
        return NextResponse.redirect(dashboardUrl)
      }
      break
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
}
