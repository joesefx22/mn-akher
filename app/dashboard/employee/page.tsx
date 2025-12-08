'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Users,
  ChevronRight,
  Loader2,
  Phone
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

interface AssignedField {
  id: string
  name: string
  type: 'SOCCER' | 'PADEL'
  location: string
  area: {
    name: string
  }
  todayBookings: number
  pendingBookings: number
}

interface TodayBooking {
  id: string
  fieldId: string
  slotLabel: string
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  customerName: string
  customerPhone: string
  amount: number
  notes?: string
}

export default function EmployeeDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [assignedFields, setAssignedFields] = useState<AssignedField[]>([])
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<TodayBooking[]>([])

  useEffect(() => {
    if (!user || (user.role !== 'EMPLOYEE' && user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      router.push('/dashboard/player')
      return
    }
    fetchEmployeeData()
  }, [user])

  const fetchEmployeeData = async () => {
    setLoading(true)
    
    try {
      // Mock data for employee
      const mockFields: AssignedField[] = [
        {
          id: '1',
          name: 'ملعب النجوم',
          type: 'SOCCER',
          location: 'شارع 10، حي الرياض',
          area: { name: 'المقطم' },
          todayBookings: 8,
          pendingBookings: 2
        },
        {
          id: '2',
          name: 'ملعب البادل الأول',
          type: 'PADEL',
          location: 'شارع 20، حي الأمل',
          area: { name: 'الهضبة' },
          todayBookings: 5,
          pendingBookments: 1
        }
      ]

      const mockTodayBookings: TodayBooking[] = [
        {
          id: '1',
          fieldId: '1',
          slotLabel: '14:00 - 15:00',
          startTime: '14:00',
          endTime: '15:00',
          status: 'CONFIRMED',
          customerName: 'محمد أحمد',
          customerPhone: '01012345678',
          amount: 200,
          notes: 'فريق محترف'
        },
        {
          id: '2',
          fieldId: '1',
          slotLabel: '15:00 - 16:00',
          startTime: '15:00',
          endTime: '16:00',
          status: 'PENDING',
          customerName: 'أحمد محمود',
          customerPhone: '01087654321',
          amount: 200,
          notes: 'يحتاج كرات إضافية'
        },
        {
          id: '3',
          fieldId: '2',
          slotLabel: '17:00 - 18:00',
          startTime: '17:00',
          endTime: '18:00',
          status: 'CONFIRMED',
          customerName: 'محمود سعيد',
          customerPhone: '01011112222',
          amount: 150
        }
      ]

      const mockUpcomingBookings: TodayBooking[] = [
        {
          id: '4',
          fieldId: '1',
          slotLabel: '20:00 - 21:00',
          startTime: '20:00',
          endTime: '21:00',
          status: 'CONFIRMED',
          customerName: 'سامي علي',
          customerPhone: '01033334444',
          amount: 200
        }
      ]

      setAssignedFields(mockFields)
      setTodayBookings(mockTodayBookings)
      setUpcomingBookings(mockUpcomingBookings)
      
      if (mockFields.length > 0 && !selectedField) {
        setSelectedField(mockFields[0].id)
      }

    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    if (!confirm(`هل تريد ${action === 'confirm' ? 'تأكيد' : 'إلغاء'} هذا الحجز؟`)) {
      return
    }

    // In production: API call to update booking
    alert(`تم ${action === 'confirm' ? 'تأكيد' : 'إلغاء'} الحجز بنجاح`)
    fetchEmployeeData() // Refresh data
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          color: 'text-secondary-600',
          bgColor: 'bg-secondary-50',
          icon: <CheckCircle className="h-5 w-5" />,
          text: 'مؤكد'
        }
      case 'PENDING':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: <AlertCircle className="h-5 w-5" />,
          text: 'بانتظار'
        }
      case 'CANCELLED':
        return {
          color: 'text-danger-600',
          bgColor: 'bg-danger-50',
          icon: <XCircle className="h-5 w-5" />,
          text: 'ملغى'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <AlertCircle className="h-5 w-5" />,
          text: 'غير معروف'
        }
    }
  }

  const getFieldTypeColor = (type: 'SOCCER' | 'PADEL') => {
    return type === 'SOCCER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  }

  const filteredTodayBookings = selectedField
    ? todayBookings.filter(booking => booking.fieldId === selectedField)
    : todayBookings

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const selectedFieldData = assignedFields.find(f => f.id === selectedField)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            لوحة تحكم الموظف، {user?.name} 👨‍💼
          </h1>
          <p className="text-gray-600 mt-2">
            قم بإدارة الحجوزات والعمليات اليومية للملاعب الموكلة إليك.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">الوقت الحالي</div>
            <div className="text-lg font-semibold text-gray-900">
              {format(new Date(), 'hh:mm a', { locale: ar })}
            </div>
          </div>
          <Button 
            onClick={() => router.push('/bookings/create')}
          >
            <ChevronRight className="h-5 w-5 ml-2" />
            حجز جديد
          </Button>
        </div>
      </div>

      {/* Assigned Fields */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">الملاعب الموكلة إليك</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedFields.map((field) => {
            const isSelected = selectedField === field.id
            return (
              <Card 
                key={field.id} 
                className={`p-6 cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary-500' : 'hover:shadow-lg'}`}
                onClick={() => setSelectedField(field.id)}
                hover
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs ${getFieldTypeColor(field.type)}`}>
                        {field.type === 'SOCCER' ? 'كرة قدم' : 'بادل'}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {field.area.name}
                      </span>
                    </div>
                  </div>
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">حجوزات اليوم</span>
                    <span className="font-semibold text-gray-900">{field.todayBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">حجوزات منتظرة</span>
                    <span className="font-semibold text-yellow-600">{field.pendingBookings}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="mt-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/fields/${field.id}`)
                  }}
                >
                  إدارة الملعب
                </Button>
              </Card>
            )
          })}
          
          {/* Add Field Card (if employee can add) */}
          <Card className="p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">طلب ملعب جديد</h3>
            <p className="text-sm text-gray-600 mb-4">
              اطلب إضافة ملعب جديد لإدارتك
            </p>
            <Button 
              variant="outline"
              onClick={() => router.push('/fields/request')}
            >
              تقديم طلب
            </Button>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Bookings */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">حجوزات اليوم</h2>
                {selectedFieldData && (
                  <p className="text-gray-600 mt-1">
                    لملعب: {selectedFieldData.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {format(new Date(), 'EEEE، d MMMM', { locale: ar })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/bookings')}
                >
                  عرض الكل
                </Button>
              </div>
            </div>
            
            {filteredTodayBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد حجوزات</h3>
                <p className="text-gray-600 mb-6">
                  لا توجد حجوزات لليوم في هذا الملعب
                </p>
                <Button onClick={() => router.push('/bookings/create')}>
                  إنشاء حجز جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTodayBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status)
                  const field = assignedFields.find(f => f.id === booking.fieldId)
                  
                  return (
                    <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                              {statusConfig.icon}
                              {statusConfig.text}
                            </span>
                            {field && (
                              <span className="text-xs text-gray-600">
                                {field.name}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-gray-900">{booking.slotLabel}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{booking.customerName}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{booking.amount} ج</div>
                          <div className="text-sm text-gray-600">السعر</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${booking.customerPhone}`}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
                          >
                            <Phone className="h-4 w-4" />
                            {booking.customerPhone}
                          </a>
                          {booking.notes && (
                            <span className="text-xs text-gray-500">• {booking.notes}</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                              >
                                تأكيد
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleBookingAction(booking.id, 'cancel')}
                              >
                                إلغاء
                              </Button>
                            </>
                          )}
                          
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleBookingAction(booking.id, 'cancel')}
                            >
                              إلغاء
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/bookings/${booking.id}`)}
                          >
                            تفاصيل
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Upcoming */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/bookings/create')}
              >
                <Calendar className="h-5 w-5 ml-2" />
                إنشاء حجز جديد
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/customers')}
              >
                <Users className="h-5 w-5 ml-2" />
                العملاء الدائمين
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/checkin')}
              >
                <CheckCircle className="h-5 w-5 ml-2" />
                تسجيل الحضور
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/reports')}
              >
                <AlertCircle className="h-5 w-5 ml-2" />
                تقارير اليوم
              </Button>
            </div>
          </Card>

          {/* Upcoming Bookings */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">الحجوزات القادمة</h3>
            
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">لا توجد حجوزات قادمة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{booking.slotLabel}</h4>
                        <p className="text-sm text-gray-600">{booking.customerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{booking.amount} ج</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{booking.startTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              fullWidth 
              className="mt-6"
              onClick={() => router.push('/bookings?view=upcoming')}
            >
              عرض جميع الحجوزات القادمة
            </Button>
          </Card>

          {/* Employee Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إحصائياتك</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الحجوزات اليوم</span>
                <span className="font-semibold text-gray-900">
                  {todayBookings.filter(b => b.status === 'CONFIRMED').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الإيرادات اليوم</span>
                <span className="font-semibold text-gray-900">
                  {todayBookings
                    .filter(b => b.status === 'CONFIRMED')
                    .reduce((sum, b) => sum + b.amount, 0)} ج
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">العملاء الجدد</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">نسبة الإشغال</span>
                <span className="font-semibold text-gray-900">85%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
