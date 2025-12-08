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
