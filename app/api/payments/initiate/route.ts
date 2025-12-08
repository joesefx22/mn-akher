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

    const { bookingId } = await request.json()
    
    if (!bookingId) {
      return badRequest('معرّف الحجز مطلوب')
    }

    // جلب الحجز والدفع
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        userId: user.id, // التأكد أن الحجز للمستخدم
        status: 'PENDING' // فقط الحجوزات المنتظرة
      },
      include: {
        field: true,
        payment: true
      }
    })

    if (!booking) {
      return badRequest('الحجز غير موجود أو غير قابل للدفع')
    }

    if (!booking.payment) {
      return badRequest('لا توجد عملية دفع لهذا الحجز')
    }

    // في MVP: محاكاة عملية الدفع
    // في production: تكامل مع Paymob
    
    const paymentUrl = `/payments/process?paymentId=${booking.payment.id}`
    
    return success({ 
      paymentUrl,
      payment: booking.payment
    }, 'تم إعداد عملية الدفع')

  } catch (error) {
    console.error('Error initiating payment:', error)
    return badRequest('حدث خطأ في بدء عملية الدفع')
  }
}
