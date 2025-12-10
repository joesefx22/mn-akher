import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import prisma from './prisma'

// Configuration
const JWT_SECRET = process.env.JWT_SECRET!
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const SALT_ROUNDS = 12

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Token Generation
export function generateAccessToken(payload: { id: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

export function generateTokens(user: { id: string; role: string }) {
  const accessToken = generateAccessToken({ id: user.id, role: user.role })
  const refreshToken = generateRefreshToken({ id: user.id })
  
  return { accessToken, refreshToken }
}

// Token Verification
export function verifyToken(token: string): { id: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string }
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string }
  } catch (error) {
    return null
  }
}

// Cookie Management (Server Side)
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  })
  
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  
  // Clear any old cookie names for backward compatibility
  cookieStore.delete('token')
}

// User Management
export async function getCurrentUser(request?: NextRequest) {
  try {
    let token: string | undefined
    
    if (request) {
      // Get token from request cookies
      token = request.cookies.get('access_token')?.value
    } else {
      // Get token from server cookies
      const cookieStore = await cookies()
      token = cookieStore.get('access_token')?.value
    }
    
    if (!token) {
      return null
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        deletedAt: null // Exclude soft deleted users
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(
  request: NextRequest,
  requiredRole?: string
): Promise<{ user: any; error?: string }> {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return { 
        user: null, 
        error: 'يجب تسجيل الدخول للوصول إلى هذا المورد' 
      }
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return { 
        user: null, 
        error: 'غير مصرح لك بالوصول إلى هذا المورد' 
      }
    }
    
    return { user }
  } catch (error) {
    console.error('Auth requirement error:', error)
    return { 
      user: null, 
      error: 'حدث خطأ في التحقق من الصلاحيات' 
    }
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  success: boolean
  accessToken?: string
  error?: string
}> {
  try {
    const decoded = verifyRefreshToken(refreshToken)
    
    if (!decoded) {
      return { 
        success: false, 
        error: 'توكن التحديث غير صالح أو منتهي الصلاحية' 
      }
    }
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        deletedAt: null 
      },
      select: { id: true, role: true }
    })
    
    if (!user) {
      return { 
        success: false, 
        error: 'المستخدم غير موجود' 
      }
    }
    
    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role
    })
    
    return { success: true, accessToken }
  } catch (error) {
    console.error('Token refresh error:', error)
    return { 
      success: false, 
      error: 'حدث خطأ أثناء تجديد التوكن' 
    }
  }
}

// Middleware Helper for API Routes
export async function authenticateRequest(
  request: NextRequest,
  options?: {
    requiredRole?: string
    publicRoutes?: string[]
  }
): Promise<{
  authenticated: boolean
  user?: any
  error?: string
  status?: number
}> {
  // Check if route is public
  const pathname = request.nextUrl.pathname
  if (options?.publicRoutes?.some(route => pathname.startsWith(route))) {
    return { authenticated: true }
  }
  
  const { user, error } = await requireAuth(request, options?.requiredRole)
  
  if (error) {
    return {
      authenticated: false,
      error,
      status: error.includes('يجب تسجيل الدخول') ? 401 : 403
    }
  }
  
  return {
    authenticated: true,
    user
  }
}

// Rate Limiting Helper
export function createRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return function isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const userRequests = requests.get(identifier)
    
    if (!userRequests) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (userRequests.count >= maxRequests) {
      return true
    }
    
    userRequests.count++
    return false
  }
}

// Password Strength Checker
export function checkPasswordStrength(password: string): {
  score: number // 0-4
  strength: 'ضعيف' | 'متوسط' | 'جيد' | 'قوي' | 'قوي جداً'
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 8) score++
  else feedback.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل')
  
  // Lowercase check
  if (/[a-z]/.test(password)) score++
  else feedback.push('أضف أحرفاً صغيرة')
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score++
  else feedback.push('أضف أحرفاً كبيرة')
  
  // Number check
  if (/\d/.test(password)) score++
  else feedback.push('أضف أرقاماً')
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  else feedback.push('أضف رموزاً خاصة')
  
  // Determine strength
  const strengths = ['ضعيف', 'متوسط', 'جيد', 'قوي', 'قوي جداً'] as const
  const strength = strengths[score] || 'ضعيف'
  
  return { score, strength, feedback }
}

// Generate Password Reset Token
export function generatePasswordResetToken(): string {
  const token = jwt.sign(
    { 
      type: 'password_reset',
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
  
  return token
}

// Verify Password Reset Token
export function verifyPasswordResetToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.type === 'password_reset' && Date.now() - decoded.timestamp < 3600000 // 1 hour
  } catch {
    return false
  }
}
