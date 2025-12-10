import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { prisma } from './prisma';

/**
 * توليد جميع الساعات الممكنة من openHour إلى closeHour
 */
export function generateTimeSlots(
  openHour: string,    // "06:00"
  closeHour: string,   // "23:00"
  duration: number = 1 // مدة الساعة بالدقائق
): { start: string; end: string; label: string }[] {
  const slots: { start: string; end: string; label: string }[] = [];
  
  const [openH, openM] = openHour.split(':').map(Number);
  const [closeH, closeM] = closeHour.split(':').map(Number);
  
  let currentHour = openH;
  let currentMinute = openM;
  
  while (
    currentHour < closeH || 
    (currentHour === closeH && currentMinute < closeM)
  ) {
    const start = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // حساب وقت النهاية
    let endHour = currentHour;
    let endMinute = currentMinute + duration * 60;
    
    while (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }
    
    const end = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // التحقق أن وقت النهاية ليس بعد closeHour
    if (
      endHour > closeH || 
      (endHour === closeH && endMinute > closeM)
    ) {
      break;
    }
    
    slots.push({
      start,
      end,
      label: `${start} - ${end}`
    });
    
    // الانتقال للساعة التالية
    currentHour = endHour;
    currentMinute = endMinute;
  }
  
  return slots;
}

/**
 * التحقق إذا كان اليوم نشط للملعب
 */
export function isFieldActiveOnDay(field: any, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = الأحد
  return field.activeDays.includes(dayOfWeek);
}

/**
 * جلب الساعات المتاحة لملعب في تاريخ معين
 */
export async function getAvailableSlots(
  fieldId: string,
  date: Date
): Promise<{
  slotId: string;
  start: string;
  end: string;
  label: string;
  status: 'available' | 'booked' | 'unavailable';
  price: number;
}[]> {
  // 1. جلب بيانات الملعب
  const field = await prisma.field.findUnique({
    where: { id: fieldId },
    include: {
      schedules: {
        include: {
          slot: true
        }
      }
    }
  });

  if (!field) {
    throw new Error('الملعب غير موجود');
  }

  // 2. التحقق إذا كان اليوم نشط
  const dayOfWeek = date.getDay();
  const isActive = field.activeDays.includes(dayOfWeek);
  
  if (!isActive) {
    return []; // الملعب غير متاح في هذا اليوم
  }

  // 3. جلب الحجوزات لهذا التاريخ
  const bookings = await prisma.booking.findMany({
    where: {
      fieldId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999))
      },
      status: {
        in: ['CONFIRMED', 'PENDING']
      }
    },
    include: {
      slot: true
    }
  });

  // 4. توليد الساعات المتاحة
  const allSlots = generateTimeSlots(field.openHour, field.closeHour);
  
  // 5. الربط مع بيانات قاعدة البيانات
  const availableSlots = await Promise.all(
    allSlots.map(async (slot) => {
      // البحث عن TimeSlot في قاعدة البيانات
      let timeSlot = await prisma.timeSlot.findUnique({
        where: {
          start_end: {
            start: slot.start,
            end: slot.end
          }
        }
      });

      // إذا لم يكن موجود، ننشئه
      if (!timeSlot) {
        timeSlot = await prisma.timeSlot.create({
          data: {
            start: slot.start,
            end: slot.end,
            label: slot.label
          }
        });
      }

      // التحقق إذا كان الحجز متاح لهذا اليوم
      const scheduleExists = field.schedules.some(
        s => s.slotId === timeSlot!.id && (s.weekday === null || s.weekday === dayOfWeek)
      );

      // التحقق إذا كان محجوز
      const isBooked = bookings.some(
        b => b.slot.start === slot.start && b.slot.end === slot.end
      );

      // تحديد السعر (يمكن إضافة منطق للأسعار الذروة)
      const isPeakHour = parseInt(slot.start.split(':')[0]) >= 18;
      const price = isPeakHour ? field.pricePerHour * 1.2 : field.pricePerHour;

      return {
        slotId: timeSlot.id,
        start: slot.start,
        end: slot.end,
        label: slot.label,
        status: !scheduleExists ? 'unavailable' : isBooked ? 'booked' : 'available',
        price
      };
    })
  );

  return availableSlots;
}

/**
 * إنشاء schedule للملعب (مرة واحدة عند إنشاء الملعب)
 */
export async function createFieldSchedule(fieldId: string) {
  const field = await prisma.field.findUnique({
    where: { id: fieldId }
  });

  if (!field) {
    throw new Error('الملعب غير موجود');
  }

  const slots = generateTimeSlots(field.openHour, field.closeHour);
  
  // لكل يوم نشط، ننشئ schedule
  for (const day of field.activeDays) {
    for (const slot of slots) {
      // البحث أو إنشاء TimeSlot
      let timeSlot = await prisma.timeSlot.findUnique({
        where: {
          start_end: {
            start: slot.start,
            end: slot.end
          }
        }
      });

      if (!timeSlot) {
        timeSlot = await prisma.timeSlot.create({
          data: {
            start: slot.start,
            end: slot.end,
            label: slot.label
          }
        });
      }

      // إنشاء FieldSchedule
      await prisma.fieldSchedule.create({
        data: {
          fieldId,
          slotId: timeSlot.id,
          weekday: day
        }
      });
    }
  }
}
// Password Hashing
const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Date & Time Helpers
export function formatDateToUTC(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds()
  ))
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  
  return new Date(Date.UTC(year, month - 1, day, hours, minutes))
}

export function getWeekday(date: Date): number {
  return date.getUTCDay() // 0 = Sunday, 6 = Saturday
}

