import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { formatDateToUTC, getWeekday } from '@/lib/helpers'
import { success, badRequest, notFound } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const fieldId = searchParams.get('id')
    const dateParam = searchParams.get('date')
    
    if (!fieldId) {
      return badRequest('معرّف الملعب مطلوب')
    }

    // Parse date or use today
    const selectedDate = dateParam ? new Date(dateParam) : new Date()
    const dateUTC = formatDateToUTC(selectedDate)
    const weekday = getWeekday(selectedDate)

    // Get field with details
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        area: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        schedules: {
          include: {
            slot: true
          },
          where: {
            OR: [
              { weekday: weekday },
              { weekday: null } // Available every day
            ]
          }
        }
      }
    })

    if (!field) {
      return notFound('لم يتم العثور على الملعب')
    }

    // Get bookings for the selected date
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId,
        date: dateUTC,
        status: {
          in: ['CONFIRMED', 'PENDING']
        }
      },
      select: {
        slotId: true,
        status: true
      }
    })

    // Create a set of booked slot IDs
    const bookedSlotIds = new Set(bookings.map(b => b.slotId))

    // Prepare available slots
    const availableSlots = field.schedules.map(schedule => {
      const isBooked = bookedSlotIds.has(schedule.slot.id)
      
      return {
        slotId: schedule.slot.id,
        label: schedule.slot.label,
        start: schedule.slot.start,
        end: schedule.slot.end,
        status: isBooked ? 'booked' : 'available',
        price: field.pricePerHour
      }
    })

    // Sort slots by start time
    availableSlots.sort((a, b) => a.start.localeCompare(b.start))

    // Return field with available slots
    const { schedules, ...fieldWithoutSchedules } = field

    return success({
      field: fieldWithoutSchedules,
      availableSlots,
      selectedDate: selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
    }, 'تم جلب تفاصيل الملعب بنجاح')
    
  } catch (error) {
    console.error('Get field details error:', error)
    return badRequest('حدث خطأ أثناء جلب تفاصيل الملعب')
  }
}
