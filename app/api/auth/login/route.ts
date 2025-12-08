import { NextRequest } from 'next/server'
import { comparePasswords, setAuthCookie, signToken } from '@/lib/auth'
import { isValidEmail } from '@/lib/helpers'
import prisma from '@/lib/prisma'
import { success, badRequest, unauthorized } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return badRequest('البريد الإلكتروني وكلمة المرور مطلوبان')
    }

    if (!isValidEmail(email)) {
      return badRequest('البريد الإلكتروني غير صالح')
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      return unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }

    // Create token and set cookie
    const token = signToken({ id: user.id, role: user.role })
    await setAuthCookie(token)

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return success({ 
      user: userWithoutPassword,
      redirect: getDashboardPath(user.role)
    }, 'تم تسجيل الدخول بنجاح')
    
  } catch (error) {
    console.error('Login error:', error)
    return badRequest('حدث خطأ أثناء تسجيل الدخول')
  }
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'OWNER': return '/dashboard/owner'
    case 'EMPLOYEE': return '/dashboard/employee'
    case 'ADMIN': return '/dashboard/admin'
    default: return '/dashboard/player'
  }
}
