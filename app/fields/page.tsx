import { PrismaClient } from '@prisma/client';
import FieldsList from './FieldsList';

const prisma = new PrismaClient();

interface PageProps {
  searchParams: {
    type?: string;
    area?: string;
    q?: string;
    page?: string;
  };
}

export default async function FieldsPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // بناء query بناءً على الفلاتر
  const where: any = {};
  
  if (searchParams.type && searchParams.type !== 'ALL') {
    where.type = searchParams.type;
  }
  
  if (searchParams.area && searchParams.area !== 'ALL') {
    where.areaId = searchParams.area;
  }
  
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { location: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } }
    ];
  }

  // جلب البيانات من قاعدة البيانات
  const [fields, total, areas] = await Promise.all([
    prisma.field.findMany({
      where,
      include: {
        area: true,
        owner: {
          select: { id: true, name: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    
    prisma.field.count({ where }),
    
    prisma.area.findMany({
      select: { id: true, name: true }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <FieldsList
      fields={fields}
      areas={areas}
      pagination={{
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }}
      filters={{
        type: searchParams.type || 'ALL',
        area: searchParams.area || 'ALL',
        search: searchParams.q || ''
      }}
    />
  );
}
