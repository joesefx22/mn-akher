'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Calendar, 
  User, 
  LogIn, 
  LogOut,
  Menu, 
  X,
  Shield,
  Building,
  Users
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// أنواع الأدوار للمساعدة في التنقل
const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  USER: '/dashboard/player',
  PLAYER: '/dashboard/player',
  OWNER: '/dashboard/owner',
  EMPLOYEE: '/dashboard/employee',
  ADMIN: '/dashboard/admin'
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  // التأكد من أن المكون قد تم تحميله على العميل
  useEffect(() => {
    setMounted(true)
  }, [])

  // دالة لتحديد إذا كان الرابط نشطًا
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  // دالة لتحديد رابط داشبورد المستخدم
  const getUserDashboardPath = () => {
    if (!user) return '/login'
    return ROLE_DASHBOARD_PATHS[user.role] || '/dashboard/player'
  }

  // إيقاف التمرير عند فتح القائمة المتنقلة
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // أيقونة حسب دور المستخدم
  const getUserIcon = () => {
    if (!user) return <User className="h-5 w-5" />
    
    switch (user.role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5" />
      case 'OWNER':
        return <Building className="h-5 w-5" />
      case 'EMPLOYEE':
        return <Users className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  // نص حسب دور المستخدم
  const getUserText = () => {
    if (!user) return 'حسابي'
    
    switch (user.role) {
      case 'ADMIN':
        return 'لوحة التحكم'
      case 'OWNER':
        return 'لوحة المالك'
      case 'EMPLOYEE':
        return 'لوحة الموظف'
      default:
        return 'حسابي'
    }
  }

  // إخفاء الهيدر في صفحات معينة
  const hideHeaderPaths = ['/login', '/register']
  if (hideHeaderPaths.some(path => pathname.startsWith(path))) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-gray-900">احجزلي</span>
              <span className="text-xs text-gray-500">حجز ملعبك في دقيقة</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-primary-50 text-primary-600 font-medium' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>الرئيسية</span>
            </Link>
            
            <Link 
              href="/fields" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/fields') 
                  ? 'bg-primary-50 text-primary-600 font-medium' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>الملاعب</span>
            </Link>
            
            {user && (
              <Link 
                href="/my-bookings" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/my-bookings') 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>حجوزاتي</span>
              </Link>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* قسم تسجيل الدخول/حسابي */}
            {!mounted || isLoading ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <LoadingSpinner size="sm" />
              </div>
            ) : !user ? (
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
              >
                <LogIn className="h-5 w-5" />
                <span>تسجيل الدخول</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href={getUserDashboardPath()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  {getUserIcon()}
                  <span className="font-medium">{getUserText()}</span>
                  {user.name && (
                    <span className="text-sm text-gray-500 mr-1">({user.name})</span>
                  )}
                </Link>
                
                <button 
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">خروج</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {!mounted || isLoading ? (
              <LoadingSpinner size="sm" />
            ) : user ? (
              <Link 
                href={getUserDashboardPath()}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600"
                aria-label={getUserText()}
              >
                {getUserIcon()}
              </Link>
            ) : null}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 bg-white z-40 md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/') 
                        ? 'bg-primary-50 text-primary-600 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span>الرئيسية</span>
                  </Link>
                  
                  <Link 
                    href="/fields" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/fields') 
                        ? 'bg-primary-50 text-primary-600 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>الملاعب</span>
                  </Link>
                  
                  {user && (
                    <>
                      <Link 
                        href="/my-bookings" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive('/my-bookings') 
                            ? 'bg-primary-50 text-primary-600 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="h-5 w-5" />
                        <span>حجوزاتي</span>
                      </Link>
                      
                      <Link 
                        href={getUserDashboardPath()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive('/dashboard') 
                            ? 'bg-primary-50 text-primary-600 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {getUserIcon()}
                        <span>{getUserText()}</span>
                      </Link>
                    </>
                  )}
                </div>

                {user && (
                  <>
                    <div className="h-px bg-gray-200 my-6"></div>
                    <div className="px-4 py-2">
                      <div className="text-sm text-gray-500 mb-2">الحساب</div>
                      <div className="space-y-2">
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{user.email}</div>
                          <div className="text-xs mt-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full inline-block">
                            {user.role === 'ADMIN' && 'مدير النظام'}
                            {user.role === 'OWNER' && 'مالك ملعب'}
                            {user.role === 'EMPLOYEE' && 'موظف'}
                            {user.role === 'USER' && 'لاعب'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Footer Actions */}
              <div className="border-t p-4">
                {!mounted || isLoading ? (
                  <div className="flex justify-center py-2">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : !user ? (
                  <div className="space-y-3">
                    <Link 
                      href="/login" 
                      className="block w-full text-center px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="inline-block h-5 w-5 ml-2" />
                      تسجيل الدخول
                    </Link>
                    <Link 
                      href="/register" 
                      className="block w-full text-center px-4 py-3 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      إنشاء حساب جديد
                    </Link>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors font-medium border border-danger-200"
                  >
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
