import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { success, unauthorized } from '@/lib/responses'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('access')?.value
  if (!token) return unauthorized()

  const payload = verifyToken(token, 'access')
  if (!payload) return unauthorized()

  const user = await prisma.user.findUnique({ where: { id: (payload as any).id }, select: { id: true, name: true, email: true, role: true } })
  if (!user) return unauthorized()
  return success({ user })
}
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized } from '@/lib/responses'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return unauthorized('غير مصرح')
    }

    return success({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }, 'تم جلب بيانات المستخدم')

  } catch (error) {
    console.error('Get current user error:', error)
    return unauthorized('غير مصرح')
  }
}
