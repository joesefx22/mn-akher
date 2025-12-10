// أنواع الأخطاء الأساسية
export enum ErrorCode {
  // 4xx Client Errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

// هيكل الخطأ المخصص
export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    public statusCode: number = 500,
    public details?: any,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// أخطاء محددة
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 422, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'مصادقة مطلوبة') {
    super(message, ErrorCode.UNAUTHORIZED, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'غير مصرح بالوصول') {
    super(message, ErrorCode.FORBIDDEN, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'المورد') {
    super(`${resource} غير موجود`, ErrorCode.NOT_FOUND, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'تعارض في البيانات') {
    super(message, ErrorCode.CONFLICT, 409)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.DATABASE_ERROR, 500, details)
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.PAYMENT_ERROR, 500, details)
  }
}

export class ExternalApiError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`خطأ في خدمة ${service}: ${message}`, ErrorCode.EXTERNAL_API_ERROR, 502, details)
  }
}

// دوال مساعدة لإنشاء الأخطاء
export function createValidationError(errors: Record<string, string[]> | string[]) {
  return new ValidationError('خطأ في التحقق من البيانات', errors)
}

export function createNotFoundError(resource: string, id?: string) {
  const message = id ? `${resource} بالمعرف ${id} غير موجود` : `${resource} غير موجود`
  return new NotFoundError(message)
}

export function createConflictError(field: string, value: string) {
  return new ConflictError(`قيمة ${field} "${value}" موجودة مسبقاً`)
}

// معالج الأخطاء للـ API Routes
export function handleError(error: unknown): {
  statusCode: number
  body: {
    success: false
    error: string
    code: ErrorCode
    message: string
    details?: any
    stack?: string
  }
} {
  console.error('Error Handler:', error)

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: error.code,
        message: error.message,
        details: error.details,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    }
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: {
        success: false,
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'حدث خطأ داخلي في الخادم',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    }
  }

  return {
    statusCode: 500,
    body: {
      success: false,
      error: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'حدث خطأ غير معروف',
      details: String(error),
    },
  }
}

// Middleware لمعالجة الأخطاء في Next.js API Routes
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): (...args: Parameters<T>) => Promise<Response> {
  return async (...args: Parameters<T>): Promise<Response> => {
    try {
      const result = await handler(...args)
      return result
    } catch (error) {
      const { statusCode, body } = handleError(error)
      
      return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }
}

// تحويل خطأ Prisma إلى AppError
export function handlePrismaError(error: any): AppError {
  const errorCode = error.code || 'UNKNOWN'
  
  switch (errorCode) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field'
      return new ConflictError(`قيمة ${field} موجودة مسبقاً`)
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('مرجع غير صالح')
    
    case 'P2025':
      // Record not found
      return new NotFoundError('السجل غير موجود')
    
    case 'P2016':
      // Related record not found
      return new NotFoundError('السجل المرتبط غير موجود')
    
    case 'P2034':
      // Transaction failed
      return new DatabaseError('فشلت العملية، حاول مرة أخرى')
    
    default:
      return new DatabaseError('خطأ في قاعدة البيانات', {
        code: errorCode,
        message: error.message,
      })
  }
}

// دوال مساعدة للتحقق
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function isOperationalError(error: any): boolean {
  return isAppError(error) ? error.isOperational : false
}

// خريطة الأخطاء للترجمة
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.BAD_REQUEST]: 'طلب غير صالح',
  [ErrorCode.UNAUTHORIZED]: 'غير مصرح بالوصول',
  [ErrorCode.FORBIDDEN]: 'ممنوع الوصول',
  [ErrorCode.NOT_FOUND]: 'المورد غير موجود',
  [ErrorCode.CONFLICT]: 'تعارض في البيانات',
  [ErrorCode.VALIDATION_ERROR]: 'خطأ في التحقق من البيانات',
  [ErrorCode.TOO_MANY_REQUESTS]: 'طلبات كثيرة جداً',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'خطأ داخلي في الخادم',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'الخدمة غير متاحة حالياً',
  [ErrorCode.DATABASE_ERROR]: 'خطأ في قاعدة البيانات',
  [ErrorCode.PAYMENT_ERROR]: 'خطأ في عملية الدفع',
  [ErrorCode.EXTERNAL_API_ERROR]: 'خطأ في الاتصال بالخدمة الخارجية',
}
