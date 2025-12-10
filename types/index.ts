import { 
  UserRole, 
  FieldType, 
  BookingStatus, 
  PaymentStatus,
  WeekDay 
} from '@/lib/constants'

// أنواع Prisma الأساسية
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
  
  // العلاقات
  fields?: Field[]
  bookings?: Booking[]
  ownedEmployees?: Employee[]
  asEmployee?: Employee | null
  employeeRefId?: string | null
}

export interface Area {
  id: string
  name: string
  createdAt: Date
  updatedAt?: Date
  
  fields: Field[]
}

export interface Field {
  id: string
  ownerId: string
  name: string
  type: FieldType
  pricePerHour: number
  location: string
  areaId: string
  image?: string | null
  phone?: string | null
  description?: string | null
  openHour: string
  closeHour: string
  activeDays: number[]
  createdAt: Date
  updatedAt?: Date
  
  // العلاقات
  owner: User
  area: Area
  schedules: FieldSchedule[]
  bookings: Booking[]
}

export interface TimeSlot {
  id: string
  start: string
  end: string
  label: string
  createdAt: Date
  
  // العلاقات
  schedules: FieldSchedule[]
  bookings: Booking[]
}

export interface FieldSchedule {
  id: string
  fieldId: string
  slotId: string
  weekday?: number | null
  
  // العلاقات
  field: Field
  slot: TimeSlot
}

export interface Booking {
  id: string
  fieldId: string
  userId: string
  date: Date
  slotId: string
  slotLabel: string
  status: BookingStatus
  paymentId?: string | null
  amount: number
  createdAt: Date
  cancelledAt?: Date | null
  cancelledBy?: string | null
  cancelReason?: string | null
  updatedAt?: Date
  
  // العلاقات
  field: Field
  user: User
  slot: TimeSlot
  payment?: Payment | null
}

export interface Payment {
  id: string
  bookingId?: string | null
  provider: string
  providerTxId: string
  status: PaymentStatus
  amount: number
  createdAt: Date
  updatedAt?: Date
  
  // العلاقات
  booking?: Booking | null
}

export interface Employee {
  id: string
  ownerId: string
  userId: string
  fieldIds: string[]
  createdAt: Date
  updatedAt?: Date
  
  // العلاقات
  owner: User
  user: User
}

// أنواع الطلبات
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  type?: FieldType
  areaId?: string
  minPrice?: number
  maxPrice?: number
  date?: string
}

// أنواع المصادقة
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}

// أنواع الملاعب
export interface CreateFieldRequest {
  name: string
  type: FieldType
  pricePerHour: number
  location: string
  areaId: string
  image?: string
  phone?: string
  description?: string
  openHour: string
  closeHour: string
  activeDays: number[]
}

export interface UpdateFieldRequest extends Partial<CreateFieldRequest> {}

export interface FieldResponse extends Omit<Field, 'owner' | 'area'> {
  owner: {
    id: string
    name: string
    email: string
  }
  area: {
    id: string
    name: string
  }
  rating?: number
  reviewsCount?: number
}

// أنواع الحجوزات
export interface CreateBookingRequest {
  fieldId: string
  date: string
  slotId: string
}

export interface CancelBookingRequest {
  reason?: string
}

export interface BookingResponse extends Omit<Booking, 'field' | 'user' | 'slot'> {
  field: {
    id: string
    name: string
    type: FieldType
    pricePerHour: number
  }
  user: {
    id: string
    name: string
    email: string
  }
  slot: {
    id: string
    label: string
    start: string
    end: string
  }
  payment?: {
    id: string
    status: PaymentStatus
    provider: string
    amount: number
  }
}

// أنواع الدفع
export interface PaymentInitiateRequest {
  bookingId: string
}

export interface PaymentWebhookRequest {
  obj: {
    id: number
    success: boolean
    is_3d_secure: boolean
    is_auth: boolean
    is_capture: boolean
    is_standalone_payment: boolean
    is_voided: boolean
    is_refunded: boolean
    amount_cents: number
    integration_id: number
    profile_id: number
    has_parent_transaction: boolean
    order: {
      id: number
      created_at: string
      delivery_needed: boolean
      merchant: {
        id: number
        created_at: string
        phones: string[]
        company_emails: string[]
        company_name: string
        state: string
        country: string
        city: string
        postal_code: string
        street: string
      }
      collector: any
      amount_cents: number
      shipping_data: any
      shipping_details: any
      currency: string
      is_payment_locked: boolean
      is_return: boolean
      is_cancel: boolean
      is_returned: boolean
      is_canceled: boolean
      merchant_order_id: string
      wallet_notification: any
      paid_amount_cents: number
      notify_user_with_email: boolean
      items: any[]
      order_url: string
      commission_fees: number
      delivery_fees_cents: number
      delivery_vat_cents: number
      payment_method: string
      merchant_staff_tag: any
      api_source: string
      data: {
        booking_id: string
      }
    }
    created_at: string
    transaction_processed_callback_responses: any[]
    currency: string
    source_data: {
      pan: string
      type: string
      sub_type: string
      tenure: any
    }
    api_source: string
    terminal_id: any
    merchant_commission: number
    installment: any
    is_installment: boolean
    is_void: boolean
    is_refund: boolean
    is_hidden: boolean
    refunded_amount_cents: number
    is_settled: boolean
    bill_balanced: boolean
    is_bill: boolean
    owner: number
    data: {
      booking_id: string
    }
    owner_account: any
    parent_transaction: any
  }
  type: 'TRANSACTION'
  hmac: string
}

// أنواع الجدولة
export interface TimeSlotResponse {
  id: string
  start: string
  end: string
  label: string
  status: 'available' | 'booked' | 'pending' | 'cancelled' | 'unavailable'
  price?: number
}

export interface FieldAvailabilityResponse {
  date: string
  slots: TimeSlotResponse[]
  field: {
    id: string
    name: string
    type: FieldType
    pricePerHour: number
  }
}

// أنواع التقارير
export interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  activeFields: number
  pendingBookings: number
  cancelledBookings: number
  recentBookings: BookingResponse[]
  topFields: Array<{
    id: string
    name: string
    bookingsCount: number
    revenue: number
  }>
}

export interface OwnerDashboardStats extends DashboardStats {
  myFields: FieldResponse[]
  employees: Array<{
    id: string
    name: string
    email: string
    fieldsCount: number
  }>
}

// أنواع البحث والترشيح
export interface SearchFilters {
  query?: string
  type?: FieldType
  areaId?: string
  minPrice?: number
  maxPrice?: number
  date?: string
  time?: string
  page?: number
  limit?: number
  sortBy?: 'price' | 'rating' | 'name'
  sortOrder?: 'asc' | 'desc'
}

// أنواع الملفات
export interface FileUploadResponse {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

// أنواع الأحداث
export interface SystemEvent {
  id: string
  type: string
  userId?: string
  data: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// أنواع الـ Cache
export interface CacheStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

// أنواع الدوال المساعدة
export type AsyncFunction<T = any, R = any> = (args: T) => Promise<R>
export type SyncFunction<T = any, R = any> = (args: T) => R

// أنواع عامة
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

// Types for API Responses
export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ApiError = {
  success: false
  error: string
  message: string
  details?: any
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

// Type guards
export function isApiSuccess<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return result.success === true
}

export function isApiError<T>(result: ApiResult<T>): result is ApiError {
  return result.success === false
}

// Export all types
export type {
  UserRole,
  FieldType,
  BookingStatus,
  PaymentStatus,
  WeekDay,
}
