import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { USER_ROLES } from '@/lib/constants'
import { rateLimit, authRateLimit } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { AppError, ErrorCode } from '@/lib/errors'

// المسارات العامة التي لا تحتاج مصادقة
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
  '/fields',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
]

// مسارات الـ API العامة
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/fields/list',
  '/api/fields/details',
  '/api/areas/list',
  '/api/payments/webhook', // مهم: public للـ webhooks
]

// وصول حسب الدور
const ROLE_BASED_ACCESS: Record<string, string[]> = {
  // الداشبوردات
  '/dashboard/player': [USER_ROLES.USER, USER_ROLES.PLAYER, USER_ROLES.ADMIN],
  '/dashboard/owner': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  '/dashboard/employee': [USER_ROLES.EMPLOYEE, USER_ROLES.OWNER, USER_ROLES.ADMIN],
  '/dashboard/admin': [USER_ROLES.ADMIN],
  
  // API حسب الدور
  '/api/fields/create': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  '/api/fields/update': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  '/api/schedule/generate': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  '/api/owner': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  '/api/admin': [USER_ROLES.ADMIN],
  '/api/employee': [USER_ROLES.EMPLOYEE, USER_ROLES.OWNER, USER_ROLES.ADMIN],
}

// Middleware الرئيسي
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const startTime = Date.now()

  try {
    // 1. تسجيل الطلب
    logger.http(`[${request.method}] ${pathname}`, {
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    })

    // 2. التحقق من المسارات العامة
    if (isPublicPath(pathname)) {
      // منع المستخدم المسجل من الوصول لصفحات المصادقة
      if (isAuthPath(pathname) && token) {
        const user = await verifyToken(token)
        if (user) {
          return redirectToDashboard(request, user.role)
        }
      }
      return addSecurityHeaders(NextResponse.next())
    }

    // 3. معدل الطلبات للنقاط الحرجة
    if (isAuthPath(pathname)) {
      const rateLimitResponse = await authRateLimit(request)
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse
      }
    }

    // 4. التحقق من المصادقة
    if (!token) {
      return handleUnauthorized(request, pathname)
    }

    const user = await verifyToken(token)
    if (!user) {
      return handleUnauthorized(request, pathname)
    }

    // 5. التحقق من الوصول حسب الدور
    const roleAccessError = checkRoleAccess(pathname, user.role)
    if (roleAccessError) {
      return roleAccessError
    }

    // 6. إضافة معلومات المستخدم للـ headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-user-email', user.email)

    // 7. التحقق من API المحمية
    if (isProtectedApiPath(pathname)) {
      // معدل الطلبات للـ API المحمية
      const rateLimitResponse = await rateLimit(request)
      if (rateLimitResponse.status === 429) {
        return rateLimitResponse
      }
    }

    // 8. المتابعة مع الـ headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // 9. إضافة headers الأمنية
    addSecurityHeaders(response)

    // 10. تسجيل نجاح الطلب
    const responseTime = Date.now() - startTime
    logger.http(`[${request.method}] ${pathname} - ${response.status}`, {
      userId: user.id,
      userRole: user.role,
      responseTime,
      status: response.status,
    })

    return response

  } catch (error) {
    // 11. معالجة الأخطاء
    const responseTime = Date.now() - startTime
    logger.error(`Middleware error: ${pathname}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime,
    })

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          status: 'error',
          error: error.code,
          message: error.message,
        },
        { status: error.statusCode }
      )
    }

    // للأخطاء غير المتوقعة، نعيد توجيه لصفحة الخطأ
    if (!pathname.startsWith('/api/')) {
      const errorUrl = new URL('/error', request.url)
      errorUrl.searchParams.set('message', 'حدث خطأ غير متوقع')
      return NextResponse.redirect(errorUrl)
    }

    return NextResponse.json(
      {
        status: 'error',
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'خطأ داخلي في الخادم',
      },
      { status: 500 }
    )
  }
}

// دوال مساعدة
function isPublicPath(pathname: string): boolean {
  // المسارات العامة
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return true
  }

  // API العامة
  if (PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
    return true
  }

  // الملفات الثابتة
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_static/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return true
  }

  return false
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith('/login') || 
         pathname.startsWith('/register') ||
         pathname.startsWith('/forgot-password') ||
         pathname.startsWith('/reset-password') ||
         pathname.startsWith('/api/auth/')
}

function isProtectedApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/') && 
         !PUBLIC_API_PATHS.some(path => pathname.startsWith(path))
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

function checkRoleAccess(pathname: string, userRole: string): NextResponse | null {
  for (const [path, allowedRoles] of Object.entries(ROLE_BASED_ACCESS)) {
    if (pathname.startsWith(path)) {
      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Role access denied: ${userRole} trying to access ${pathname}`)
        
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            {
              status: 'error',
              error: ErrorCode.FORBIDDEN,
              message: 'غير مصرح بالوصول لهذا المورد',
            },
            { status: 403 }
          )
        }
        
        // توجيه للداشبورد المناسب
        return redirectToDashboard(null, userRole)
      }
      break
    }
  }
  return null
}

function handleUnauthorized(request: NextRequest, pathname: string): NextResponse {
  logger.warn(`Unauthorized access attempt: ${pathname}`)
  
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        status: 'error',
        error: ErrorCode.UNAUTHORIZED,
        message: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
      },
      { status: 401 }
    )
  }
  
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  loginUrl.searchParams.set('message', 'يجب تسجيل الدخول للوصول لهذه الصفحة')
  
  return NextResponse.redirect(loginUrl)
}

function redirectToDashboard(request: NextRequest | null, userRole: string): NextResponse {
  let dashboardPath = '/dashboard/player'
  
  switch (userRole) {
    case USER_ROLES.ADMIN:
      dashboardPath = '/dashboard/admin'
      break
    case USER_ROLES.OWNER:
      dashboardPath = '/dashboard/owner'
      break
    case USER_ROLES.EMPLOYEE:
      dashboardPath = '/dashboard/employee'
      break
  }
  
  if (request) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }
  
  return NextResponse.redirect(new URL(dashboardPath))
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // CSP Header للـ Next.js
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'self'",
    "media-src 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CORS headers للـ API
  if (response.headers.get('content-type')?.includes('application/json')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_BASE_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

// التكوين
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /_static (static files)
     * 3. /_vercel (Vercel internals)
     * 4. /api/auth/refresh (handled specially)
     * 5. Static files with extensions
     */
    '/((?!_next/|_static|_vercel|api/auth/refresh|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
