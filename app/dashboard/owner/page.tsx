'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  PieChart,
  BarChart3,
  Building,
  PlusCircle,
  Clock,
  MapPin,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

interface FieldStats {
  id: string
  name: string
  type: 'SOCCER' | 'PADEL'
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
}

interface RevenueData {
  date: string
  revenue: number
  bookings: number
}

interface Booking {
  id: string
  date: string
  slotLabel: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  amount: number
  user: {
    name: string
  }
  field: {
    name: string
    area: {
      name: string
    }
  }
}

export default function OwnerDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [fields, setFields] = useState<FieldStats[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [stats, setStats] = useState({
    totalFields: 0,
    totalRevenue: 0,
    totalBookings: 0,
    pendingPayments: 0,
    thisMonthRevenue: 0,
    thisMonthBookings: 0
  })

  useEffect(() => {
    if (!user || user.role !== 'OWNER') {
      router.push('/dashboard/player')
      return
    }
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    try {
      // Mock data for demo (in production, fetch from API)
      const mockFields: FieldStats[] = [
        {
          id: '1',
          name: 'ملعب النجوم',
          type: 'SOCCER',
          totalBookings: 45,
          totalRevenue: 9000,
          occupancyRate: 78
        },
        {
          id: '2',
          name: 'ملعب البادل الأول',
          type: 'PADEL',
          totalBookings: 32,
          totalRevenue: 4800,
          occupancyRate: 65
        },
        {
          id: '3',
          name: 'ملعب النصر',
          type: 'SOCCER',
          totalBookings: 38,
          totalRevenue: 7600,
          occupancyRate: 72
        }
      ]

      const mockBookings: Booking[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          slotLabel: '17:00 - 18:00',
          status: 'CONFIRMED',
          amount: 200,
          user: { name: 'محمد أحمد' },
          field: { name: 'ملعب النجوم', area: { name: 'المقطم' } }
        },
        {
          id: '2',
          date: new Date().toISOString(),
          slotLabel: '18:00 - 19:00',
          status: 'PENDING',
          amount: 200,
          user: { name: 'أحمد محمود' },
          field: { name: 'ملعب البادل الأول', area: { name: 'الهضبة' } }
        },
        {
          id: '3',
          date: new Date().toISOString(),
          slotLabel: '20:00 - 21:00',
          status: 'CONFIRMED',
          amount: 150,
          user: { name: 'محمود سعيد' },
          field: { name: 'ملعب النصر', area: { name: 'مدينة نصر' } }
        }
      ]

      const mockRevenueData: RevenueData[] = [
        { date: '1/12', revenue: 1500, bookings: 8 },
        { date: '2/12', revenue: 2200, bookings: 11 },
        { date: '3/12', revenue: 1800, bookings: 9 },
        { date: '4/12', revenue: 2500, bookings: 13 },
        { date: '5/12', revenue: 1900, bookings: 10 },
        { date: '6/12', revenue: 2100, bookings: 11 },
        { date: '7/12', revenue: 2300, bookings: 12 }
      ]

      setFields(mockFields)
      setRecentBookings(mockBookings)
      setRevenueData(mockRevenueData)

      const totalRevenue = mockFields.reduce((sum, field) => sum + field.totalRevenue, 0)
      const totalBookings = mockFields.reduce((sum, field) => sum + field.totalBookings, 0)
      const thisMonthRevenue = 12500
      const thisMonthBookings = 62

      setStats({
        totalFields: mockFields.length,
        totalRevenue,
        totalBookings,
        pendingPayments: mockBookings.filter(b => b.status === 'PENDING').length,
        thisMonthRevenue,
        thisMonthBookings
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-EG') + ' ج'
  }

  const getFieldTypeColor = (type: 'SOCCER' | 'PADEL') => {
    return type === 'SOCCER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  }

  if (loading) {
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
            لوحة تحكم المالك، {user?.name} 👑
          </h1>
          <p className="text-gray-600 mt-2">
            قم بإدارة ملاعبك ومتابعة الإيرادات والحجوزات من مكان واحد.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => router.push('/fields/create')}
          >
            <PlusCircle className="h-5 w-5 ml-2" />
            إضافة ملعب جديد
          </Button>
          <Button 
            onClick={() => router.push('/fields')}
          >
            <ChevronRight className="h-5 w-5 ml-2" />
            إدارة الملاعب
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الملاعب</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalFields}
              </div>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Building className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-secondary-600">
            <TrendingUp className="h-4 w-4" />
            <span>+2 هذا الشهر</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            {formatCurrency(stats.thisMonthRevenue)} هذا الشهر
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalBookings}
              </div>
            </div>
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            {stats.thisMonthBookings} حجز هذا الشهر
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
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => router.push('/bookings?status=PENDING')}
          >
            متابعة المدفوعات
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">الإيرادات خلال الأسبوع</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/analytics')}
              >
                عرض التقرير الكامل
              </Button>
            </div>
            
            <div className="space-y-4">
              {revenueData.map((day, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(day.revenue)}
                      </span>
                      <span className="text-sm text-gray-600">{day.bookings} حجز</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${(day.revenue / 3000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط الإيرادات اليومية</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(revenueData.reduce((sum, day) => sum + day.revenue, 0) / revenueData.length)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">إجمالي الأسبوع</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(revenueData.reduce((sum, day) => sum + day.revenue, 0))}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fields Performance */}
        <div>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">أداء الملاعب</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/fields')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{field.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${getFieldTypeColor(field.type)}`}>
                          {field.type === 'SOCCER' ? 'كرة قدم' : 'بادل'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {field.occupancyRate}% إشغال
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(field.totalRevenue)}</div>
                      <div className="text-xs text-gray-600">{field.totalBookings} حجز</div>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary-500 rounded-full"
                      style={{ width: `${field.occupancyRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              fullWidth 
              className="mt-6"
              onClick={() => router.push('/analytics/fields')}
            >
              <BarChart3 className="h-4 w-4 ml-2" />
              تحليل مفصل
            </Button>
          </Card>
        </div>
      </div>

      {/* Recent Bookings & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">آخر الحجوزات</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/bookings')}
              >
                عرض الكل
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">الملعب</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">العميل</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">التاريخ</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">الحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{booking.field.name}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.field.area.name}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{booking.user.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{booking.slotLabel}</div>
                        <div className="text-xs text-gray-600">
                          {format(new Date(booking.date), 'dd/MM', { locale: ar })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'CONFIRMED' ? 'مؤكد' : 
                           booking.status === 'PENDING' ? 'بانتظار الدفع' : 'ملغى'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{booking.amount} ج</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إحصائيات سريعة</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">متوسط سعر الحجز</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(stats.totalBookings > 0 ? stats.totalRevenue / stats.totalBookings : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">نسبة الإشغال</span>
                <span className="font-semibold text-gray-900">
                  {fields.length > 0 
                    ? Math.round(fields.reduce((sum, f) => sum + f.occupancyRate, 0) / fields.length) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">حجوزات ناجحة</span>
                <span className="font-semibold text-gray-900">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">معدل الإلغاء</span>
                <span className="font-semibold text-gray-900">6%</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              fullWidth 
              className="mt-6"
              onClick={() => router.push('/analytics')}
            >
              <PieChart className="h-4 w-4 ml-2" />
              التقارير المتقدمة
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/employees')}
              >
                <Users className="h-5 w-5 ml-2" />
                إدارة الموظفين
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/schedule')}
              >
                <Calendar className="h-5 w-5 ml-2" />
                إدارة الجداول
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/payments')}
              >
                <DollarSign className="h-5 w-5 ml-2" />
                المدفوعات
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/settings')}
              >
                <Building className="h-5 w-5 ml-2" />
                إعدادات الملاعب
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
