import { NextRequest, NextResponse } from 'next/server'
import { getRateLimitConfig } from './env'
import { Redis } from 'ioredis'
import { AppError, ErrorCode } from './errors'
import logger from './logger'

// تخزين مؤقت في الذاكرة (للتنمية)
const memoryStore = new Map<string, { count: number; resetTime: number }>()

// واجهة لتخزين معدل الطلبات
interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }>
  reset(key: string): Promise<void>
}

// تخزين في الذاكرة (للتنمية)
class MemoryStore implements RateLimitStore {
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const record = memoryStore.get(key)
    
    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + windowMs }
      memoryStore.set(key, newRecord)
      return newRecord
    }
    
    record.count++
    return record
  }
  
  async reset(key: string): Promise<void> {
    memoryStore.delete(key)
  }
}

// تخزين Redis (للإنتاج)
class RedisStore implements RateLimitStore {
  private redis: Redis
  
  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379')
  }
  
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const resetTime = now + windowMs
    
    const pipeline = this.redis.pipeline()
    
    // إضافة إلى sorted set
    pipeline.zadd('rate_limit', resetTime, `${key}:${now}`)
    
    // إزالة العناصر القديمة
    pipeline.zremrangebyscore('rate_limit', 0, now)
    
    // عد العناصر
    pipeline.zcount('rate_limit', now, resetTime)
    
    // ضبط تاريخ الانتهاء
    pipeline.expire('rate_limit', Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()
    
    if (!results) {
      throw new Error('فشل في تنفيذ عملية Redis')
    }
    
    const count = results[2][1] as number
    
    return { count, resetTime }
  }
  
  async reset(key: string): Promise<void> {
    await this.redis.zremrangebyscore('rate_limit', 0, Date.now())
  }
  
  async disconnect(): Promise<void> {
    await this.redis.quit()
  }
}

// تكوين معدل الطلبات
interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
  message?: string
  keyGenerator?: (req: NextRequest) => string
  skipFailedRequests?: boolean
  skipSuccessfulRequests?: boolean
  store?: RateLimitStore
}

// تهيئة المتجر المناسب للبيئة
function createStore(): RateLimitStore {
  const env = process.env.NODE_ENV
  
  if (env === 'production' && process.env.REDIS_URL) {
    logger.info('Using Redis for rate limiting')
    return new RedisStore()
  }
  
  logger.info('Using memory store for rate limiting')
  return new MemoryStore()
}

// إنشاء مفتاح معدل الطلبات
function defaultKeyGenerator(req: NextRequest): string {
  // استخدام IP المستخدم أو معرف المستخدم
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  // إضافة المسار للتمييز بين الـ endpoints
  const path = req.nextUrl.pathname
  
  return `rate_limit:${ip}:${path}`
}

// Middleware لمعدل الطلبات
export function rateLimit(options: RateLimitOptions = {}) {
  const config = getRateLimitConfig()
  
  const windowMs = options.windowMs || config.windowMs
  const maxRequests = options.maxRequests || config.maxRequests
  const message = options.message || 'تم تجاوز الحد الأقصى للطلبات'
  const keyGenerator = options.keyGenerator || defaultKeyGenerator
  const store = options.store || createStore()
  
  return async function rateLimitMiddleware(req: NextRequest) {
    const key = keyGenerator(req)
    
    try {
      const { count, resetTime } = await store.increment(key, windowMs)
      
      // حساب الوقت المتبقي
      const remaining = Math.max(0, maxRequests - count)
      const reset = Math.ceil((resetTime - Date.now()) / 1000)
      
      // إضافة headers للمعلومات
      const headers = new Headers({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      })
      
      // التحقق من تجاوز الحد
      if (count > maxRequests) {
        logger.warn(`Rate limit exceeded for key: ${key}`, {
          count,
          maxRequests,
          remaining,
          reset,
          path: req.nextUrl.pathname,
          method: req.method,
        })
        
        return NextResponse.json(
          {
            success: false,
            error: ErrorCode.TOO_MANY_REQUESTS,
            message,
            details: {
              limit: maxRequests,
              remaining: 0,
              reset,
            },
          },
          {
            status: 429,
            headers,
          }
        )
      }
      
      // تمرير headers مع الـ request
      const response = NextResponse.next()
      headers.forEach((value, key) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error) {
      logger.error('Rate limit error', { error, key })
      
      // في حالة فشل معدل الطلبات، نواصل بدون حدود (fail open)
      return NextResponse.next()
    }
  }
}

// معدل طلبات محدد للنقاط الحرجة
export const criticalRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 1000, // دقيقة واحدة
  message: 'طلبات كثيرة جداً، حاول مرة أخرى بعد دقيقة',
})

export const authRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  message: 'محاولات دخول كثيرة، حاول مرة أخرى بعد 15 دقيقة',
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    return `auth_rate_limit:${ip}`
  },
})

export const bookingRateLimit = rateLimit({
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // ساعة
  message: 'تجاوزت الحد الأقصى للحجوزات لهذه الساعة',
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `booking_rate_limit:${userId}`
  },
})

// دالة مساعدة لتحقق من معدل الطلبات في الـ API handlers
export async function checkRateLimit(
  identifier: string,
  options?: {
    maxRequests?: number
    windowMs?: number
    store?: RateLimitStore
  }
): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}> {
  const config = getRateLimitConfig()
  const store = options?.store || createStore()
  const maxRequests = options?.maxRequests || config.maxRequests
  const windowMs = options?.windowMs || config.windowMs
  
  const key = `custom_rate_limit:${identifier}`
  const { count, resetTime } = await store.increment(key, windowMs)
  
  const remaining = Math.max(0, maxRequests - count)
  const allowed = count <= maxRequests
  
  return {
    allowed,
    remaining,
    resetTime,
    limit: maxRequests,
  }
}

// Middleware للـ Next.js API Routes
export function withRateLimit(
  handler: Function,
  options?: RateLimitOptions
) {
  const middleware = rateLimit(options)
  
  return async (req: NextRequest, ...args: any[]) => {
    const response = await middleware(req)
    
    // إذا كانت الاستجابة هي error response، ارجعها
    if (response.status === 429) {
      return response
    }
    
    // وإلا تابع إلى الـ handler
    return handler(req, ...args)
  }
}

// Utility لمسح معدل الطلبات (للاستخدام في الاختبارات)
export async function clearRateLimit(key: string): Promise<void> {
  const store = createStore()
  await store.reset(key)
}

// تهيئة عند تحميل الملف
logger.info('Rate limiting initialized', {
  store: process.env.REDIS_URL ? 'Redis' : 'Memory',
  defaultMaxRequests: getRateLimitConfig().maxRequests,
  defaultWindowMs: getRateLimitConfig().windowMs,
})

export default {
  rateLimit,
  criticalRateLimit,
  authRateLimit,
  bookingRateLimit,
  checkRateLimit,
  withRateLimit,
  clearRateLimit,
}
