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
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// مقدمي الدفع
export const PAYMENT_PROVIDERS = {
  PAYMOB: 'paymob',
  CASH: 'cash',
  WALLET: 'wallet',
} as const

export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS]

// أيام الأسبوع
export const WEEK_DAYS = {
  0: { name: 'الأحد', short: 'أحد' },
  1: { name: 'الاثنين', short: 'اثنين' },
  2: { name: 'الثلاثاء', short: 'ثلاثاء' },
  3: { name: 'الأربعاء', short: 'أربعاء' },
  4: { name: 'الخميس', short: 'خميس' },
  5: { name: 'الجمعة', short: 'جمعة' },
  6: { name: 'السبت', short: 'سبت' },
} as const

export type WeekDay = keyof typeof WEEK_DAYS

// ألوان الحالات
export const STATUS_COLORS = {
  // Booking Status Colors
  [BOOKING_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: '⏳',
  },
  [BOOKING_STATUS.CONFIRMED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: '✅',
  },
  [BOOKING_STATUS.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: '❌',
  },
  [BOOKING_STATUS.FAILED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: '⚠️',
  },
  
  // Payment Status Colors
  [PAYMENT_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: '⏳',
  },
  [PAYMENT_STATUS.SUCCESS]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: '✅',
  },
  [PAYMENT_STATUS.FAILED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: '❌',
  },
  [PAYMENT_STATUS.REFUNDED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: '↩️',
  },
} as const

// إعدادات التطبيق
export const APP_CONFIG = {
  // معلومات التطبيق
  APP_NAME: 'احجزلي',
  APP_DESCRIPTION: 'منصة حجز الملاعب الرياضية',
  APP_VERSION: '1.0.0',
  APP_SUPPORT_EMAIL: 'support@ahgzly.com',
  APP_SUPPORT_PHONE: '01234567890',
  
  // الحجز
  MIN_BOOKING_HOURS: 1,
  MAX_BOOKING_HOURS: 4,
  MAX_DAYS_IN_ADVANCE: 30,
  CANCELLATION_DEADLINE_HOURS: 24,
  DEPOSIT_REQUIRED_HOURS: 24,
  MIN_BOOKING_NOTICE_HOURS: 2, // يجب الحجز قبل ساعتين على الأقل
  
  // الدفع
  DEPOSIT_PERCENTAGE: 30, // 30% وديعة
  TAX_PERCENTAGE: 14, // 14% ضريبة
  CURRENCY: 'EGP',
  CURRENCY_SYMBOL: 'ج',
  
  // الأمان
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  
  // التخزين
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword'],
    MAX_FILES_PER_UPLOAD: 5,
  },
  
  // التخزين المؤقت
  CACHE_TTL: {
    SHORT: 60, // دقيقة واحدة
    MEDIUM: 300, // 5 دقائق
    LONG: 3600, // ساعة
    VERY_LONG: 86400, // 24 ساعة
  },
  
  // التبويب
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },
  
  // التقارير
  REPORT_RETENTION_DAYS: 90,
  BACKUP_RETENTION_DAYS: 30,
  
  // المدفوعات
  PAYMENT_TIMEOUT_MINUTES: 15,
  REFUND_PROCESSING_DAYS: 3,
  
  // الإشعارات
  EMAIL_NOTIFICATION_DELAY_MINUTES: 5,
  SMS_NOTIFICATION_ENABLED: false,
  PUSH_NOTIFICATION_ENABLED: true,
} as const

// مسارات الداشبورد حسب الدور
export const DASHBOARD_PATHS: Record<UserRole, string> = {
  [USER_ROLES.USER]: '/dashboard/player',
  [USER_ROLES.PLAYER]: '/dashboard/player',
  [USER_ROLES.OWNER]: '/dashboard/owner',
  [USER_ROLES.EMPLOYEE]: '/dashboard/employee',
  [USER_ROLES.ADMIN]: '/dashboard/admin',
}

