import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const ACCESS_SECRET = process.env.ACCESS_SECRET!
const REFRESH_SECRET = process.env.REFRESH_SECRET!

export function signToken(payload: any, type: 'access' | 'refresh') {
  return jwt.sign(payload, type === 'access' ? ACCESS_SECRET : REFRESH_SECRET, {
    expiresIn: type === 'access' ? '15m' : '7d'
  })
}

export function verifyToken(token: string, type: 'access' | 'refresh') {
  try {
    return jwt.verify(token, type === 'access' ? ACCESS_SECRET : REFRESH_SECRET)
  } catch {
    return null
  }
}

export function setAuthCookies(user: any) {
  const access = signToken(user, 'access')
  const refresh = signToken(user, 'refresh')

  cookies().set('access', access, { httpOnly: true, path: '/', maxAge: 60 * 15 })
  cookies().set('refresh', refresh, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
}

export function clearAuthCookies() {
  cookies().delete('access')
  cookies().delete('refresh')
}
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 12

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// JWT Functions
export function signToken(payload: { id: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { id: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string }
  } catch {
    return null
  }
}

// Cookie Management
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

// User Management
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  return await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  })
}

export async function requireAuth(role?: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (role && user.role !== role) {
    throw new Error('Forbidden')
  }
  
  return user
}
