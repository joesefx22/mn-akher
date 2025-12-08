import Link from 'next/link'
import { Home, Calendar, User, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">احجزلي</span>
              <span className="text-xs text-gray-500">حجز ملعبك في دقيقة</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>الرئيسية</span>
            </Link>
            
            <Link 
              href="/fields" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>الملاعب</span>
            </Link>
            
            <Link 
              href="/my-bookings" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>حجوزاتي</span>
            </Link>

            <div className="h-6 w-px bg-gray-300"></div>

            <Link 
              href="/login" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span>تسجيل الدخول</span>
            </Link>
            
            <Link 
              href="/dashboard/player" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>حسابي</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>الرئيسية</span>
              </Link>
              
              <Link 
                href="/fields" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>الملاعب</span>
              </Link>
              
              <Link 
                href="/my-bookings" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>حجوزاتي</span>
              </Link>

              <div className="h-px bg-gray-200 mx-4"></div>

              <Link 
                href="/login" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                <span>تسجيل الدخول</span>
              </Link>
              
              <Link 
                href="/dashboard/player" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>حسابي</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
