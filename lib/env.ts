import { z } from 'zod'

// مخطط التحقق من متغيرات البيئة
const envSchema = z.object({
  // قاعدة البيانات
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL مطلوب'),
  
  // JWT Tokens
  JWT_SECRET: z.string().min(32, 'JWT_SECRET يجب أن يكون 32 حرف على الأقل'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  // التطبيق
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  
  // Paymob Payments
  PAYMOB_API_KEY: z.string().optional(),
  PAYMOB_INTEGRATION_ID: z.string().optional(),
  PAYMOB_IFRAME_ID: z.string().optional(),
  PAYMOB_HMAC_SECRET: z.string().optional(),
  
  // البريد الإلكتروني
  MAIL_USER: z.string().email().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.string().optional(),
  MAIL_SECURE: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),
  MAIL_FROM_NAME: z.string().optional(),
  
  // التحكم
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 دقيقة
  
  // التطوير
  DEBUG: z.string().optional(),
  
  // النسخ الاحتياطي
  BACKUP_ENABLED: z.string().default('false'),
  BACKUP_CRON_SCHEDULE: z.string().default('0 2 * * *'), // 2 AM daily
})

// التحقق من المتغيرات
function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    return { success: true, env }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ خطأ في متغيرات البيئة:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    } else {
      console.error('❌ خطأ غير متوقع:', error)
    }
    
    // في التطوير، نسمح باستمرار العمل مع تحذير
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  يعمل في وضع التطوير مع متغيرات بيئة غير مكتملة')
      return { success: true, env: process.env as any }
    }
    
    process.exit(1)
  }
}

// الحصول على المتغيرات مع التحقق
export function getEnv() {
  const result = validateEnv()
  if (!result.success) {
    throw new Error('فشل تحميل متغيرات البيئة')
  }
  return result.env
}

// دوال مساعدة للوصول للمتغيرات
export const env = getEnv()

// دوال مساعدة للبيئة
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}

// الحصول على إعدادات البريد
export function getMailConfig() {
  if (!env.MAIL_USER || !env.MAIL_PASS) {
    console.warn('⚠️  إعدادات البريد غير مكتملة')
    return null
  }
  
  return {
    service: env.MAIL_SERVICE,
    host: env.MAIL_HOST,
    port: env.MAIL_PORT ? parseInt(env.MAIL_PORT) : 587,
    secure: env.MAIL_SECURE === 'true',
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
    from: env.MAIL_FROM || env.MAIL_USER,
    fromName: env.MAIL_FROM_NAME || 'احجزلي',
  }
}

// الحصول على إعدادات Paymob
export function getPaymobConfig() {
  if (!env.PAYMOB_API_KEY || !env.PAYMOB_INTEGRATION_ID) {
    console.warn('⚠️  إعدادات Paymob غير مكتملة - الدفع لن يعمل')
    return null
  }
  
  return {
    apiKey: env.PAYMOB_API_KEY,
    integrationId: env.PAYMOB_INTEGRATION_ID,
    iframeId: env.PAYMOB_IFRAME_ID,
    hmacSecret: env.PAYMOB_HMAC_SECRET,
  }
}

// الحصول على إعدادات Rate Limiting
export function getRateLimitConfig() {
  return {
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS) || 100,
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 دقيقة
  }
}

// التحقق من الإعدادات الأساسية
export function checkRequiredConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing: string[] = []
  
  required.forEach((key) => {
    if (!env[key as keyof typeof env]) {
      missing.push(key)
    }
  })
  
  if (missing.length > 0) {
    throw new Error(`متغيرات البيئة المطلوبة مفقودة: ${missing.join(', ')}`)
  }
  
  return true
}

// تهيئة عند تحميل الملف
checkRequiredConfig()

// التصدير الافتراضي
export default env
