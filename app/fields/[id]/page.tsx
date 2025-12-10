import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import FieldDetailsClient from './FieldDetailsClient';
import { getAvailableSlots } from '@/lib/helpers';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    date?: string;
  };
}

export default async function FieldPage({ params, searchParams }: PageProps) {
  const fieldId = params.id;
  
  // تحليل التاريخ
  const selectedDate = searchParams.date 
    ? new Date(searchParams.date)
    : new Date();

  // جلب بيانات الملعب من قاعدة البيانات
  const field = await prisma.field.findUnique({
    where: { id: fieldId },
    include: {
      area: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!field) {
    notFound();
  }

  // جلب الساعات المتاحة (من الدالة الجديدة)
  let availableSlots = [];
  try {
    availableSlots = await getAvailableSlots(fieldId, selectedDate);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    availableSlots = [];
  }

  return (
    <FieldDetailsClient
      field={field}
      availableSlots={availableSlots}
      selectedDate={selectedDate}
    />
  );
}

export async function generateStaticParams() {
  const fields = await prisma.field.findMany({
    select: { id: true }
  });
  
  return fields.map((field) => ({
    id: field.id
  }));
}
