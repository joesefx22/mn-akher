export const hashPassword = async (password: string) => {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
};

export const generateRandomCode = (len = 6) => {
  let code = "";
  const chars = "0123456789";
  for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};
export const generateSlug = (name: string) =>
  name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

export const formatDate = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ')

export const catchAsync = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (err) {
      console.error(err)
      return Response.json({ ok: false, msg: 'Server error' }, { status: 500 })
    }
  }
}
import prisma from './prisma'

// Date & Time Helpers
export function formatDateToUTC(date: Date): Date {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ))
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date(dateStr)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export function getWeekday(date: Date): number {
  return date.getDay() // 0 = Sunday, 6 = Saturday
}

// Business Logic
export function calculateDeposit(pricePerHour: number, bookingDate: Date): number {
  const now = new Date()
  const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  // If booking is within 24 hours, no deposit required
  if (diffHours < 24) {
    return 0
  }
  
  return pricePerHour
}

export async function isSlotAvailable(
  fieldId: string, 
  date: Date, 
  slotId: string
): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: {
      fieldId,
      date: formatDateToUTC(date),
      slotId,
      status: {
        in: ['CONFIRMED', 'PENDING']
      }
    }
  })
  
  return !existing
}

// Validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]{9}$/
  return phoneRegex.test(phone)
}

// Pagination
export function paginate<T>(items: T[], page: number, limit: number) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    items: items.slice(startIndex, endIndex),
    total: items.length,
    pages: Math.ceil(items.length / limit),
    currentPage: page,
    hasNext: endIndex < items.length,
    hasPrev: page > 1
  }
}
