import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { success, unauthorized, fail } from '@/lib/responses'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('access')?.value
  if (!token) return unauthorized()
  const payload = verifyToken(token, 'access')
  if (!payload) return unauthorized()

  const { bookingId } = await req.json()
  if (!bookingId) return fail('Missing bookingId', 400)

  // basic permission: owner or user can cancel
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return fail('Booking not found', 404)

  const userId = (payload as any).id
  const role = (payload as any).role
  if (booking.userId !== userId && role !== 'OWNER' && role !== 'ADMIN') {
    return fail('Not allowed', 403)
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' }
  })

  return success({ booking: updated })
}
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول')
    }

    const { bookingId, reason } = await request.json()
    
    if (!bookingId) {
      return badRequest('معرّف الحجز مطلوب')
    }

    // جلب الحجز مع معلومات الملعب
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        field: true,
        user: true
      }
    })

    if (!booking) {
      return badRequest('الحجز غير موجود')
    }

    // التحقق من الصلاحيات
    const canCancel = 
      booking.userId === user.id || // المستخدم نفسه
      booking.field.ownerId === user.id || // مالك الملعب
      user.role === 'ADMIN' // المسؤول

    if (!canCancel) {
      return unauthorized('غير مصرح لك بإلغاء هذا الحجز')
    }

    // التحقق من أن الحجز لم يمر بعد
    const bookingDate = new Date(booking.date)
    const now = new Date()
    
    if (bookingDate < now) {
      return badRequest('لا يمكن إلغاء حجز ماضي')
    }

    // تحديث الحجز
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: user.role === 'USER' ? 'user' : 
                     user.role === 'OWNER' ? 'owner' : 
                     user.role === 'EMPLOYEE' ? 'employee' : 'admin',
        cancelReason: reason || 'بدون سبب'
      }
    })

    return success({ booking: updatedBooking }, 'تم إلغاء الحجز بنجاح')

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return badRequest('حدث خطأ في إلغاء الحجز')
  }
}
