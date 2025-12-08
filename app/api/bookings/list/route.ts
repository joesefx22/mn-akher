import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول')
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'player'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let whereClause: any = {}

    // بناء where clause حسب الدور
    if (role === 'player') {
      whereClause.userId = user.id
    } else if (role === 'owner') {
      whereClause.field = { ownerId: user.id }
    } else if (role === 'employee') {
      // الموظف يرى حجوزات الملاعب الموكلة إليه
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id }
      })
      
      if (!employee || employee.fieldIds.length === 0) {
        return success({ bookings: [] }, 'لا توجد حجوزات')
      }
      
      whereClause.fieldId = { in: employee.fieldIds }
    }

    // فلترة حسب الحالة
    if (status) {
      whereClause.status = status
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        field: {
          include: {
            area: true
          }
        },
        slot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payment: true
      },
      orderBy: { date: 'desc' },
      take: limit
    })

    return success({ bookings }, 'تم جلب الحجوزات بنجاح')

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return unauthorized('حدث خطأ في جلب الحجوزات')
  }
}
