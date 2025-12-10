import { NextRequest, NextResponse } from 'next/server'
import { Redis } from 'ioredis'
import { AppError, ErrorCode } from './errors'
import logger from './logger'
import env from './env'
import { MIDDLEWARE_CONFIG } from './constants'

// Types
interface RateLimitRecord {
  count: number
  resetTime: number
}

interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
  message?: string
  keyGenerator?: (req: NextRequest) => string
  skipFailedRequests?: boolean
  skipSuccessfulRequests?: boolean
  store?: RateLimitStore
  identifier?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
  retryAfter?: number
}

interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitRecord>
  reset(key: string): Promise<void>
  get(key: string): Promise<RateLimitRecord | null>
}

// Memory Store (for development)
class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitRecord>()
  
  async increment(key: string, windowMs: number): Promise<RateLimitRecord> {
    const now = Date.now()
    const record = this.store.get(key)
    
    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + windowMs }
      this.store.set(key, newRecord)
      return newRecord
    }
    
    record.count++
    return record
  }
  
  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }
  
  async get(key: string): Promise<RateLimitRecord | null> {
    return this.store.get(key) || null
  }
  
  async cleanup(): Promise<void> {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Redis Store (for production)
class RedisStore implements RateLimitStore {
  private redis: Redis
  private prefix = 'rate_limit:'
  
  constructor(redisUrl?: string) {
    const url = redisUrl || env.REDIS_URL || 'redis://localhost:6379'
    this.redis = new Redis(url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
    })
    
    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message })
    })
    
    this.redis.on('connect', () => {
      logger.info('Redis connected successfully')
    })
  }
  
  async increment(key: string, windowMs: number): Promise<RateLimitRecord> {
    const now = Date.now()
    const resetTime = now + windowMs
    const redisKey = this.prefix + key
    
    const pipeline = this.redis.pipeline()
    
    // Add current timestamp to sorted set
    pipeline.zadd(redisKey, resetTime, `${now}:${Math.random()}`)
    
    // Remove expired entries
    pipeline.zremrangebyscore(redisKey, 0, now)
    
    // Count entries in window
    pipeline.zcount(redisKey, now, resetTime)
    
    // Set expiration
    pipeline.expire(redisKey, Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()
    
    if (!results || results.some(result => result[0])) {
      throw new Error('Redis operation failed')
    }
    
    const count = results[2][1] as number
    
    return { count, resetTime }
  }
  
  async reset(key: string): Promise<void> {
    await this.redis.del(this.prefix + key)
  }
  
  async get(key: string): Promise<RateLimitRecord | null> {
    const now = Date.now()
    const redisKey = this.prefix + key
    
    const count = await this.redis.zcount(redisKey, now, now + 3600000) // 1 hour window
    const ttl = await this.redis.ttl(redisKey)
    
    if (ttl <= 0) {
      return null
    }
    
    return {
      count,
      resetTime: now + (ttl * 1000),
    }
  }
  
  async disconnect(): Promise<void> {
    await this.redis.quit()
  }
  
  async getStats(): Promise<{
    totalKeys: number
    memoryUsage: number
    connected: boolean
  }> {
    try {
      const info = await this.redis.info()
      const memoryMatch = info.match(/used_memory_human:(\S+)/)
      
      return {
        totalKeys: await this.redis.dbsize(),
        memoryUsage: memoryMatch ? parseFloat(memoryMatch[1]) : 0,
        connected: this.redis.status === 'ready',
      }
    } catch (error) {
      return {
        totalKeys: 0,
        memoryUsage: 0,
        connected: false,
      }
    }
  }
}

// Store Factory
function createStore(): RateLimitStore {
  const useRedis = env.isProduction() && env.REDIS_URL
  
  if (useRedis) {
    try {
      return new RedisStore()
    } catch (error) {
      logger.error('Failed to create Redis store, falling back to memory', { error })
      return new MemoryStore()
    }
  }
  
  return new MemoryStore()
}

// Default store instance
const defaultStore = createStore()

// Key Generators
export function defaultKeyGenerator(req: NextRequest): string {
  const ip = getClientIp(req)
  const path = req.nextUrl.pathname
  const method = req.method
  
  return `global:${ip}:${method}:${path}`
}

export function authKeyGenerator(req: NextRequest): string {
  const ip = getClientIp(req)
  return `auth:${ip}`
}

export function userKeyGenerator(req: NextRequest): string {
  const userId = req.headers.get('x-user-id') || 'anonymous'
  return `user:${userId}`
}

export function apiKeyGenerator(req: NextRequest): string {
  const ip = getClientIp(req)
  const path = req.nextUrl.pathname
  return `api:${ip}:${path}`
}

// IP Address Utilities
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to connection IP (for Node.js)
  const connection = (req as any).connection
  const socket = (req as any).socket
  
  return connection?.remoteAddress || 
         socket?.remoteAddress || 
         req.ip || 
         'unknown'
}

// Rate Limit Checker
export async function checkRateLimit(
  key: string,
  options: {
    maxRequests?: number
    windowMs?: number
    store?: RateLimitStore
  } = {}
): Promise<RateLimitResult> {
  const store = options.store || defaultStore
  const maxRequests = options.maxRequests || MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL.maxRequests
  const windowMs = options.windowMs || MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL.windowMs
  
  try {
    const { count, resetTime } = await store.increment(key, windowMs)
    
    const remaining = Math.max(0, maxRequests - count)
    const allowed = count <= maxRequests
    const retryAfter = allowed ? undefined : Math.ceil((resetTime - Date.now()) / 1000)
    
    logger.debug('Rate limit check', {
      key,
      count,
      maxRequests,
      remaining,
      allowed,
      retryAfter,
    })
    
    return {
      allowed,
      remaining,
      resetTime,
      limit: maxRequests,
      retryAfter,
    }
  } catch (error) {
    logger.error('Rate limit check failed', { key, error })
    
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: maxRequests,
      resetTime: Date.now() + windowMs,
      limit: maxRequests,
    }
  }
}

