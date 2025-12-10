import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // الفلاتر
    const type = searchParams.get('type');
    const areaId = searchParams.get('areaId');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // بناء query
    const where: any = {};
    
    if (type && type !== 'ALL') {
      where.type = type;
    }
    
    if (areaId && areaId !== 'ALL') {
      where.areaId = areaId;
    }
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // جلب البيانات
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
          },
          _count: {
            select: {
              bookings: {
                where: {
                  status: 'CONFIRMED'
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      
      prisma.field.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      status: 'success',
      data: {
        fields,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching fields:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'حدث خطأ في جلب الملاعب'
      },
      { status: 500 }
    );
  }
}import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { success, fail } from '@/lib/responses'

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams
    const type = q.get('type')
    const take = Number(q.get('take') || 20)
    const skip = Number(q.get('skip') || 0)

    const where: any = {}
    if (type) where.type = type

    const fields = await prisma.field.findMany({
      where,
      take,
      skip,
      include: { owner: { select: { id: true, name: true } } }
    })

    return success({ fields })
  } catch (err) {
    console.error(err)
    return fail('Cannot fetch fields', 500)
  }
}
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
