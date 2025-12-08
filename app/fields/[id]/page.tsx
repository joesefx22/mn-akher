'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Calendar, 
  Users, 
  Star, 
  Check,
  AlertCircle,
  ChevronLeft,
  Share2
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import BookingSlot from '@/components/BookingSlot'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

interface FieldDetails {
  id: string
  name: string
  type: 'SOCCER' | 'PADEL'
  pricePerHour: number
  location: string
  image: string
  phone: string
  description: string
  openHour: string
  closeHour: string
  activeDays: number[]
  area: {
    name: string
  }
  owner: {
    name: string
    email: string
    phone: string
  }
}

interface AvailableSlot {
  slotId: string
  label: string
  start: string
  end: string
  status: 'available' | 'booked'
  price: number
}

export default function FieldDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [field, setField] = useState<FieldDetails | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Date selection
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  
  const fieldId = params.id as string

  const fetchFieldDetails = async (date?: Date) => {
    setLoading(true)
    setError('')
    
    try {
      const dateStr = format(date || selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/fields/details?id=${fieldId}&date=${dateStr}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل تحميل تفاصيل الملعب')
      }
      
      setField(data.data.field)
      setAvailableSlots(data.data.availableSlots)
      
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching field details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fieldId) {
      fetchFieldDetails()
    }
  }, [fieldId])

  const handleDateChange = (daysToAdd: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + daysToAdd)
    newDate.setHours(0, 0, 0, 0)
    setSelectedDate(newDate)
    fetchFieldDetails(newDate)
  }

  const handleBookSlot = async (slotId: string) => {
    if (!user) {
      router.push(`/login?redirect=/fields/${fieldId}`)
      return
    }

    const selectedSlot = availableSlots.find(slot => slot.slotId === slotId)
    if (!selectedSlot || selectedSlot.status !== 'available') {
      setError('هذه الفترة غير متاحة للحجز')
      return
    }

    setBookingLoading(true)
    setError('')
    setSuccess('')

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fieldId,
          date: dateStr,
          slotId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل إنشاء الحجز')
      }

      if (data.data.payUrl) {
        // Redirect to payment page
        window.location.href = data.data.payUrl
      } else {
        setSuccess('تم تأكيد الحجز بنجاح!')
        // Refresh available slots
        fetchFieldDetails(selectedDate)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return format(date, 'EEEE، d MMMM', { locale: ar })
  }

  const getDayName = (dayIndex: number) => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    return days[dayIndex]
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الملعب...</p>
      </div>
    )
  }

  if (error || !field) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <AlertCircle className="h-12 w-12 text-danger-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
        <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على الملعب'}</p>
        <Button onClick={() => router.push('/fields')}>
          العودة للقائمة
        </Button>
      </Card>
    )
  }

  const isActiveToday = field.activeDays.includes(selectedDate.getDay())

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/fields')}
        className="mb-4"
      >
        <ChevronLeft className="h-5 w-5 ml-2" />
        العودة للقائمة
      </Button>

      {/* Hero Section */}
      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
        <Image
          src={field.image || 'https://picsum.photos/1200/600?random'}
          alt={field.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${field.type === 'SOCCER' ? 'bg-blue-500' : 'bg-purple-500'}`}>
              {field.type === 'SOCCER' ? 'ملعب كرة قدم' : 'ملعب بادل'}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
              {field.area.name}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{field.name}</h1>
          <p className="text-lg opacity-90">{field.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Field Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">عن الملعب</h2>
            <p className="text-gray-700 leading-relaxed">{field.description}</p>
          </Card>

          {/* Features */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">المميزات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">ساعات العمل</h4>
                  <p className="text-gray-600">{field.openHour} - {field.closeHour}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">أيام العمل</h4>
                  <p className="text-gray-600">
                    {field.activeDays.map(getDayName).join('، ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">السعة</h4>
                  <p className="text-gray-600">
                    {field.type === 'SOCCER' ? '5 ضد 5' : '2 ضد 2'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Star className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">التقييم</h4>
                  <p className="text-gray-600">4.8/5 (124 تقييم)</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Owner Info */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">معلومات المالك</h2>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {field.owner.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{field.owner.name}</h4>
                <div className="flex flex-wrap gap-3 mt-2">
                  <a 
                    href={`mailto:${field.owner.email}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                  >
                    <span className="text-sm">{field.owner.email}</span>
                  </a>
                  <a 
                    href={`tel:${field.phone}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{field.phone}</span>
                  </a>
                </div>
              </div>
              <Button variant="outline">
                اتصل بالمالك
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Booking */}
        <div className="space-y-8">
          {/* Price Card */}
          <Card className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {field.pricePerHour}
              <span className="text-xl text-gray-600"> ج</span>
            </div>
            <p className="text-gray-600">للساعة الواحدة</p>
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700">
                <Check className="h-4 w-4 inline ml-1" />
                إلغاء مجاني قبل 24 ساعة
              </p>
            </div>
          </Card>

          {/* Date Selector */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">اختر تاريخ</h3>
            
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateChange(-1)}
              >
                اليوم السابق
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </div>
                <div className="text-sm text-gray-600">
                  {format(selectedDate, 'dd/MM/yyyy')}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateChange(1)}
              >
                اليوم التالي
              </Button>
            </div>

            {!isActiveToday ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-700">الملعب غير متاح في هذا اليوم</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableSlots.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">لا توجد فترات متاحة في هذا اليوم</p>
                  </div>
                ) : (
                  availableSlots.map((slot) => (
                    <BookingSlot
                      key={slot.slotId}
                      slotId={slot.slotId}
                      label={slot.label}
                      start={slot.start}
                      end={slot.end}
                      price={slot.price}
                      status={slot.status}
                      disabled={bookingLoading || slot.status !== 'available'}
                      onBook={handleBookSlot}
                    />
                  ))
                )}
              </div>
            )}
          </Card>

          {/* Messages */}
          {error && (
            <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
              <p className="text-danger-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-200">
              <p className="text-secondary-700 text-sm">{success}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => router.push('/my-bookings')}
              >
                عرض حجوزاتي
              </Button>
            </div>
          )}

          {/* Share & Actions */}
          <Card>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('تم نسخ الرابط')
                }}
              >
                <Share2 className="h-5 w-5 ml-2" />
                مشاركة الملعب
              </Button>
              
              <Button
                variant="ghost"
                fullWidth
                onClick={() => router.push('/fields')}
              >
                تصفح ملاعب أخرى
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
