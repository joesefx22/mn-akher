import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول')
    }

    const bookingId = params.id

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        field: {
          include: {
            area: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        slot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payment: true
      }
    })

    if (!booking) {
      return badRequest('الحجز غير موجود')
    }

    // التحقق من الصلاحيات
    const isAuthorized = 
      booking.userId === user.id ||
      booking.field.ownerId === user.id ||
      user.role === 'ADMIN'

    if (!isAuthorized) {
      return unauthorized('غير مصرح لك بمشاهدة هذا الحجز')
    }

    return success({ booking }, 'تم جلب الحجز')

  } catch (error) {
    console.error('Error fetching booking:', error)
    return badRequest('حدث خطأ في جلب الحجز')
  }
}
