import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, badRequest } from '@/lib/responses'

// هذا الـ webhook يستقبل callback من Paymob بعد الدفع
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // في production: التحقق من توقيع Paymob
    const {
      obj: {
        id: paymentId,
        order: { id: orderId },
        success: isSuccess,
        amount_cents,
        created_at
      }
    } = body

    // البحث عن الـ Payment بواسطة providerTxId
    const payment = await prisma.payment.findUnique({
      where: { providerTxId: paymentId.toString() },
      include: { booking: true }
    })

    if (!payment) {
      console.error('Payment not found:', paymentId)
      return badRequest('Payment not found')
    }

    // التحقق من أن المبلغ متطابق
    if (payment.amount * 100 !== amount_cents) {
      console.error('Amount mismatch:', payment.amount, amount_cents)
      return badRequest('Amount mismatch')
    }

    // تحديث حالة الدفع والحجز
    await prisma.$transaction(async (tx) => {
      // تحديث الـ Payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'SUCCESS' : 'FAILED'
        }
      })

      // إذا نجح الدفع، تحديث حالة الحجز
      if (isSuccess && payment.booking) {
        await tx.booking.update({
          where: { id: payment.booking.id },
          data: {
            status: 'CONFIRMED'
          }
        })
      }
    })

    return success({}, 'تم تحديث حالة الدفع بنجاح')

  } catch (error) {
    console.error('Webhook error:', error)
    return badRequest('حدث خطأ في معالجة الدفع')
  }
}
