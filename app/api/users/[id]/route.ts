import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized('Login required')
    
    if (user.role !== 'ADMIN' && user.id !== params.id) {
      return unauthorized('Not authorized')
    }
    
    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
    
    if (!userData) return badRequest('User not found')
    
    return success({ user: userData })
  } catch (error) {
    return badRequest('Error fetching user')
  }
}
import { NextRequest } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorized('يجب تسجيل الدخول')
    }

    // فقط admin أو المستخدم نفسه
    if (user.role !== 'ADMIN' && user.id !== params.id) {
      return unauthorized('غير مصرح')
    }

    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // لا ترجع password
      }
    })

    if (!userData) {
      return badRequest('المستخدم غير موجود')
    }

    return success({ user: userData }, 'تم جلب بيانات المستخدم')

  } catch (error) {
    console.error('Error fetching user:', error)
    return badRequest('حدث خطأ في جلب بيانات المستخدم')
  }
}
