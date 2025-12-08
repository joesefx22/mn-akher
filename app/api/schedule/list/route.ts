import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, badRequest } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')
    const weekday = searchParams.get('weekday')
    
    if (!fieldId) {
      return badRequest('معرّف الملعب مطلوب')
    }

    const whereClause: any = { fieldId }
    
    if (weekday !== null && weekday !== undefined) {
      whereClause.OR = [
        { weekday: parseInt(weekday) },
        { weekday: null } // الفترات اليومية
      ]
    }

    const schedules = await prisma.fieldSchedule.findMany({
      where: whereClause,
      include: {
        slot: true,
        field: {
          select: {
            id: true,
            name: true,
            openHour: true,
            closeHour: true
          }
        }
      },
      orderBy: {
        slot: {
          start: 'asc'
        }
      }
    })

    return success({ schedules }, 'تم جلب الجدول بنجاح')

  } catch (error) {
    console.error('Error fetching schedule:', error)
    return badRequest('حدث خطأ في جلب الجدول')
  }
}
