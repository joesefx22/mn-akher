import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/fields',
  '/api/auth/login',
  '/api/auth/register',
  '/api/fields/list',
  '/api/fields/details'
]

// Role-based dashboard access
const roleBasedPaths: Record<string, string[]> = {
  '/dashboard/player': ['USER', 'ADMIN'],
  '/dashboard/owner': ['OWNER', 'ADMIN'],
  '/dashboard/employee': ['EMPLOYEE', 'ADMIN', 'OWNER'],
  '/dashboard/admin': ['ADMIN']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Check if path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for dashboard access
  const isDashboardPath = pathname.startsWith('/dashboard')
  
  if (isDashboardPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check role-based access
    for (const [path, allowedRoles] of Object.entries(roleBasedPaths)) {
      if (pathname.startsWith(path)) {
        if (!allowedRoles.includes(decoded.role)) {
          return NextResponse.redirect(new URL('/dashboard/player', request.url))
        }
        break
      }
    }
  }

  // Check for protected API routes
  const isProtectedApi = pathname.startsWith('/api/') && 
    !pathname.startsWith('/api/auth/') &&
    !pathname.startsWith('/api/fields/list') &&
    !pathname.startsWith('/api/fields/details')

  if (isProtectedApi) {
    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.id)
    requestHeaders.set('x-user-role', decoded.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /_static (inside /public)
     * 3. /_vercel (Vercel internals)
     * 4. /api/payments/webhook (public webhook)
     * 5. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    '/((?!_next/|_static|_vercel|api/payments/webhook|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
