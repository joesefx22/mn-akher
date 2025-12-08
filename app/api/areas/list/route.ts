import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const areas = await prisma.area.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { fields: true } } }
    })
    
    return success({ areas })
  } catch (error) {
    return success({ areas: [] })
  }
}
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const areas = await prisma.area.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { fields: true }
        }
      }
    })

    return success({ areas }, 'تم جلب المناطق')

  } catch (error) {
    console.error('Error fetching areas:', error)
    return success({ areas: [] }, 'تم جلب المناطق')
  }
}
