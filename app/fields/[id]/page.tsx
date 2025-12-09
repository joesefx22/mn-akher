"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FieldDetails({ params }: { params: { id: string } }) {
  const fieldId = params.id;
  const router = useRouter();

  const [field, setField] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchField = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fields/details?id=${fieldId}`, { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.msg || "فشل التحميل");
      setField(j.data.field);
      // Generate example slots (server should provide real schedule)
      const generated = [1,2,3,4].map(i => {
        const d = new Date(Date.now() + i*3600*1000);
        return d.toISOString();
      });
      setSlots(generated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchField();
  }, [fieldId]);

  const handleBook = async (slotISO: string) => {
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldId, date: slotISO.split("T")[0], startTime: slotISO.split("T")[1].slice(0,5), endTime: "" })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || j.msg || "حجز فشل");
      // if response contains paymentUrl redirect
      if (j.data?.paymentUrl) {
        window.location.href = j.data.paymentUrl;
        return;
      }
      // else go to my bookings
      router.push("/my-bookings");
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء الحجز");
    }
  };

  if (loading) return <div className="p-6">جارٍ التحميل…</div>;
  if (error) return <div className="p-6 text-red-600">خطأ: {error}</div>;
  if (!field) return <div className="p-6">الملعب غير موجود</div>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{field.name}</h1>
      <p>{field.description}</p>
      <p className="font-bold">{field.pricePerHour} ج.م / ساعة</p>

      <section>
        <h2 className="text-lg font-semibold">الأوقات المتاحة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {slots.map((s) => (
            <div key={s} className="p-3 rounded border bg-white flex justify-between items-center">
              <div>{new Date(s).toLocaleString()}</div>
              <button className="px-3 py-1 bg-primary text-white rounded" onClick={() => handleBook(s)}>احجز الآن</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BookingSlot from '@/components/features/BookingSlot'
import { useAuth } from '@/app/contexts/AuthContext'

export default function FieldDetails({ params }: { params: { id: string } }) {
  const [field, setField] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const id = (params as any).id

  useEffect(() => {
    fetchField()
  }, [id])

  const fetchField = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fields/details?id=${id}`, { credentials: 'include' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.msg || 'Failed')
      setField(j.data.field)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (slotStart: string) => {
    if (!user) {
      router.push(`/login?redirect=/fields/${id}`)
      return
    }
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fieldId: id, date: slotStart })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.msg || 'Booking failed')
      if (data.data.payment) {
        // redirect to payment
        const payRes = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ bookingId: data.data.booking.id })
        })
        const payData = await payRes.json()
        if (payRes.ok && payData.data.paymentUrl) {
          window.location.href = payData.data.paymentUrl
          return
        }
      }
      alert('تم الحجز بنجاح')
      fetchField()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div>جارٍ التحميل...</div>
  if (error) return <div>خطأ: {error}</div>
  if (!field) return <div>الملعب غير موجود</div>

  // a simple set of slots stubbed
  const slots = [0,1,2,3].map(i => new Date(Date.now() + (i+1)*3600*1000).toISOString())

  return (
    <div>
      <h1>{field.name}</h1>
      <p>{field.description}</p>
      <h3>الأوقات المتاحة</h3>
      <div>
        {slots.map(s => (
          <BookingSlot key={s} slotStart={s} onBook={() => handleBook(s)} />
        ))}
      </div>
    </div>
  )
}
// الخطأ الشائع: مفيش credentials
const response = await fetch(`/api/fields/details?id=${fieldId}`)
// الصح:
const response = await fetch(`/api/fields/details?id=${fieldId}`, {
  credentials: 'include' // عشان يبعت الـ cookies
})

// الخطأ الشائع: مفيش error handling
const data = await response.json()
setField(data.field)
// الصح:
if (!response.ok) {
  const error = await response.json()
  throw new Error(error.message)
}
const data = await response.json()
if (data.status === 'success') {
  setField(data.data.field)
} else {
  throw new Error(data.message)
}
// في دالة handleBookSlot:
const handleBookSlot = async (slotId: string) => {
  if (!user) {
    router.push(`/login?redirect=/fields/${fieldId}`)
    return
  }

  setBookingLoading(true)
  setError('')
  
  try {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldId, date: dateStr, slotId })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create booking')
    }

    // 🔥 هنا الفرق: إذا في payment لازم نوجه للدفع
    if (data.data.payUrl || data.data.payment) {
      // إنشاء جلسة دفع
      const paymentRes = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data.data.booking.id })
      })
      
      const paymentData = await paymentRes.json()
      
      if (paymentRes.ok && paymentData.data.mockPaymentUrl) {
        // للـ MVP: توجيه للدفع الوهمي
        window.location.href = paymentData.data.mockPaymentUrl
      } else {
        // في الإنتاج: توجيه لـ Paymob
        // window.location.href = paymentData.data.paymobIframeUrl
        setSuccess('تم إنشاء الحجز. يرجى إكمال الدفع.')
      }
    } else {
      setSuccess('تم تأكيد الحجز بنجاح!')
      fetchFieldDetails(selectedDate)
    }

  } catch (err: any) {
    setError(err.message)
  } finally {
    setBookingLoading(false)
  }
}// في دالة fetchFieldDetails أضف error handling:
const fetchFieldDetails = async (date?: Date) => {
  setLoading(true)
  setError('')
  
  try {
    const dateStr = format(date || selectedDate, 'yyyy-MM-dd')
    const response = await fetch(`/api/fields/details?id=${fieldId}&date=${dateStr}`)
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to load field details')
    }
    
    const data = await response.json()
    
    // Validate response structure
    if (!data.data || !data.data.field) {
      throw new Error('Invalid data structure')
    }
    
    setField(data.data.field)
    setAvailableSlots(data.data.availableSlots || [])
    
  } catch (err: any) {
    setError(err.message || 'An unexpected error occurred')
    console.error('Fetch error:', err)
  } finally {
    setLoading(false)
  }
}

// في دالة handleBookSlot أضف validation:
const handleBookSlot = async (slotId: string) => {
  if (!user) {
    router.push(`/login?redirect=/fields/${fieldId}`)
    return
  }

  const selectedSlot = availableSlots.find(slot => slot.slotId === slotId)
  if (!selectedSlot || selectedSlot.status !== 'available') {
    setError('This slot is no longer available')
    return
  }

  // Disable all buttons during booking
  setBookingLoading(true)
  setError('')
  setSuccess('')
}
// أضف imports
import { useAuth } from '@/context/AuthContext'

// في fetchFieldDetails أضف error handling
const fetchFieldDetails = async (date?: Date) => {
  setLoading(true)
  setError('')
  
  try {
    const dateStr = format(date || selectedDate, 'yyyy-MM-dd')
    const response = await fetch(`/api/fields/details?id=${fieldId}&date=${dateStr}`)
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'فشل تحميل التفاصيل')
    }
    
    const data = await response.json()
    
    // التحقق من البيانات
    if (!data.data || !data.data.field) {
      throw new Error('بيانات غير صالحة')
    }
    
    setField(data.data.field)
    setAvailableSlots(data.data.availableSlots || [])
    
  } catch (err: any) {
    setError(err.message || 'حدث خطأ غير متوقع')
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
}
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
