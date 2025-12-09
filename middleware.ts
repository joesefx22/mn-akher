import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const AUTH_PATHS = ['/login', '/register'];
const PROTECTED_PATHS = ['/dashboard', '/my-bookings', '/fields'];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value || null;
  const { pathname } = req.nextUrl;

  // 1) منع المستخدم المسجل من فتح صفحات login/register
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return NextResponse.next();
  }

  // 2) حماية المسارات الخاصة
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // attach user to request headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id.toString());
    response.headers.set('x-user-role', user.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-bookings/:path*',
    '/fields/:path*',
    '/login',
    '/register'
  ]
};
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PROTECTED_ROUTES = ["/dashboard", "/my-bookings", "/fields"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get("accessToken")?.value;

  if (!PROTECTED_ROUTES.some((route) => pathname.startsWith(route)))
    return NextResponse.next();

  if (!access) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.verify(access, process.env.JWT_SECRET!);

    (req as any).user = decoded;
    return NextResponse.next();
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-bookings/:path*", "/fields/:path*"],
};
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname
  const access = req.cookies.get('access')?.value

  const PUBLIC = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/fields/list',
    '/api/fields/details'
  ]

  if (PUBLIC.some(p => url.startsWith(p))) return NextResponse.next()

  if (!access) {
    // for pages redirect to login
    if (!url.startsWith('/api/')) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.url)
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.json({ ok:false, msg: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(access, 'access')
  if (!payload) {
    // Attempt to allow API to trigger refresh flow client-side; for pages force login
    if (!url.startsWith('/api/')) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.url)
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.json({ ok:false, msg:'Unauthorized' }, { status: 401 })
  }

  // role-based guards for dashboard
  if (url.startsWith('/dashboard')) {
    const role = (payload as any).role?.toLowerCase?.() || ''
    if (url.includes('/owner') && role !== 'owner') return NextResponse.redirect(new URL('/', req.url))
    if (url.includes('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/', req.url))
    if (url.includes('/employee') && role !== 'employee') return NextResponse.redirect(new URL('/', req.url))
  }

  const res = NextResponse.next()
  // security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/fields/:path*', '/my-bookings']
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const access = req.cookies.get('access')?.value
  const url = req.nextUrl.pathname

  const PUBLIC = [
    '/login',
    '/register',
    '/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/fields/list',
    '/api/fields/details'
  ]

  if (PUBLIC.some((p) => url.startsWith(p))) {
    return NextResponse.next()
  }

  if (!access) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const user = verifyToken(access, 'access')
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (url.startsWith('/dashboard')) {
    if (url.includes('/owner') && user.role !== 'owner')
      return NextResponse.redirect(new URL('/', req.url))
    if (url.includes('/admin') && user.role !== 'admin')
      return NextResponse.redirect(new URL('/', req.url))
    if (url.includes('/employee') && user.role !== 'employee')
      return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}

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
