import { NextRequest } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول')
    }

    const { fieldId } = await request.json()
    
    if (!fieldId) {
      return badRequest('معرّف الملعب مطلوب')
    }

    // التحقق من صلاحيات المالك
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: { owner: true }
    })

    if (!field) {
      return badRequest('الملعب غير موجود')
    }

    if (field.ownerId !== user.id && user.role !== 'ADMIN') {
      return unauthorized('غير مصرح لك بتوليد جدول هذا الملعب')
    }

    // توليد الفترات الزمنية (06:00 إلى 23:00)
    const timeSlots = []
    for (let hour = 6; hour <= 23; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`
      const label = `${start} - ${end}`
      
      // إنشاء أو الحصول على TimeSlot
      const slot = await prisma.timeSlot.upsert({
        where: { label },
        update: {},
        create: { start, end, label }
      })
      timeSlots.push(slot)
    }

    // إنشاء FieldSchedule لكل يوم نشط
    const createdSchedules = []
    for (const weekday of field.activeDays) {
      for (const slot of timeSlots) {
        // تحقق إذا كان الجدول موجود بالفعل
        const existing = await prisma.fieldSchedule.findFirst({
          where: {
            fieldId,
            slotId: slot.id,
            weekday
          }
        })

        if (!existing) {
          const schedule = await prisma.fieldSchedule.create({
            data: {
              fieldId,
              slotId: slot.id,
              weekday
            }
          })
          createdSchedules.push(schedule)
        }
      }
    }

    return success({ 
      schedules: createdSchedules,
      message: `تم إنشاء ${createdSchedules.length} فترة زمنية`
    }, 'تم توليد الجدول بنجاح')

  } catch (error) {
    console.error('Error generating schedule:', error)
    return badRequest('حدث خطأ في توليد الجدول')
  }
}
