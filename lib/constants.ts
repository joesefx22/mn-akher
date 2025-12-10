// أدوار المستخدمين
export const USER_ROLES = {
  USER: 'USER',
  PLAYER: 'PLAYER', // نفس USER لكن واضح أكثر
  OWNER: 'OWNER',
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// أنواع الملاعب
export const FIELD_TYPES = {
  SOCCER: 'SOCCER',
  PADEL: 'PADEL',
} as const

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES]

// حالات الحجز
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]

// حالات الدفع
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// أيام الأسبوع
export const WEEK_DAYS = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
} as const

export type WeekDay = keyof typeof WEEK_DAYS

// إعدادات التطبيق
export const APP_CONFIG = {
  // التطبيق
  APP_NAME: 'احجزلي',
  APP_DESCRIPTION: 'منصة حجز الملاعب الرياضية',
  APP_VERSION: '1.0.0',
  
  // الحجز
  MIN_BOOKING_HOURS: 1,
  MAX_BOOKING_HOURS: 4,
  MAX_DAYS_IN_ADVANCE: 30,
  CANCELLATION_DEADLINE_HOURS: 24,
  DEPOSIT_REQUIRED_HOURS: 24,
  
  // الدفع
  DEPOSIT_PERCENTAGE: 30, // 30% وديعة
  TAX_PERCENTAGE: 14, // 14% ضريبة
  CURRENCY: 'EGP',
  
  // التحكم
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  
  // التخزين
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_FILE_TYPES: ['application/pdf'],
  },
  
  // مدة الصلاحية
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // ساعة واحدة
  EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 ساعة
} as const

// مسارات الداشبورد حسب الدور
export const DASHBOARD_PATHS: Record<UserRole, string> = {
  [USER_ROLES.USER]: '/dashboard/player',
  [USER_ROLES.PLAYER]: '/dashboard/player',
  [USER_ROLES.OWNER]: '/dashboard/owner',
  [USER_ROLES.EMPLOYEE]: '/dashboard/employee',
  [USER_ROLES.ADMIN]: '/dashboard/admin',
}

// رسائل الأخطاء الشائعة
export const ERROR_MESSAGES = {
  // مصادقة
  AUTH: {
    REQUIRED: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
    INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    INVALID_TOKEN: 'توكن غير صالح أو منتهي الصلاحية',
    UNAUTHORIZED: 'غير مصرح بالوصول',
    FORBIDDEN: 'ممنوع الوصول لهذا المورد',
    ACCOUNT_LOCKED: 'الحساب مؤقتاً مغلق بسبب محاولات دخول متعددة',
    EMAIL_EXISTS: 'البريد الإلكتروني مسجل بالفعل',
  },
  
  // حجوزات
  BOOKING: {
    SLOT_UNAVAILABLE: 'الوقت غير متاح للحجز',
    PAST_DATE: 'لا يمكن الحجز في تاريخ ماضي',
    TOO_FAR_ADVANCE: 'لا يمكن الحجز لأكثر من 30 يوماً مقدماً',
    MIN_DURATION: 'مدة الحجز يجب أن تكون ساعة على الأقل',
    MAX_DURATION: 'مدة الحجز يجب ألا تزيد عن 4 ساعات',
    CANCELLATION_DEADLINE: 'لا يمكن الإلغاء قبل 24 ساعة من وقت الحجز',
    OWNER_ONLY: 'فقط مالك الملعب يمكنه تنفيذ هذا الإجراء',
  },
  
  // دفع
  PAYMENT: {
    REQUIRED: 'الدفع مطلوب لتأكيد الحجز',
    FAILED: 'فشلت عملية الدفع',
    ALREADY_PAID: 'تم الدفع مسبقاً',
    REFUND_FAILED: 'فشل استرداد المبلغ',
    INVALID_AMOUNT: 'المبلغ غير صحيح',
  },
  
  // تحقق
  VALIDATION: {
    REQUIRED: 'هذا الحقل مطلوب',
    INVALID_EMAIL: 'البريد الإلكتروني غير صالح',
    INVALID_PHONE: 'رقم الهاتف غير صالح',
    INVALID_DATE: 'التاريخ غير صالح',
    INVALID_TIME: 'الوقت غير صالح',
    WEAK_PASSWORD: 'كلمة المرور ضعيفة',
    PASSWORD_MISMATCH: 'كلمات المرور غير متطابقة',
  },
  
  // عام
  GENERAL: {
    NOT_FOUND: 'المورد غير موجود',
    CONFLICT: 'تعارض في البيانات',
    SERVER_ERROR: 'حدث خطأ في الخادم',
    DATABASE_ERROR: 'خطأ في قاعدة البيانات',
    RATE_LIMITED: 'تم تجاوز الحد الأقصى للطلبات',
  },
} as const

