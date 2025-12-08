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
