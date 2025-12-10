import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
  }
}

// Success Responses
export function success<T = any>(
  data?: T,
  message: string = 'تمت العملية بنجاح',
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      status: 'success',
      message,
      data,
      meta,
    },
    { status: 200 }
  )
}

export function created<T = any>(
  data?: T,
  message: string = 'تم الإنشاء بنجاح'
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      status: 'success',
      message,
      data,
    },
    { status: 201 }
  )
}

// Error Responses
export function badRequest(
  message: string = 'طلب غير صالح'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      status: 'error',
      message,
    },
    { status: 400 }
  )
}

export function unauthorized(
  message: string = 'غير مصرح بالوصول'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      status: 'error',
      message,
    },
    { status: 401 }
  )
}

export function forbidden(
  message: string = 'ممنوع الوصول'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      status: 'error',
      message,
    },
    { status: 403 }
  )
}

export function notFound(
  message: string = 'المورد غير موجود'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      status: 'error',
      message,
    },
    { status: 404 }
  )
}

export function conflict(
  message: string = 'تعارض في البيانات'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      status: 'error',
      message,
    },
    { status: 409 }
  )
}

export function validationError(
  errors: Record<string, string[]> | string[]
): NextResponse<ApiResponse> {
  const message = Array.isArray(errors) 
    ? 'خطأ في التحقق من البيانات'
    : 'خطأ في التحقق من البيانات'

  return NextResponse.json(
    {
      status: 'error',
      message,
      data: { errors },
    },
    { status: 422 }
  )
}

export function serverError(
  message: string = 'خطأ داخلي في الخادم',
  error?: any
): NextResponse<ApiResponse> {
  if (process.env.NODE_ENV === 'development' && error) {
    console.error('Server Error:', error)
  }

  return NextResponse.json(
    {
      status: 'error',
      message,
    },
    { status: 500 }
  )
}

// Pagination Helper
export function withPagination<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<T[]> {
  return {
    status: 'success',
    message: 'تم جلب البيانات بنجاح',
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

// Type Guard for Error Handling
export function isApiError(error: any): error is ApiResponse {
  return error && typeof error === 'object' && 'status' in error && 'message' in error
}

// Helper to extract error message
export function getErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'حدث خطأ غير متوقع'
}
