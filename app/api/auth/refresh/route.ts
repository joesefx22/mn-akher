import { NextRequest } from 'next/server'
import { verifyToken, signToken, setAuthCookie } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return unauthorized('No token provided')
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return unauthorized('Invalid token')
    }

    // جلب المستخدم للتأكد من وجوده
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return unauthorized('User not found')
    }

    // إنشاء token جديد
    const newToken = signToken({ id: user.id, role: user.role })
    await setAuthCookie(newToken)

    return success({}, 'Token refreshed')

  } catch (error) {
    console.error('Refresh error:', error)
    return unauthorized('Refresh failed')
  }
}
import { NextRequest } from 'next/server'
import { verifyToken, signToken, setAuthCookie } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) return unauthorized('No token')
    
    const decoded = verifyToken(token)
    if (!decoded) return unauthorized('Invalid token')
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })
    if (!user) return unauthorized('User not found')
    
    const newToken = signToken({ id: user.id, role: user.role })
    await setAuthCookie(newToken)
    
    return success({}, 'Token refreshed')
  } catch (error) {
    return unauthorized('Refresh failed')
  }
}
