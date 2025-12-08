import { NextRequest } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول')
    }

    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return badRequest('معرّف الملعب مطلوب')
    }

    // التحقق من صلاحيات المالك
    const field = await prisma.field.findUnique({
      where: { id }
    })

    if (!field) {
      return badRequest('الملعب غير موجود')
    }

    if (field.ownerId !== user.id && user.role !== 'ADMIN') {
      return unauthorized('غير مصرح لك بتعديل هذا الملعب')
    }

    // تحديث الملعب
    const updatedField = await prisma.field.update({
      where: { id },
      data: updateData,
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

    return success({ field: updatedField }, 'تم تحديث الملعب بنجاح')

  } catch (error) {
    console.error('Error updating field:', error)
    return badRequest('حدث خطأ في تحديث الملعب')
  }
}