// أذونات الدور
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [USER_ROLES.USER]: [
    'bookings.create',
    'bookings.view_own',
    'bookings.cancel_own',
    'fields.view',
    'profile.view',
    'profile.update',
  ],
  
  [USER_ROLES.PLAYER]: [
    'bookings.create',
    'bookings.view_own',
    'bookings.cancel_own',
    'fields.view',
    'profile.view',
    'profile.update',
    'reviews.create',
  ],
  
  [USER_ROLES.EMPLOYEE]: [
    'bookings.create',
    'bookings.view_assigned',
    'bookings.cancel_assigned',
    'bookings.confirm',
    'fields.view_assigned',
    'profile.view',
    'profile.update',
    'reports.view_basic',
  ],
  
  [USER_ROLES.OWNER]: [
    'bookings.create',
    'bookings.view_owned',
    'bookings.cancel_owned',
    'bookings.confirm',
    'fields.create',
    'fields.update_owned',
    'fields.delete_owned',
    'employees.manage',
    'reports.view_detailed',
    'payments.view',
    'profile.view',
    'profile.update',
  ],
  
  [USER_ROLES.ADMIN]: [
    '*', // جميع الصلاحيات
  ],
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
    WEAK_PASSWORD: 'كلمة المرور ضعيفة، يجب أن تحتوي على 8 أحرف على الأقل مع أحرف كبيرة وصغيرة وأرقام ورموز',
    PASSWORD_MISMATCH: 'كلمات المرور غير متطابقة',
    TOKEN_EXPIRED: 'انتهت صلاحية الرابط',
    ACCOUNT_NOT_VERIFIED: 'الحساب غير مفعل، يرجى تفعيل الحساب عبر البريد الإلكتروني',
  },
  
  // حجوزات
  BOOKING: {
    SLOT_UNAVAILABLE: 'الوقت غير متاح للحجز',
    PAST_DATE: 'لا يمكن الحجز في تاريخ ماضي',
    TOO_FAR_ADVANCE: `لا يمكن الحجز لأكثر من ${APP_CONFIG.MAX_DAYS_IN_ADVANCE} يوماً مقدماً`,
    MIN_DURATION: `مدة الحجز يجب أن تكون ${APP_CONFIG.MIN_BOOKING_HOURS} ساعة على الأقل`,
    MAX_DURATION: `مدة الحجز يجب ألا تزيد عن ${APP_CONFIG.MAX_BOOKING_HOURS} ساعات`,
    CANCELLATION_DEADLINE: `لا يمكن الإلغاء قبل ${APP_CONFIG.CANCELLATION_DEADLINE_HOURS} ساعة من وقت الحجز`,
    OWNER_ONLY: 'فقط مالك الملعب يمكنه تنفيذ هذا الإجراء',
    EMPLOYEE_ONLY: 'فقط الموظف المعين يمكنه تنفيذ هذا الإجراء',
    MIN_NOTICE: `يجب الحجز قبل ${APP_CONFIG.MIN_BOOKING_NOTICE_HOURS} ساعات على الأقل`,
    DOUBLE_BOOKING: 'هذا الوقت محجوز بالفعل',
  },
  
  // دفع
  PAYMENT: {
    REQUIRED: 'الدفع مطلوب لتأكيد الحجز',
    FAILED: 'فشلت عملية الدفع',
    ALREADY_PAID: 'تم الدفع مسبقاً',
    REFUND_FAILED: 'فشل استرداد المبلغ',
    INVALID_AMOUNT: 'المبلغ غير صحيح',
    TIMEOUT: 'انتهت صلاحية جلسة الدفع',
    PROVIDER_ERROR: 'خطأ في مزود الدفع',
    INSUFFICIENT_FUNDS: 'رصيد غير كافٍ',
  },
  
  // تحقق
  VALIDATION: {
    REQUIRED: 'هذا الحقل مطلوب',
    INVALID_EMAIL: 'البريد الإلكتروني غير صالح',
    INVALID_PHONE: 'رقم الهاتف غير صالح',
    INVALID_DATE: 'التاريخ غير صالح',
    INVALID_TIME: 'الوقت غير صالح',
    INVALID_NUMBER: 'القيمة يجب أن تكون رقماً',
    INVALID_URL: 'الرابط غير صالح',
    MIN_LENGTH: 'النص قصير جداً',
    MAX_LENGTH: 'النص طويل جداً',
    INVALID_FORMAT: 'التنسيق غير صالح',
  },
  
  // ملفات
  FILE: {
    TOO_LARGE: `الملف كبير جداً، الحد الأقصى ${APP_CONFIG.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`,
    INVALID_TYPE: 'نوع الملف غير مسموح به',
    UPLOAD_FAILED: 'فشل رفع الملف',
    MAX_FILES: `لا يمكن رفع أكثر من ${APP_CONFIG.UPLOAD.MAX_FILES_PER_UPLOAD} ملفات`,
  },
  
  // عام
  GENERAL: {
    NOT_FOUND: 'المورد غير موجود',
    CONFLICT: 'تعارض في البيانات',
    SERVER_ERROR: 'حدث خطأ في الخادم',
    DATABASE_ERROR: 'خطأ في قاعدة البيانات',
    RATE_LIMITED: 'تم تجاوز الحد الأقصى للطلبات',
    NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
    MAINTENANCE: 'الخادم قيد الصيانة',
    TIMEOUT: 'انتهت مهلة الطلب',
  },
} as const

