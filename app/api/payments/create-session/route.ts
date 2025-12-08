import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { success, fail, unauthorized } from '@/lib/responses'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access')?.value
    if (!token) return unauthorized()
    const payload = verifyToken(token, 'access')
    if (!payload) return unauthorized()

    const { bookingId } = await req.json()
    if (!bookingId) return fail('Missing bookingId', 400)

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true, field: true }})
    if (!booking) return fail('Booking not found', 404)
    // create mock payment session
    const redirectUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'}/api/payments/mock-pay?bookingId=${booking.id}`

    return success({ paymentUrl: redirectUrl })
  } catch (err) {
    console.error(err)
    return fail('Payment init error', 500)
  }
}
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