// رسائل النجاح
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'تم تسجيل الدخول بنجاح',
    REGISTER: 'تم إنشاء الحساب بنجاح',
    LOGOUT: 'تم تسجيل الخروج بنجاح',
    PASSWORD_RESET: 'تم إرسال رابط إعادة تعيين كلمة المرور',
  },
  
  BOOKING: {
    CREATED: 'تم إنشاء الحجز بنجاح',
    CONFIRMED: 'تم تأكيد الحجز',
    CANCELLED: 'تم إلغاء الحجز',
    UPDATED: 'تم تحديث الحجز',
  },
  
  PAYMENT: {
    SUCCESS: 'تم الدفع بنجاح',
    REFUNDED: 'تم استرداد المبلغ',
  },
  
  FIELD: {
    CREATED: 'تم إنشاء الملعب بنجاح',
    UPDATED: 'تم تحديث الملعب',
    DELETED: 'تم حذف الملعب',
  },
} as const

// إعدادات البريد الإلكتروني
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_CANCELLATION: 'booking_cancellation',
  PAYMENT_RECEIPT: 'payment_receipt',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_VERIFICATION: 'account_verification',
}

// أنواع الفعاليات للتتبع
export const EVENT_TYPES = {
  AUTH: {
    LOGIN: 'user:login',
    REGISTER: 'user:register',
    LOGOUT: 'user:logout',
    PASSWORD_RESET: 'user:password_reset',
  },
  
  BOOKING: {
    CREATE: 'booking:create',
    CONFIRM: 'booking:confirm',
    CANCEL: 'booking:cancel',
    UPDATE: 'booking:update',
  },
  
  PAYMENT: {
    INITIATE: 'payment:initiate',
    SUCCESS: 'payment:success',
    FAIL: 'payment:fail',
    REFUND: 'payment:refund',
  },
  
  FIELD: {
    CREATE: 'field:create',
    UPDATE: 'field:update',
    DELETE: 'field:delete',
  },
} as const

// إعدادات الـ Cache
export const CACHE_KEYS = {
  FIELDS_LIST: 'fields:list',
  FIELD_DETAILS: (id: string) => `field:${id}`,
  FIELD_AVAILABILITY: (fieldId: string, date: string) => `field:${fieldId}:availability:${date}`,
  USER_BOOKINGS: (userId: string) => `user:${userId}:bookings`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
} as const

// مدة الـ Cache بالثواني
export const CACHE_DURATIONS = {
  SHORT: 60, // دقيقة واحدة
  MEDIUM: 300, // 5 دقائق
  LONG: 3600, // ساعة
  VERY_LONG: 86400, // 24 ساعة
} as const

// التصدير الشامل
export default {
  USER_ROLES,
  FIELD_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  WEEK_DAYS,
  APP_CONFIG,
  DASHBOARD_PATHS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EMAIL_TEMPLATES,
  EVENT_TYPES,
  CACHE_KEYS,
  CACHE_DURATIONS,
}
