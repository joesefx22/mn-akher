'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type User = { id: string, name: string, email: string, role: string } | null

const AuthContext = createContext({
  user: null as User,
  loading: true,
  checkAuth: async () => {},
  logout: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/me', { credentials: 'include', headers: { 'Cache-Control': 'no-cache' } })
      if (res.status === 401) {
        const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        if (!r.ok) {
          setUser(null)
          setLoading(false)
          return
        }
        const retry = await fetch('/api/auth/me', { credentials: 'include' })
        if (retry.ok) {
          const data = await retry.json()
          setUser(data.data.user)
          setLoading(false)
          return
        }
        setUser(null)
        setLoading(false)
        return
      }
      if (res.ok) {
        const data = await res.json()
        setUser(data.data.user)
      } else setUser(null)
    } catch (err) {
      console.error('checkAuth error', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
// الخطأ الشائع: مفيش token refresh
async function checkAuth() {
  const res = await fetch('/api/auth/me')
  // إذا التوكن منتهي؟ مفيش handle
}

// الصح:
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    
    if (res.status === 401) {
      // Token expired, try refresh
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (refreshRes.ok) {
        // Retry original request
        const retryRes = await fetch('/api/auth/me', { credentials: 'include' })
        if (retryRes.ok) {
          const data = await retryRes.json()
          setUser(data.data.user)
        }
      }
    } else if (res.ok) {
      const data = await res.json()
      setUser(data.data.user)
    }
  } catch (error) {
    setUser(null)
  }
}
// في دالة checkAuth:
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include' // مهم
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data.data?.user) {
        setUser(data.data.user)
      }
    } else {
      // Token might be expired, try refresh
      await refreshToken()
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    setUser(null)
  } finally {
    setIsLoading(false)
  }
}

// أضف دالة refreshToken:
async function refreshToken() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
    
    if (res.ok) {
      await checkAuth() // Retry auth check
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
  }
}

// أضف في return الـ context:
refreshUser: async () => {
  await checkAuth()
}
// في دالة checkAuth أضف error handling
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include' // مهم جداً
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data.data && data.data.user) {
        setUser(data.data.user)
      }
    } else {
      // إذا فشل، حاول refresh token
      await refreshToken()
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    setUser(null)
  } finally {
    setIsLoading(false)
  }
}

// دالة refresh token
async function refreshToken() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
    
    if (res.ok) {
      await checkAuth()
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
  }
}
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed')
      }

      await checkAuth()
      
      // Redirect based on role
      if (data.data.user.role === 'OWNER') {
        router.push('/dashboard/owner')
      } else if (data.data.user.role === 'EMPLOYEE') {
        router.push('/dashboard/employee')
      } else if (data.data.user.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/player')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function register(name: string, email: string, password: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      await checkAuth()
      router.push('/dashboard/player')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  async function refreshUser() {
    await checkAuth()
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
