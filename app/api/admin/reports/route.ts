import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth('ADMIN')
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    // 1. إجمالي الإيرادات
    const revenue = await prisma.payment.aggregate({
      where: { ...where, status: 'SUCCESS' },
      _sum: { amount: true },
      _count: true
    })
    
    // 2. عدد الحجوزات
    const bookings = await prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: true
    })
    
    // 3. الملاعب الأكثر طلباً
    const topFields = await prisma.booking.groupBy({
      by: ['fieldId'],
      where,
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })
    
    return success({
      revenue: revenue._sum.amount || 0,
      totalPayments: revenue._count || 0,
      bookings,
      topFields
    })
    
  } catch (error) {
    return unauthorized('Not authorized')
  }
}
