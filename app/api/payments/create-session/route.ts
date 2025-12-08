import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized('Login required')

    const { bookingId } = await request.json()
    if (!bookingId) return badRequest('Booking ID required')

    // 1. Get booking with payment
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        userId: user.id,
        status: 'PENDING'
      },
      include: { field: true, payment: true }
    })

    if (!booking || !booking.payment) {
      return badRequest('Booking not payable')
    }

    // 2. For MVP: Create mock payment session
    // In production: Integrate with Paymob API
    
    const mockPaymentData = {
      paymentId: booking.payment.id,
      amount: booking.payment.amount,
      mockPaymentUrl: `/api/payments/mock-pay?paymentId=${booking.payment.id}`,
      // Production would have:
      // paymobIframeUrl: 'https://accept.paymob.com/...',
      // paymobPaymentKey: '...'
    }

    return success(mockPaymentData, 'Payment session created')

  } catch (error) {
    console.error('Payment session error:', error)
    return badRequest('Failed to create payment')
  }
}
