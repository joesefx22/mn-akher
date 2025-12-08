import { NextRequest } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('OWNER') // أو ADMIN

    const data = await request.json()
    
    // التحقق من البيانات المطلوبة
    const requiredFields = ['name', 'type', 'pricePerHour', 'areaId', 'location']
    for (const field of requiredFields) {
      if (!data[field]) {
        return badRequest(`حقل ${field} مطلوب`)
      }
    }

    // إنشاء الملعب
    const field = await prisma.field.create({
      data: {
        ...data,
        ownerId: user.id,
        activeDays: data.activeDays || [0, 1, 2, 3, 4, 5, 6],
        openHour: data.openHour || '06:00',
        closeHour: data.closeHour || '23:00'
      },
      include: {
        area: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return success({ field }, 'تم إنشاء الملعب بنجاح')

  } catch (error: any) {
    console.error('Error creating field:', error)
    
    if (error.message === 'Unauthorized') {
      return unauthorized('غير مصرح لك بإنشاء ملاعب')
    }
    
    return badRequest('حدث خطأ في إنشاء الملعب')
  }
}
