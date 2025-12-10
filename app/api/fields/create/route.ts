import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createFieldSchedule } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { message: 'غير مصرح لك' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // التحقق من البيانات المطلوبة
    const requiredFields = ['name', 'type', 'pricePerHour', 'areaId', 'openHour', 'closeHour', 'activeDays'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `حقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }

    // إنشاء الملعب
    const field = await prisma.field.create({
      data: {
        name: data.name,
        type: data.type,
        pricePerHour: parseFloat(data.pricePerHour),
        location: data.location || '',
        areaId: data.areaId,
        ownerId: user.id,
        image: data.image,
        phone: data.phone,
        description: data.description,
        openHour: data.openHour,
        closeHour: data.closeHour,
        activeDays: data.activeDays
      }
    });

    // إنشاء Schedule للملعب
    await createFieldSchedule(field.id);

    return NextResponse.json({
      status: 'success',
      message: 'تم إنشاء الملعب بنجاح',
      data: { field }
    });

  } catch (error: any) {
    console.error('Error creating field:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'حدث خطأ في إنشاء الملعب'
      },
      { status: 500 }
    );
  }
}// app/api/fields/create/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "OWNER")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    if (!body.name || !body.price)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    const newField = await prisma.field.create({
      data: {
        name: body.name,
        price: body.price,
        ownerId: user.id,
        image: body.image || null,
        description: body.description || "",
      },
    });

    return Response.json({ field: newField }, { status: 201 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
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
