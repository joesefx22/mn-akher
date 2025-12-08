import { NextRequest } from 'next/server'
import { clearAuthCookies } from '@/lib/auth'
import { success } from '@/lib/responses'

export async function POST(req: NextRequest) {
  const { accessCookie, refreshCookie } = clearAuthCookies()
  const res = success({ loggedOut: true })
  res.headers.set('Set-Cookie', `${accessCookie}; ${refreshCookie}`)
  return res
}

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
