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
