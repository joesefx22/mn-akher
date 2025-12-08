import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { 
  formatDateToUTC, 
  combineDateAndTime,
  calculateDeposit 
} from '@/lib/helpers'
import { 
  success, 
  badRequest, 
  unauthorized, 
  conflict,
  serverError 
} from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول أولاً')
    }

    const { fieldId, date: dateStr, slotId } = await request.json()

    // Validation
    if (!fieldId || !dateStr || !slotId) {
      return badRequest('جميع الحقول مطلوبة')
    }

    const selectedDate = new Date(dateStr)
    const today = new Date()
    
    // Check if date is in the past
    if (selectedDate < today) {
      return badRequest('لا يمكن الحجز في تاريخ ماضي')
    }

    // Get field and slot
    const [field, slot] = await Promise.all([
      prisma.field.findUnique({
        where: { id: fieldId }
      }),
      prisma.timeSlot.findUnique({
        where: { id: slotId }
      })
    ])

    if (!field) {
      return badRequest('الملعب غير موجود')
    }

    if (!slot) {
      return badRequest('الفترة غير موجودة')
    }

    // Check if slot is available
    const dateUTC = formatDateToUTC(selectedDate)
    const slotStart = combineDateAndTime(dateStr, slot.start)
    
    const existingBooking = await prisma.booking.findFirst({
      where: {
        fieldId,
        date: dateUTC,
        slotId,
        status: {
          in: ['CONFIRMED', 'PENDING']
        }
      }
    })

    if (existingBooking) {
      return conflict('هذه الفترة محجوزة بالفعل')
    }

    // Calculate deposit
    const deposit = calculateDeposit(field.pricePerHour, slotStart)
    
    // Create booking in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Double-check availability within transaction
      const doubleCheck = await tx.booking.findFirst({
        where: {
          fieldId,
          date: dateUTC,
          slotId,
          status: {
            in: ['CONFIRMED', 'PENDING']
          }
        }
      })

      if (doubleCheck) {
        throw new Error('Slot already booked')
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          fieldId,
          userId: user.id,
          date: dateUTC,
          slotId,
          slotLabel: slot.label,
          amount: field.pricePerHour,
          status: deposit === 0 ? 'CONFIRMED' : 'PENDING'
        }
      })

      // Create payment if deposit required
      let payment = null
      if (deposit > 0) {
        // In production: create payment record and call Paymob API
        // For MVP: simulate payment creation
        payment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            provider: 'paymob',
            providerTxId: `temp_${Date.now()}`,
            status: 'PENDING',
            amount: deposit
          }
        })
      }

      return { booking, payment }
    })

    // Prepare response
    const response: any = {
      booking: result.booking,
      message: deposit === 0 
        ? 'تم تأكيد الحجز بنجاح' 
        : 'يرجى إكمال عملية الدفع'
    }

    if (result.payment) {
      response.payment = {
        id: result.payment.id,
        amount: result.payment.amount,
        status: result.payment.status
      }
      // In production: add payUrl from Paymob
      response.payUrl = `/api/payments/initiate?paymentId=${result.payment.id}`
    }

    return success(response)
    
  } catch (error: any) {
    console.error('Create booking error:', error)
    
    if (error.message === 'Slot already booked') {
      return conflict('هذه الفترة محجوزة بالفعل')
    }
    
    return serverError('حدث خطأ أثناء إنشاء الحجز')
  }
}
