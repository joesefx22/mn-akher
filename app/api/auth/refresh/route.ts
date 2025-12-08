import { NextRequest } from 'next/server'
import { verifyToken, signToken, clearAuthCookies } from '@/lib/auth'
import { success, fail, unauthorized } from '@/lib/responses'
import { serialize } from 'cookie'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const refresh = req.cookies.get('refresh')?.value
  if (!refresh) return unauthorized()

  const payload = verifyToken(refresh, 'refresh')
  if (!payload) return unauthorized()

  // verify user still exists
  const user = await prisma.user.findUnique({ where: { id: (payload as any).id } })
  if (!user) return unauthorized()

  // issue new access token
  const newAccess = signToken({ id: user.id, role: user.role }, 'access')
  const accessCookie = serialize('access', newAccess, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 15 })

  const res = success({ ok: true })
  res.headers.set('Set-Cookie', accessCookie)
  return res
}
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
