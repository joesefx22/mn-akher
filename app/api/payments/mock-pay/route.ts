import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, fail } from '@/lib/responses'

export async function GET(req: NextRequest) {
  // this simulates payment provider callback & directly updates payment & booking
  const bookingId = req.nextUrl.searchParams.get('bookingId')
  if (!bookingId) return fail('Missing bookingId', 400)

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true } })
  if (!booking) return fail('Booking not found', 404)

  // mark payment success
  if (booking.payment) {
    await prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'SUCCESS' } })
  } else {
    // create payment record to mark as success
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: 'mock',
        amount: booking.field.pricePerHour * 0.5,
        status: 'SUCCESS'
      }
    })
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED' } })

  // Normally provider will redirect user back to frontend; here redirect to my-bookings
  const redirect = new URL('/my-bookings', process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000')
  return new Response(null, { status: 302, headers: { Location: redirect.toString() } })
}
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized('Login required')

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    
    if (!paymentId) return badRequest('Payment ID required')

    // For MVP only: Simulate payment success
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { 
          status: 'SUCCESS',
          providerTxId: `mock_${Date.now()}_${paymentId}`
        }
      })

      await tx.booking.update({
        where: { paymentId },
        data: { status: 'CONFIRMED' }
      })
    })

    // Redirect to success page
    return Response.redirect(new URL('/booking-success', request.url))

  } catch (error) {
    console.error('Mock payment error:', error)
    return Response.redirect(new URL('/payment-failed', request.url))
  }
}