// Rate Limit Middleware
export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL.windowMs
  const maxRequests = options.maxRequests || MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL.maxRequests
  const message = options.message || 'تم تجاوز الحد الأقصى للطلبات'
  const keyGenerator = options.keyGenerator || defaultKeyGenerator
  const store = options.store || defaultStore
  
  return async function rateLimitMiddleware(req: NextRequest) {
    const key = keyGenerator(req)
    
    try {
      const result = await checkRateLimit(key, { maxRequests, windowMs, store })
      
      // Create response with rate limit headers
      const headers = new Headers({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      })
      
      if (result.retryAfter) {
        headers.set('Retry-After', result.retryAfter.toString())
      }
      
      // Check if rate limited
      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          key,
          maxRequests,
          count: maxRequests - result.remaining,
          retryAfter: result.retryAfter,
          path: req.nextUrl.pathname,
          method: req.method,
          ip: getClientIp(req),
        })
        
        return NextResponse.json(
          {
            status: 'error',
            error: ErrorCode.TOO_MANY_REQUESTS,
            message,
            details: {
              limit: maxRequests,
              remaining: 0,
              reset: result.retryAfter,
            },
          },
          {
            status: 429,
            headers,
          }
        )
      }
      
      // Add headers to response
      const response = NextResponse.next()
      headers.forEach((value, key) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error) {
      logger.error('Rate limit middleware error', { key, error })
      
      // Fail open on error
      return NextResponse.next()
    }
  }
}

// Pre-configured Rate Limiters
export const globalRateLimit = rateLimit({
  maxRequests: MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL.maxRequests,
  windowMs: MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL.windowMs,
  message: 'تم تجاوز الحد الأقصى للطلبات العالمية',
})

export const authRateLimit = rateLimit({
  maxRequests: MIDDLEWARE_CONFIG.RATE_LIMITS.AUTH.maxRequests,
  windowMs: MIDDLEWARE_CONFIG.RATE_LIMITS.AUTH.windowMs,
  keyGenerator: authKeyGenerator,
  message: 'محاولات دخول كثيرة جداً، حاول مرة أخرى بعد ساعة',
})

export const apiRateLimit = rateLimit({
  maxRequests: MIDDLEWARE_CONFIG.RATE_LIMITS.API.maxRequests,
  windowMs: MIDDLEWARE_CONFIG.RATE_LIMITS.API.windowMs,
  keyGenerator: apiKeyGenerator,
  message: 'طلبات API كثيرة جداً، حاول مرة أخرى بعد دقيقة',
})

export const userRateLimit = rateLimit({
  maxRequests: 50,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: userKeyGenerator,
  message: 'تجاوزت الحد الأقصى للطلبات لحسابك',
})

export const bookingRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `booking:${userId}`
  },
  message: 'تجاوزت الحد الأقصى للحجوزات لهذه الساعة',
})

export const paymentRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `payment:${userId}`
  },
  message: 'محاولات دفع كثيرة جداً، حاول مرة أخرى بعد 5 دقائق',
})

// Middleware Wrapper for Next.js
export function withRateLimit(
  handler: Function,
  options?: RateLimitOptions
) {
  const middleware = rateLimit(options)
  
  return async (req: NextRequest, ...args: any[]) => {
    const response = await middleware(req)
    
    if (response.status === 429) {
      return response
    }
    
    return handler(req, ...args)
  }
}

// Utility Functions
export async function resetRateLimit(key: string): Promise<void> {
  await defaultStore.reset(key)
}

export async function getRateLimitInfo(key: string): Promise<RateLimitRecord | null> {
  return await defaultStore.get(key)
}

export async function cleanupRateLimit(): Promise<void> {
  if (defaultStore instanceof MemoryStore) {
    await defaultStore.cleanup()
  }
}

export function createRateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`
}

// Rate Limit Monitor
export async function getRateLimitStats() {
  if (defaultStore instanceof RedisStore) {
    return await defaultStore.getStats()
  }
  
  if (defaultStore instanceof MemoryStore) {
    return {
      totalKeys: (defaultStore as any).store.size,
      memoryUsage: 0,
      connected: true,
      storeType: 'memory',
    }
  }
  
  return {
    totalKeys: 0,
    memoryUsage: 0,
    connected: false,
    storeType: 'unknown',
  }
}

// Initialize
logger.info('Rate limiting initialized', {
  storeType: defaultStore instanceof RedisStore ? 'redis' : 'memory',
  config: {
    global: MIDDLEWARE_CONFIG.RATE_LIMITS.GLOBAL,
    auth: MIDDLEWARE_CONFIG.RATE_LIMITS.AUTH,
    api: MIDDLEWARE_CONFIG.RATE_LIMITS.API,
  },
})

// Export everything
export default {
  rateLimit,
  globalRateLimit,
  authRateLimit,
  apiRateLimit,
  userRateLimit,
  bookingRateLimit,
  paymentRateLimit,
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  getRateLimitInfo,
  cleanupRateLimit,
  getRateLimitStats,
  getClientIp,
  createRateLimitKey,
}
