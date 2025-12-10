'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'OWNER' | 'EMPLOYEE' | 'ADMIN'
  createdAt?: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // دالة محسنة للتحقق من المصادقة مع تجديد التوكن
  const checkAuth = async (force = false) => {
    if (isRefreshing && !force) return
    
    try {
      setIsRefreshing(true)
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (res.status === 401) {
        // Token expired, try to refresh
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store'
        })

        if (refreshRes.ok) {
          // Retry after refresh
          const retryRes = await fetch('/api/auth/me', {
            credentials: 'include',
            cache: 'no-store'
          })
          
          if (retryRes.ok) {
            const data = await retryRes.json()
            if (data.status === 'success' && data.data?.user) {
              setUser(data.data.user)
            } else {
              setUser(null)
            }
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } else if (res.ok) {
        const data = await res.json()
        if (data.status === 'success' && data.data?.user) {
          setUser(data.data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // التحقق الأولي عند التحميل
  useEffect(() => {
    checkAuth()
  }, [])

  // إعادة التحقق عند تغيير المسار (اختياري)
  useEffect(() => {
    if (user && pathname.includes('/login')) {
      router.push(getDashboardPath(user.role))
    }
  }, [pathname, user, router])

  // الحصول على مسار الداشبورد حسب الدور
  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/dashboard/admin'
      case 'OWNER':
        return '/dashboard/owner'
      case 'EMPLOYEE':
        return '/dashboard/employee'
      default:
        return '/dashboard/player'
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok && data.status === 'success') {
        await checkAuth(true)
        
        // توجيه حسب الدور
        setTimeout(() => {
          if (data.data?.user?.role) {
            router.push(getDashboardPath(data.data.user.role))
          } else {
            router.push('/dashboard/player')
          }
        }, 100)
        
        return { success: true }
      } else {
        return { 
          success: false, 
          message: data.message || 'فشل تسجيل الدخول' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: 'حدث خطأ في الاتصال' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (res.ok && data.status === 'success') {
        await checkAuth(true)
        router.push('/dashboard/player')
        return { success: true }
      } else {
        return { 
          success: false, 
          message: data.message || 'فشل إنشاء الحساب' 
        }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { 
        success: false, 
        message: 'حدث خطأ في الاتصال' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = async () => {
    await checkAuth(true)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      checkAuth
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
