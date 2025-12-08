import { NextRequest } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'
import { success } from '@/lib/responses'

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie()
    
    return success({}, 'تم تسجيل الخروج بنجاح')
  } catch (error) {
    console.error('Logout error:', error)
    return success({}, 'تم تسجيل الخروج')
  }
}
