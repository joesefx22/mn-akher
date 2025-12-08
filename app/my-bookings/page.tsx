'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function MyBookingsPage() {
  const { user, loading } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    if (!loading) fetchBookings()
  }, [loading, user])

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await fetch('/api/bookings/list', { credentials: 'include' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.msg || 'Failed')
      setBookings(j.data.bookings || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoadingBookings(false)
    }
  }

  if (loadingBookings) return <div>جارٍ التحميل...</div>
  return (
    <div>
      <h1>حجوزاتي</h1>
      {bookings.length === 0 ? <p>لا توجد حجوزات</p> : (
        <ul>
          {bookings.map(b => (
            <li key={b.id}>
              {b.field?.name} - {new Date(b.date).toLocaleString()} - {b.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
// في دالة fetchBookings أضف validation:
const fetchBookings = async () => {
  setLoading(true)
  setError('')
  
  try {
    const response = await fetch('/api/bookings/list?role=player')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load bookings')
    }
    
    // Validate response
    if (!data.data || !Array.isArray(data.data.bookings)) {
      throw new Error('Invalid response format')
    }
    
    setBookings(data.data.bookings)
    
  } catch (err: any) {
    setError(err.message)
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
}

// في دالة handleCancelBooking أضف confirmation:
const handleCancelBooking = async (bookingId: string) => {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return
  }
  
  setCancellingId(bookingId)
  setError('')
  setSuccess('')
  
  try {
    const response = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, reason: 'User request' })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel booking')
    }
    
    setSuccess('Booking cancelled successfully')
    fetchBookings() // Refresh list
    
  } catch (err: any) {
    setError(err.message)
  } finally {
    setCancellingId(null)
  }
}'use client'

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
  Loader2,
  ChevronRight,
  CreditCard
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
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED'
  amount: number
  createdAt: string
  cancelledAt?: string
  cancelledBy?: string
  cancelReason?: string
  field: {
    id: string
    name: string
    type: 'SOCCER' | 'PADEL'
    location: string
    area: {
      name: string
    }
  }
  slot: {
    start: string
    end: string
  }
  payment?: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    providerTxId: string
  }
}

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export default function MyBookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')
  const [dateRange, setDateRange] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/my-bookings')
      return
    }
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/bookings/list?role=player')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل تحميل الحجوزات')
      }
      
      setBookings(data.data.bookings)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
      return
    }

    setCancellingId(bookingId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          reason: 'رغبة المستخدم'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل إلغاء الحجز')
      }

      setSuccess('تم إلغاء الحجز بنجاح')
      fetchBookings() // Refresh list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCancellingId(null)
    }
  }

  const handlePayNow = (bookingId: string) => {
    router.push(`/payments/${bookingId}`)
  }

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'EEEE، d MMMM yyyy', { locale: ar })
  }

  const formatTime = (timeString: string) => {
    return timeString
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
          text: 'بانتظار الدفع'
        }
      case 'CANCELLED':
        return {
          color: 'text-danger-600',
          bgColor: 'bg-danger-50',
          icon: <XCircle className="h-5 w-5" />,
          text: 'ملغى'
        }
      case 'FAILED':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <XCircle className="h-5 w-5" />,
          text: 'فاشل'
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

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'ALL' && booking.status !== statusFilter) {
      return false
    }
    
    // Date range filter
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (dateRange === 'upcoming' && bookingDate < today) {
      return false
    }
    
    if (dateRange === 'past' && bookingDate >= today) {
      return false
    }
    
    return true
  })

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-600">جاري التحقق من المصادقة...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">حجوزاتي</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          قم بإدارة جميع حجوزاتك في مكان واحد. يمكنك تتبع الحجوزات المؤكدة، 
          إلغاء الحجوزات، أو إكمال عملية الدفع للحجوزات المنتظرة.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {bookings.length}
          </div>
          <p className="text-gray-600">إجمالي الحجوزات</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-secondary-600 mb-2">
            {bookings.filter(b => b.status === 'CONFIRMED').length}
          </div>
          <p className="text-gray-600">مؤكدة</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {bookings.filter(b => b.status === 'PENDING').length}
          </div>
          <p className="text-gray-600">بانتظار الدفع</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-danger-600 mb-2">
            {bookings.filter(b => b.status === 'CANCELLED').length}
          </div>
          <p className="text-gray-600">ملغاة</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              حالة الحجز
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('ALL')}
              >
                الكل
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'CONFIRMED' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                مؤكدة
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
              >
                بانتظار الدفع
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'CANCELLED' ? 'primary' : 'outline'}
                onClick={() => setStatusFilter('CANCELLED')}
              >
                ملغاة
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              الفترة الزمنية
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={dateRange === 'upcoming' ? 'primary' : 'outline'}
                onClick={() => setDateRange('upcoming')}
              >
                القادمة
              </Button>
              <Button
                size="sm"
                variant={dateRange === 'past' ? 'primary' : 'outline'}
                onClick={() => setDateRange('past')}
              >
                الماضية
              </Button>
              <Button
                size="sm"
                variant={dateRange === 'all' ? 'primary' : 'outline'}
                onClick={() => setDateRange('all')}
              >
                الكل
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
          <p className="text-danger-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-200">
          <p className="text-secondary-700">{success}</p>
        </div>
      )}

      {/* Bookings List */}
      <div>
        {/* List Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            قائمة الحجوزات
          </h2>
          <div className="text-sm text-gray-600">
            عرض {filteredBookings.length} من {bookings.length} حجز
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600">جاري تحميل الحجوزات...</p>
          </div>
        )}

        {/* No Bookings */}
        {!loading && sortedBookings.length === 0 && (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد حجوزات
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== 'ALL' || dateRange !== 'upcoming' 
                ? 'لا توجد حجوزات تطابق الفلاتر المحددة'
                : 'لم تقم بأي حجوزات بعد. ابدأ بحجز ملعبك الأول!'}
            </p>
            <Button onClick={() => router.push('/fields')}>
              تصفح الملاعب
            </Button>
          </Card>
        )}

        {/* Bookings Grid */}
        {!loading && sortedBookings.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {sortedBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status)
              const isUpcoming = new Date(booking.date) >= new Date()
              
              return (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.text}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-sm ${booking.field.type === 'SOCCER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {booking.field.type === 'SOCCER' ? 'كرة قدم' : 'بادل'}
                          </span>
                          
                          {booking.payment?.status === 'PENDING' && booking.status === 'PENDING' && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                              <CreditCard className="h-3 w-3 inline ml-1" />
                              بانتظار الدفع
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {booking.field.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">
                              {formatBookingDate(booking.date)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">
                              {booking.slotLabel}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">
                              {booking.field.area.name}
                            </span>
                          </div>
                        </div>

                        {/* Cancellation Info */}
                        {booking.status === 'CANCELLED' && booking.cancelReason && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">سبب الإلغاء: </span>
                              {booking.cancelReason}
                            </p>
                            {booking.cancelledAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                تم الإلغاء في {format(new Date(booking.cancelledAt), 'dd/MM/yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price & Actions */}
                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            {booking.amount} ج
                          </div>
                          <div className="text-sm text-gray-600">
                            السعر الإجمالي
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/fields/${booking.field.id}`)}
                          >
                            عرض الملعب
                          </Button>

                          {/* Status-specific Actions */}
                          {booking.status === 'PENDING' && isUpcoming && (
                            <>
                              {booking.payment?.status === 'PENDING' && (
                                <Button
                                  variant="secondary"
                                  onClick={() => handlePayNow(booking.id)}
                                >
                                  <CreditCard className="h-4 w-4 ml-2" />
                                  ادفع الآن
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                loading={cancellingId === booking.id}
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                إلغاء الحجز
                              </Button>
                            </>
                          )}

                          {booking.status === 'CONFIRMED' && isUpcoming && (
                            <Button
                              variant="danger"
                              loading={cancellingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              إلغاء الحجز
                            </Button>
                          )}

                          {booking.status === 'CANCELLED' && booking.payment?.status === 'SUCCESS' && (
                            <Button
                              variant="outline"
                              onClick={() => router.push('/refund')}
                            >
              طلب استرداد
            </Button>
          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      {!loading && sortedBookings.length === 0 && statusFilter === 'ALL' && (
        <Card className="text-center p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            جاهز للعب؟
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            ابدأ بحجز ملعبك الأول واستمتع بأفضل تجربة رياضية
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/fields')}
          >
            <ChevronRight className="h-5 w-5 ml-2" />
            تصفح الملاعب
          </Button>
        </Card>
      )}
    </div>
  )
}
