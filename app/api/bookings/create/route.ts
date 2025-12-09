// app/api/bookings/create/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "PLAYER")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { fieldId, date, time } = await req.json();

    if (!fieldId || !date || !time)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    const exists = await prisma.booking.findFirst({
      where: { fieldId, date, time },
    });

    if (exists)
      return Response.json({ error: "Time slot already booked" }, { status: 409 });

    const booking = await prisma.booking.create({
      data: {
        fieldId,
        playerId: user.id,
        date,
        time,
        status: "PENDING",
      },
    });

    return Response.json({ booking }, { status: 201 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { success, fail, unauthorized } from '@/lib/responses'
import { z } from 'zod'

const schema = z.object({
  fieldId: z.string().uuid().or(z.string()),
  date: z.string(),
  slotId: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access')?.value
    if (!token) return unauthorized()

    const payload = verifyToken(token, 'access')
    if (!payload) return unauthorized()

    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) return fail('Invalid payload', 422)

    const { fieldId, date, slotId } = result.data
    const userId = (payload as any).id

    // basic availability check (simplified)
    const dateObj = new Date(date)
    const existing = await prisma.booking.findFirst({
      where: { fieldId, date: dateObj, slotStart: dateObj }
    })
    if (existing) return fail('Slot already booked', 409)

    // compute deposit (for example 50% if price > 0)
    const field = await prisma.field.findUnique({ where: { id: fieldId } })
    if (!field) return fail('Field not found', 404)
    const deposit = Math.round(field.pricePerHour * 0.5 * 100) / 100

    const booking = await prisma.booking.create({
      data: {
        userId,
        fieldId,
        date: dateObj,
        slotStart: dateObj,
        slotEnd: new Date(dateObj.getTime() + 60 * 60 * 1000), // 1 hr
        status: 'PENDING'
      }
    })

    let payment = null
    if (deposit > 0) {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: 'mock',
          amount: deposit,
          status: 'PENDING'
        }
      })
    }

    return success({ booking, payment })
  } catch (err) {
    console.error(err)
    return fail('Cannot create booking', 500)
  }
}
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
