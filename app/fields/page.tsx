import { PrismaClient } from '@prisma/client';
import FieldsList from './FieldsList';

const prisma = new PrismaClient();

export default async function FieldsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;
  
  // بناء query من searchParams
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
      { location: { contains: searchParams.q, mode: 'insensitive' } }
    ];
  }
  
  // جلب البيانات من قاعدة البيانات
  const [fields, total, areas] = await Promise.all([
    prisma.field.findMany({
      where,
      include: {
        area: true,
        owner: { select: { id: true, name: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    
    prisma.field.count({ where }),
    
    prisma.area.findMany()
  ]);

  return (
    <FieldsList
      initialFields={fields}
      areas={areas}
      total={total}
      currentPage={page}
      filters={searchParams}
    />
  );
}