// رسائل النجاح
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'تم تسجيل الدخول بنجاح',
    REGISTER: 'تم إنشاء الحساب بنجاح',
    LOGOUT: 'تم تسجيل الخروج بنجاح',
    PASSWORD_RESET: 'تم إرسال رابط إعادة تعيين كلمة المرور',
    PASSWORD_CHANGED: 'تم تغيير كلمة المرور بنجاح',
    PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  },
  
  BOOKING: {
    CREATED: 'تم إنشاء الحجز بنجاح',
    CONFIRMED: 'تم تأكيد الحجز',
    CANCELLED: 'تم إلغاء الحجز',
    UPDATED: 'تم تحديث الحجز',
    PAYMENT_PENDING: 'بانتظار إتمام عملية الدفع',
    PAYMENT_SUCCESS: 'تم الدفع بنجاح',
  },
  
  PAYMENT: {
    SUCCESS: 'تم الدفع بنجاح',
    REFUNDED: 'تم استرداد المبلغ',
    INITIATED: 'تم بدء عملية الدفع',
  },
  
  FIELD: {
    CREATED: 'تم إنشاء الملعب بنجاح',
    UPDATED: 'تم تحديث الملعب',
    DELETED: 'تم حذف الملعب',
    SCHEDULE_GENERATED: 'تم إنشاء جدول الأوقات',
  },
  
  EMPLOYEE: {
    ADDED: 'تم إضافة الموظف بنجاح',
    REMOVED: 'تم إزالة الموظف',
    UPDATED: 'تم تحديث بيانات الموظف',
  },
  
  FILE: {
    UPLOADED: 'تم رفع الملف بنجاح',
    DELETED: 'تم حذف الملف',
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
  BOOKING_REMINDER: 'booking_reminder',
  NEW_BOOKING_NOTIFICATION: 'new_booking_notification',
  PAYMENT_FAILED: 'payment_failed',
}

// أنواع الفعاليات للتتبع
export const EVENT_TYPES = {
  AUTH: {
    LOGIN: 'user:login',
    LOGIN_FAILED: 'user:login_failed',
    REGISTER: 'user:register',
    LOGOUT: 'user:logout',
    PASSWORD_RESET_REQUEST: 'user:password_reset_request',
    PASSWORD_RESET_COMPLETE: 'user:password_reset_complete',
    PROFILE_UPDATE: 'user:profile_update',
  },
  
  BOOKING: {
    CREATE: 'booking:create',
    CONFIRM: 'booking:confirm',
    CANCEL: 'booking:cancel',
    UPDATE: 'booking:update',
    REMINDER_SENT: 'booking:reminder_sent',
  },
  
  PAYMENT: {
    INITIATE: 'payment:initiate',
    SUCCESS: 'payment:success',
    FAIL: 'payment:fail',
    REFUND: 'payment:refund',
    WEBHOOK_RECEIVED: 'payment:webhook_received',
  },
  
  FIELD: {
    CREATE: 'field:create',
    UPDATE: 'field:update',
    DELETE: 'field:delete',
    SCHEDULE_GENERATE: 'field:schedule_generate',
  },
  
  EMPLOYEE: {
    ADD: 'employee:add',
    REMOVE: 'employee:remove',
    UPDATE: 'employee:update',
  },
  
  SYSTEM: {
    BACKUP_CREATED: 'system:backup_created',
    CLEANUP_PERFORMED: 'system:cleanup_performed',
    ERROR_OCCURRED: 'system:error_occurred',
  },
} as const

