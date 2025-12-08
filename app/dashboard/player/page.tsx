'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  TrendingUp,
  Award,
  Activity,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

interface Booking {
  id: string
  date: string
  slotLabel: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  amount: number
  field: {
    id: string
    name: string
    type: 'SOCCER' | 'PADEL'
    area: {
      name: string
    }
  }
}

export default function PlayerDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingPayments: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)
  const [quickActions, setQuickActions] = useState([
    { id: 1, title: 'حجز ملعب جديد', icon: '⚽', action: () => router.push('/fields') },
    { id: 2, title: 'دفع حجز منتظر', icon: '💳', action: () => router.push('/my-bookings?status=PENDING') },
    { id: 3, title: 'مشاركة التطبيق', icon: '📱', action: () => alert('مشاركة') },
    { id: 4, title: 'الدعم الفني', icon: '💬', action: () => router.push('/support') }
  ])

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/dashboard/player')
      return
    }
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    try {
      // Fetch recent bookings
      const bookingsRes = await fetch('/api/bookings/list?role=player&limit=5')
      const bookingsData = await bookingsRes.json()
      
      if (bookingsRes.ok) {
        setRecentBookings(bookingsData.data.bookings.slice(0, 3))
        
        // Calculate stats
        const bookings = bookingsData.data.bookings
        const totalBookings = bookings.length
        const confirmedBookings = bookings.filter((b: Booking) => b.status === 'CONFIRMED').length
        const pendingPayments = bookings.filter((b: Booking) => b.status === 'PENDING').length
        const totalSpent = bookings
          .filter((b: Booking) => b.status === 'CONFIRMED')
          .reduce((sum: number, b: Booking) => sum + b.amount, 0)
        
        setStats({
          totalBookings,
          confirmedBookings,
          pendingPayments,
          totalSpent
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'اليوم'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس'
    } else {
      return format(date, 'd MMMM', { locale: ar })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-secondary-600 bg-secondary-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED': return 'text-danger-600 bg-danger-50'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'مؤكد'
      case 'PENDING': return 'بانتظار الدفع'
      case 'CANCELLED': return 'ملغى'
      default: return status
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            مرحباً، {user?.name} 👋
          </h1>
          <p className="text-gray-600 mt-2">
            هذه لوحة تحكمك الشخصية. تابع حجوزاتك وأداء نشاطك الرياضي.
          </p>
        </div>
        
        <Button 
          onClick={() => router.push('/fields')}
          className="md:w-auto w-full"
        >
          <ChevronRight className="h-5 w-5 ml-2" />
          حجز ملعب جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalBookings}
              </div>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-secondary-600">
            <TrendingUp className="h-4 w-4" />
            <span>+12% عن الشهر الماضي</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">حجوزات مؤكدة</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.confirmedBookings}
              </div>
            </div>
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Award className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            {Math.round((stats.confirmedBookings / stats.totalBookings) * 100) || 0}% نجاح
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مدفوعات منتظرة</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingPayments}
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => router.push('/my-bookings?status=PENDING')}
          >
            ادفع الآن
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الإنفاق</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalSpent}
                <span className="text-lg text-gray-600"> ج</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            متوسط {stats.confirmedBookings > 0 ? Math.round(stats.totalSpent / stats.confirmedBookings) : 0} ج/حجز
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-medium text-gray-900">{action.title}</h3>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">آخر الحجوزات</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/my-bookings')}
            >
              عرض الكل
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : recentBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد حجوزات
              </h3>
              <p className="text-gray-600 mb-6">
                لم تقم بأي حجوزات بعد. ابدأ بحجز ملعبك الأول!
              </p>
              <Button onClick={() => router.push('/fields')}>
                تصفح الملاعب
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(booking.date)}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {booking.field.name}
                      </h4>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{booking.slotLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.field.area.name}</span>
                        </div>
                        <div className="text-gray-900 font-medium">
                          {booking.amount} ج
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/fields/${booking.field.id}`)}
                    >
                      التفاصيل
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Profile & Quick Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ملفك الشخصي</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-600">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">العضوية</span>
                  <span className="font-medium text-gray-900">لاعب عادي</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مسجل منذ</span>
                  <span className="font-medium text-gray-900">
                    {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy', { locale: ar }) : '--'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">عدد الملاعب المفضلة</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => router.push('/profile')}
              >
                تعديل الملف الشخصي
              </Button>
            </div>
          </Card>

          {/* Upcoming Booking */}
          {recentBookings.some(b => b.status === 'CONFIRMED') && (
            <Card className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <h3 className="text-xl font-bold mb-4">حجزك القادم</h3>
              {recentBookings
                .filter(b => b.status === 'CONFIRMED')
                .slice(0, 1)
                .map((booking) => (
                  <div key={booking.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{booking.field.name}</h4>
                        <p className="text-primary-100 text-sm">{booking.field.area.name}</p>
                      </div>
                      <div className="text-2xl font-bold">{booking.amount} ج</div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.date)}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4" />
                      <span>{booking.slotLabel}</span>
                    </div>
                    
                    <Button 
                      variant="secondary"
                      fullWidth
                      onClick={() => router.push(`/fields/${booking.field.id}`)}
                    >
                      عرض تفاصيل الملعب
                    </Button>
                  </div>
                ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
