import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { env, isDevelopment, isProduction } from './env'

// مستويات السجلات
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
}

// تنسيقات winston
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

// تنسيق للقراءة في التطوير
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = ''
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta, null, 2)
    }
    return `[${timestamp}] ${level}: ${message} ${metaStr}`
  })
)

// إنشاء logger
const logger = winston.createLogger({
  level: isDevelopment() ? LogLevel.DEBUG : LogLevel.INFO,
  format: logFormat,
  defaultMeta: { service: 'booking-system' },
  transports: [
    // سجلات الأخطاء
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: LogLevel.ERROR,
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
    
    // سجلات المعلومات
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
    
    // سجلات HTTP
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: LogLevel.HTTP,
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
    }),
  ],
})

// في التطوير، أضف console logging
if (isDevelopment()) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: LogLevel.DEBUG,
    })
  )
} else if (isProduction()) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: LogLevel.INFO,
    })
  )
}

// واجهة الـ Logger
export interface Logger {
  error(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  info(message: string, meta?: any): void
  http(message: string, meta?: any): void
  debug(message: string, meta?: any): void
}

// Export logger instance
export default logger

// دوال مساعدة للاستخدام الشائع
export function logError(error: Error, context?: string) {
  const meta: any = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }
  
  if (context) {
    meta.context = context
  }
  
  logger.error(error.message, meta)
}

export function logRequest(req: any, res: any, responseTime?: number) {
  const meta = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  }
  
  logger.http(`${req.method} ${req.url}`, meta)
}

export function logDatabaseQuery(query: string, params?: any[], duration?: number) {
  logger.debug('Database Query', {
    query,
    params,
    duration,
  })
}

export function logPaymentEvent(event: string, data: any) {
  logger.info(`Payment Event: ${event}`, {
    event,
    ...data,
  })
}

export function logBookingEvent(event: string, bookingId: string, userId: string, meta?: any) {
  logger.info(`Booking Event: ${event}`, {
    event,
    bookingId,
    userId,
    ...meta,
  })
}

// Middleware لـ Next.js API logging
export function withLogger(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const start = Date.now()
    
    try {
      const response = await handler(req, ...args)
      const responseTime = Date.now() - start
      
      logRequest(req, response, responseTime)
      
      return response
    } catch (error) {
      const responseTime = Date.now() - start
      
      logError(error as Error, 'API Handler')
      logRequest(req, { statusCode: 500 }, responseTime)
      
      throw error
    }
  }
}

// نموذج استخدام:
// import logger from '@/lib/logger'
// 
// logger.info('Application started')
// logger.error('Something went wrong', { userId: '123' })
// logger.http('GET /api/users', { duration: 150 })
