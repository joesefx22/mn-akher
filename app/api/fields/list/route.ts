import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, badRequest } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') as 'SOCCER' | 'PADEL' | null
    const areaId = searchParams.get('areaId')
    const search = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    
    // Build filter conditions
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (areaId) {
      where.areaId = areaId
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get fields with pagination
    const [fields, total] = await Promise.all([
      prisma.field.findMany({
        where,
        include: {
          area: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.field.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return success({
      fields,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'تم جلب الملاعب بنجاح')
    
  } catch (error) {
    console.error('Get fields error:', error)
    return badRequest('حدث خطأ أثناء جلب الملاعب')
  }
}
