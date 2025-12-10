import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import prisma from './prisma'
import { USER_ROLES } from './constants'
import { AppError, ErrorCode } from './errors'
import logger from './logger'
import env from './env'

// Configuration
const JWT_SECRET = env.JWT_SECRET!
const JWT_ACCESS_EXPIRY = env.JWT_ACCESS_EXPIRY || '15m'
const JWT_REFRESH_EXPIRY = env.JWT_REFRESH_EXPIRY || '7d'
const SALT_ROUNDS = 12

// Types
interface TokenPayload {
  id: string
  role: string
  email: string
  name: string
  iat?: number
  exp?: number
}

interface RefreshTokenPayload {
  id: string
  iat?: number
  exp?: number
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

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
export function generateAccessToken(user: AuthUser): string {
  const payload: TokenPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  }
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_ACCESS_EXPIRY,
    issuer: 'booking-system',
    audience: 'user',
  })
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'booking-system',
    audience: 'refresh',
  })
}

export function generateTokens(user: AuthUser): {
  accessToken: string
  refreshToken: string
} {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user.id),
  }
}

// Token Verification
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'booking-system',
      audience: 'user',
    }) as TokenPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Access token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.debug('Invalid access token')
    }
    return null
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'booking-system',
      audience: 'refresh',
    }) as RefreshTokenPayload
  } catch (error) {
    logger.debug('Invalid refresh token', { error: error.message })
    return null
  }
}

// دالة موحدة للتحقق من التوكن
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return null
    }

    // التحقق من وجود المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        deletedAt: null 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    if (!user) {
      logger.warn('User not found for valid token', { userId: decoded.id })
      return null
    }

    // التحقق من تطابق البيانات
    if (user.email !== decoded.email || user.role !== decoded.role) {
      logger.warn('Token data mismatch with database', {
        token: { email: decoded.email, role: decoded.role },
        db: { email: user.email, role: user.role },
      })
      return null
    }

    return user
  } catch (error) {
    logger.error('Token verification error', { error })
    return null
  }
}

// Cookie Management
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies()
  
  // Access Token Cookie
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes in seconds
    path: '/',
  })
  
  // Refresh Token Cookie
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  })
  
  // Legacy token cookie for compatibility
  cookieStore.set('token', accessToken, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days for compatibility
    path: '/',
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('token')
}

export async function getAuthCookies(): Promise<{
  accessToken?: string
  refreshToken?: string
  legacyToken?: string
}> {
  const cookieStore = await cookies()
  
  return {
    accessToken: cookieStore.get('access_token')?.value,
    refreshToken: cookieStore.get('refresh_token')?.value,
    legacyToken: cookieStore.get('token')?.value,
  }
}

// User Management
export async function getCurrentUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    let token: string | undefined
    
    if (request) {
      // Get from request cookies
      token = request.cookies.get('access_token')?.value || 
              request.cookies.get('token')?.value
    } else {
      // Get from server cookies
      const cookies = await getAuthCookies()
      token = cookies.accessToken || cookies.legacyToken
    }
    
    if (!token) {
      return null
    }
    
    return await verifyToken(token)
  } catch (error) {
    logger.error('Error getting current user', { error })
    return null
  }
}

export async function requireAuth(
  request: NextRequest,
  requiredRole?: string
): Promise<{ user: AuthUser; error?: AppError }> {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return { 
        user: null as any, 
        error: new AppError(
          'يجب تسجيل الدخول للوصول إلى هذا المورد',
          ErrorCode.UNAUTHORIZED,
          401
        )
      }
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return { 
        user: null as any, 
        error: new AppError(
          'غير مصرح لك بالوصول إلى هذا المورد',
          ErrorCode.FORBIDDEN,
          403
        )
      }
    }
    
    return { user }
  } catch (error) {
    logger.error('Auth requirement error', { error })
    return { 
      user: null as any, 
      error: new AppError(
        'حدث خطأ في التحقق من الصلاحيات',
        ErrorCode.INTERNAL_SERVER_ERROR,
        500
      )
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
      select: { 
        id: true, 
        name: true,
        email: true,
        role: true 
      }
    })
    
    if (!user) {
      return { 
        success: false, 
        error: 'المستخدم غير موجود' 
      }
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(user)
    
    logger.debug('Access token refreshed', { userId: user.id })
    
    return { success: true, accessToken }
  } catch (error) {
    logger.error('Token refresh error', { error })
    return { 
      success: false, 
      error: 'حدث خطأ أثناء تجديد التوكن' 
    }
  }
}

// Authentication Flow
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        email,
        deletedAt: null 
      }
    })
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email })
      return { 
        success: false, 
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      }
    }
    
    const isValidPassword = await comparePasswords(password, user.password)
    
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { email })
      return { 
        success: false, 
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      }
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    logger.info('User authenticated successfully', { userId: user.id, email })
    
    return { 
      success: true, 
      user: userWithoutPassword as AuthUser 
    }
  } catch (error) {
    logger.error('Authentication error', { email, error })
    return { 
      success: false, 
      error: 'حدث خطأ أثناء المصادقة' 
    }
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return { 
        success: false, 
        error: 'البريد الإلكتروني مسجل بالفعل' 
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: USER_ROLES.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
    
    logger.info('User registered successfully', { userId: user.id, email })
    
    return { 
      success: true, 
      user: user as AuthUser 
    }
  } catch (error) {
    logger.error('Registration error', { email, error })
    return { 
      success: false, 
      error: 'حدث خطأ أثناء إنشاء الحساب' 
    }
  }
}

// Password Reset
export function generatePasswordResetToken(userId: string): string {
  return jwt.sign(
    { 
      id: userId,
      type: 'password_reset',
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export function verifyPasswordResetToken(token: string): {
  valid: boolean
  userId?: string
  error?: string
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (decoded.type !== 'password_reset') {
      return { valid: false, error: 'نوع التوكن غير صالح' }
    }
    
    // Check if token is expired (1 hour)
    if (Date.now() - decoded.timestamp > 3600000) {
      return { valid: false, error: 'انتهت صلاحية الرابط' }
    }
    
    return { valid: true, userId: decoded.id }
  } catch (error) {
    return { valid: false, error: 'توكن غير صالح' }
  }
}

// Security Utilities
export function checkPasswordStrength(password: string): {
  score: number // 0-4
  strength: 'ضعيف' | 'متوسط' | 'جيد' | 'قوي' | 'قوي جداً'
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check (min 8)
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

export function sanitizeUserData(user: any): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

// Session Management
export async function createUserSession(user: AuthUser) {
  const tokens = generateTokens(user)
  await setAuthCookies(tokens.accessToken, tokens.refreshToken)
  return tokens
}

export async function destroyUserSession() {
  await clearAuthCookies()
}

// Export types
export type { AuthUser, TokenPayload, RefreshTokenPayload }
