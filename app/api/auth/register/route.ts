import { NextRequest } from 'next/server'
import { hashPassword, setAuthCookie, signToken } from '@/lib/auth'
import { isValidEmail } from '@/lib/helpers'
import prisma from '@/lib/prisma'
import { success, badRequest, conflict } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return badRequest('جميع الحقول مطلوبة')
    }

    if (!isValidEmail(email)) {
      return badRequest('البريد الإلكتروني غير صالح')
    }

    if (password.length < 6) {
      return badRequest('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return conflict('البريد الإلكتروني مسجل بالفعل')
    }

    // Create user
    const hashedPassword = await hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Create token and set cookie
    const token = signToken({ id: user.id, role: user.role })
    await setAuthCookie(token)

    return success({ user }, 'تم التسجيل بنجاح')
    
  } catch (error) {
    console.error('Registration error:', error)
    return badRequest('حدث خطأ أثناء التسجيل')
  }
}