export function getWeekdayName(weekday: number): string {
  const days = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 
    'الخميس', 'الجمعة', 'السبت'
  ]
  return days[weekday]
}

// Business Logic Helpers
export function calculateDeposit(
  pricePerHour: number,
  bookingDate: Date,
  currentDate: Date = new Date()
): { amount: number; required: boolean; reason: string } {
  const diffHours = (bookingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60)
  
  if (diffHours < 24) {
    return {
      amount: 0,
      required: false,
      reason: 'الحجز خلال 24 ساعة لا يتطلب وديعة'
    }
  }
  
  return {
    amount: pricePerHour,
    required: true,
    reason: 'وديعة تأكيد الحجز (تخصم من المبلغ النهائي)'
  }
}

export async function isSlotAvailable(
  fieldId: string,
  date: Date,
  slotId: string,
  excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
  try {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        fieldId,
        date: formatDateToUTC(date),
        slotId,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        NOT: excludeBookingId ? { id: excludeBookingId } : undefined
      },
      select: {
        id: true,
        status: true,
        user: {
          select: {
            name: true
          }
        }
      }
    })
    
    if (existingBooking) {
      return {
        available: false,
        reason: existingBooking.status === 'CONFIRMED' 
          ? 'محجوز بالفعل'
          : 'قيد الانتظار'
      }
    }
    
    return { available: true }
  } catch (error) {
    console.error('Error checking slot availability:', error)
    return {
      available: false,
      reason: 'خطأ في التحقق من التوفر'
    }
  }
}

export async function createBookingTransaction(
  bookingData: {
    fieldId: string
    userId: string
    date: Date
    slotId: string
    slotLabel: string
    amount: number
    status: 'PENDING' | 'CONFIRMED'
  },
  paymentData?: {
    provider: string
    providerTxId: string
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    amount: number
  }
) {
  return await prisma.$transaction(async (tx) => {
    // Check slot availability within transaction
    const availability = await isSlotAvailable(
      bookingData.fieldId,
      bookingData.date,
      bookingData.slotId
    )
    
    if (!availability.available) {
      throw new Error(`الوقت غير متاح: ${availability.reason}`)
    }
    
    // Create booking
    const booking = await tx.booking.create({
      data: {
        ...bookingData,
        date: formatDateToUTC(bookingData.date),
      },
    })
    
    // Create payment if provided
    let payment = null
    if (paymentData) {
      payment = await tx.payment.create({
        data: {
          ...paymentData,
          bookingId: booking.id,
        },
      })
      
      // Link payment to booking if successful
      if (paymentData.status === 'SUCCESS') {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            paymentId: payment.id,
          },
        })
      }
    }
    
    return { booking, payment }
  })
}

// Validation Helpers
export function validateBookingData(data: any): {
  valid: boolean
  errors: string[]
  validatedData?: {
    fieldId: string
    userId: string
    date: Date
    slotId: string
    slotLabel: string
    amount: number
  }
} {
  const errors: string[] = []
  
  // Required fields
  const requiredFields = ['fieldId', 'date', 'slotId', 'slotLabel']
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} مطلوب`)
    }
  })
  
  // Date validation
  if (data.date) {
    const date = new Date(data.date)
    if (isNaN(date.getTime())) {
      errors.push('تاريخ غير صالح')
    } else if (date < new Date()) {
      errors.push('لا يمكن الحجز في تاريخ ماضي')
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    errors: [],
    validatedData: {
      fieldId: data.fieldId,
      userId: data.userId,
      date: new Date(data.date),
      slotId: data.slotId,
      slotLabel: data.slotLabel,
      amount: parseFloat(data.amount) || 0,
    }
  }
}

// Pagination Helper
export function createPaginationParams(
  page: string | number = 1,
  limit: string | number = 10
): { skip: number; take: number; page: number; limit: number } {
  const pageNum = typeof page === 'string' ? parseInt(page) : page
  const limitNum = typeof limit === 'string' ? parseInt(limit) : limit
  
  const validPage = Math.max(1, isNaN(pageNum) ? 1 : pageNum)
  const validLimit = Math.min(100, Math.max(1, isNaN(limitNum) ? 10 : limitNum))
  
  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
    page: validPage,
    limit: validLimit,
  }
}

// String Utilities
export function generateRandomCode(length: number = 6): string {
  const chars = '0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Error Handling Wrapper
export async function handleApiError<T>(
  handler: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await handler()
    return { data, error: null }
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    
    return { data: null, error: 'حدث خطأ غير متوقع' }
  }
}

// Time Slot Generation
export function generateTimeSlots(
  startHour: string,
  endHour: string,
  duration: number = 60
): Array<{ start: string; end: string; label: string }> {
  const slots: Array<{ start: string; end: string; label: string }> = []
  
  const [startH, startM] = startHour.split(':').map(Number)
  const [endH, endM] = endHour.split(':').map(Number)
  
  let currentHour = startH
  let currentMinute = startM
  
  while (
    currentHour < endH ||
    (currentHour === endH && currentMinute < endM)
  ) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    // Calculate end time
    let endHour = currentHour
    let endMinute = currentMinute + duration
    
    while (endMinute >= 60) {
      endHour++
      endMinute -= 60
    }
    
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
    
    // Add slot if it doesn't exceed end time
    if (
      endHour < endH ||
      (endHour === endH && endMinute <= endM)
    ) {
      slots.push({
        start: startTime,
        end: endTime,
        label: `${startTime} - ${endTime}`,
      })
    }
    
    // Move to next slot
    currentMinute += duration
    while (currentMinute >= 60) {
      currentHour++
      currentMinute -= 60
    }
  }
  
  return slots
}