// إعدادات الـ Cache
export const CACHE_KEYS = {
  // الحقول
  FIELDS_LIST: (params: string) => `fields:list:${params}`,
  FIELD_DETAILS: (id: string) => `field:${id}:details`,
  FIELD_AVAILABILITY: (fieldId: string, date: string) => `field:${fieldId}:availability:${date}`,
  
  // المستخدمين
  USER_BOOKINGS: (userId: string) => `user:${userId}:bookings`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_STATS: (userId: string) => `user:${userId}:stats`,
  
  // المالكين
  OWNER_STATS: (ownerId: string) => `owner:${ownerId}:stats`,
  OWNER_FIELDS: (ownerId: string) => `owner:${ownerId}:fields`,
  
  // التقارير
  DASHBOARD_STATS: (userId: string, period: string) => `dashboard:${userId}:stats:${period}`,
  REPORT_DATA: (reportId: string) => `report:${reportId}:data`,
  
  // إعدادات
  APP_CONFIG: 'app:config',
  AREAS_LIST: 'areas:list',
  TIME_SLOTS: 'time:slots',
} as const

// إعدادات Middleware
export const MIDDLEWARE_CONFIG = {
  // Security headers
  SECURITY_HEADERS: {
    CSP: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src 'self';",
    X_FRAME_OPTIONS: 'SAMEORIGIN',
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    X_XSS_PROTECTION: '1; mode=block',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=()',
  },
  
  // Rate limiting
  RATE_LIMITS: {
    GLOBAL: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 15 دقيقة
    AUTH: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // ساعة
    API: { maxRequests: 60, windowMs: 60 * 1000 }, // دقيقة
  },
  
  // CORS
  CORS_HEADERS: {
    ALLOW_ORIGIN: process.env.NEXT_PUBLIC_BASE_URL || '*',
    ALLOW_METHODS: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    ALLOW_HEADERS: 'Content-Type, Authorization, x-user-id, x-user-role, x-user-email, x-request-id',
    ALLOW_CREDENTIALS: 'true',
    EXPOSE_HEADERS: 'x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset',
  },
  
  // Timeouts
  TIMEOUTS: {
    REQUEST: 30000, // 30 seconds
    CONNECTION: 10000, // 10 seconds
  },
} as const

// إعدادات التقرير
export const REPORT_CONFIG = {
  DATE_FORMATS: {
    SHORT: 'YYYY-MM-DD',
    LONG: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  },
  
  TIMEZONE: 'Africa/Cairo',
  
  EXPORT_FORMATS: {
    PDF: 'pdf',
    EXCEL: 'xlsx',
    CSV: 'csv',
    JSON: 'json',
  },
} as const

// أسماء المناطق الافتراضية
export const DEFAULT_AREAS = [
  'المقطم',
  'الهضبة الوسطى',
  'مدينة نصر',
  'التجمع الخامس',
  'الشروق',
  'العبور',
  'القاهرة الجديدة',
  'مصر الجديدة',
  'المعادي',
  'المعصرة',
  '15 مايو',
  '6 أكتوبر',
  'الرحاب',
  'السلام',
  'الزيتون',
  'حدائق القبة',
  'شبرا',
  'الدقي',
  'الجيزة',
  'المهندسين',
  'الدور الرابع',
  'الزمالك',
  'القاهرة الإسلامية',
  'الموسكي',
  'العتبة',
] as const

// ميزات الملعب
export const FIELD_FEATURES = [
  'إضاءة ليلية',
  'مظلات',
  'مقاعد متفرجين',
  'دورات مياه',
  'غرف تبديل ملابس',
  'مواقف سيارات',
  'كافتيريا',
  'تدفئة شتوية',
  'تكييف',
  'شاشة عرض',
  'نظام صوتي',
  'حضانات',
  'مستلزمات رياضية',
  'مدرب شخصي',
  'أجهزة رياضية',
  'حضانة أطفال',
  'واي فاي',
  'كاميرات مراقبة',
  'إسعافات أولية',
  'مشروبات مجانية',
] as const

// أوقات العمل
export const WORKING_HOURS = {
  MIN: '06:00',
  MAX: '23:00',
  PEAK_HOURS: ['17:00', '18:00', '19:00', '20:00', '21:00'],
  OFF_PEAK_DISCOUNT: 0.2, // 20% خصص في الأوقات غير الذروية
  PEAK_SURCHARGE: 0.3, // 30% زيادة في الأوقات الذروية
} as const

// التصدير الشامل
export default {
  USER_ROLES,
  FIELD_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_PROVIDERS,
  WEEK_DAYS,
  STATUS_COLORS,
  APP_CONFIG,
  DASHBOARD_PATHS,
  ROLE_PERMISSIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EMAIL_TEMPLATES,
  EVENT_TYPES,
  CACHE_KEYS,
  MIDDLEWARE_CONFIG,
  REPORT_CONFIG,
  DEFAULT_AREAS,
  FIELD_FEATURES,
  WORKING_HOURS,
}
