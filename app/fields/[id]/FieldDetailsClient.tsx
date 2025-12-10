'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  Share2,
  Heart,
  Shield,
  CreditCard,
  X,
  Loader2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import BookingSlot from '@/components/features/BookingSlot';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, calculateDeposit } from '@/lib/helpers';

interface FieldDetails {
  id: string;
  name: string;
  type: 'SOCCER' | 'PADEL';
  pricePerHour: number;
  location: string;
  image?: string;
  phone?: string;
  description?: string;
  openHour: string;
  closeHour: string;
  activeDays: number[];
  rating?: number;
  reviewCount?: number;
  features?: string[];
  amenities?: string[];
  rules?: string[];
  area: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
}

interface AvailableSlot {
  slotId: string;
  label: string;
  start: string;
  end: string;
  status: 'available' | 'booked' | 'pending' | 'unavailable';
  price: number;
  deposit?: number;
  peakHour?: boolean;
}

interface FieldDetailsClientProps {
  fieldId: string;
  initialField: FieldDetails;
  initialDate: Date;
  quickBook?: boolean;
}

export default function FieldDetailsClient({ 
  fieldId, 
  initialField, 
  initialDate,
  quickBook = false 
}: FieldDetailsClientProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [field, setField] = useState<FieldDetails>(initialField);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const date = new Date(initialDate);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  // UI States
  const [showCalendar, setShowCalendar] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  
  // Quick book effect
  useEffect(() => {
    if (quickBook && user && availableSlots.length > 0) {
      const nextAvailableSlot = availableSlots.find(slot => slot.status === 'available');
      if (nextAvailableSlot) {
        setSelectedSlot(nextAvailableSlot);
        setShowBookingConfirmation(true);
      }
    }
  }, [quickBook, user, availableSlots]);

  // Fetch available slots for selected date
  const fetchAvailableSlots = useCallback(async (date: Date) => {
    if (!fieldId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/fields/details?id=${fieldId}&date=${dateStr}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل تحميل الأوقات المتاحة');
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        setAvailableSlots(data.data.availableSlots || []);
        
        // Update field info if changed
        if (data.data.field) {
          setField(prev => ({ ...prev, ...data.data.field }));
        }
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  }, [fieldId]);

  // Initial fetch
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [fetchAvailableSlots, selectedDate]);

  const handleDateChange = (days: number) => {
    const newDate = days > 0 
      ? addDays(selectedDate, days)
      : subDays(selectedDate, Math.abs(days));
    
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
    fetchAvailableSlots(newDate);
  };

  const handleSelectDate = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
    setShowCalendar(false);
    fetchAvailableSlots(date);
  };

  const handleBookSlot = async (slotId: string) => {
    if (!user) {
      router.push(`/login?redirect=/fields/${fieldId}`);
      return;
    }

    const slot = availableSlots.find(s => s.slotId === slotId);
    if (!slot || slot.status !== 'available') {
      showToast('هذه الفترة غير متاحة للحجز', 'error');
      return;
    }

    setBookingLoading(slotId);
    setError('');
    setSuccess('');

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fieldId,
          date: dateStr,
          slotId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل إنشاء الحجز');
      }

      if (data.data.payUrl) {
        // Redirect to payment
        window.location.href = data.data.payUrl;
      } else {
        setSuccess('تم تأكيد الحجز بنساح!');
        showToast('تم تأكيد الحجز بنساح!', 'success');
        
        // Refresh available slots
        setTimeout(() => {
          fetchAvailableSlots(selectedDate);
          router.push('/my-bookings?success=true');
        }, 1500);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء الحجز';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setBookingLoading(null);
    }
  };

  const handleQuickBook = (slot: AvailableSlot) => {
    if (!user) {
      router.push(`/login?redirect=/fields/${fieldId}`);
      return;
    }
    
    setSelectedSlot(slot);
    setShowBookingConfirmation(true);
  };

  const confirmBooking = () => {
    if (selectedSlot) {
      handleBookSlot(selectedSlot.slotId);
      setShowBookingConfirmation(false);
      setSelectedSlot(null);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: field.name,
        text: field.description || `احجز ${field.name} في ${field.location}`,
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('تم نسخ الرابط', 'success');
    setShowShareModal(false);
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
    showToast(
      favorite ? 'تم إزالة الملعب من المفضلة' : 'تم إضافة الملعب إلى المفضلة',
      'success'
    );
  };

  // Formatting helpers
  const formatDate = (date: Date) => {
    return format(date, 'EEEE، d MMMM', { locale: ar });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[dayIndex];
  };

  const isActiveToday = field.activeDays.includes(selectedDate.getDay());

  // Generate next 7 days for calendar
  const next7Days = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [selectedDate]);

  // Calculate deposit for a slot
  const calculateSlotDeposit = (slot: AvailableSlot) => {
    const slotDateTime = parseISO(`${format(selectedDate, 'yyyy-MM-dd')}T${slot.start}`);
    return calculateDeposit(slot.price, slotDateTime);
  };

  // Peak hours (6 PM - 10 PM)
  const isPeakHour = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 18 && hour <= 22;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/fields')}
            className="gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            العودة للقائمة
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={favorite ? 'text-red-500' : ''}
            >
              <Heart className={`h-5 w-5 ${favorite ? 'fill-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8"
        >
          <Image
            src={field.image || '/images/default-field.jpg'}
            alt={field.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${
                field.type === 'SOCCER' 
                  ? 'bg-blue-500/90' 
                  : 'bg-purple-500/90'
              }`}>
                {field.type === 'SOCCER' ? '⚽ ملعب كرة قدم' : '🎾 ملعب بادل'}
              </span>
              
              {field.rating && (
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {field.rating.toFixed(1)} ({field.reviewCount || 0})
                </span>
              )}
              
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                📍 {field.area.name}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{field.name}</h1>
            <div className="flex items-center gap-2 text-lg opacity-90">
              <MapPin className="h-5 w-5" />
              {field.location}
            </div>
          </div>
          
          {/* Price Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {field.pricePerHour}
                <span className="text-lg text-gray-600"> ج</span>
              </div>
              <div className="text-sm text-gray-600">للساعة</div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Field Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">عن الملعب</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {field.description || 'ملعب رياضي مجهز بأحدث التقنيات يوفر تجربة لعب استثنائية.'}
                </p>
              </Card>
            </motion.div>

            {/* Features & Amenities */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">المميزات والتجهيزات</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Features */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">معلومات أساسية</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="font-medium">ساعات العمل</div>
                          <div className="text-sm text-gray-600">{field.openHour} - {field.closeHour}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="font-medium">أيام العمل</div>
                          <div className="text-sm text-gray-600">
                            {field.activeDays.map(getDayName).join('، ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="font-medium">السعة</div>
                          <div className="text-sm text-gray-600">
                            {field.type === 'SOCCER' ? '5 ضد 5 (صغير)' : '2 ضد 2'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">التجهيزات</h3>
                    <div className="space-y-2">
                      {(field.amenities || [
                        'إضاءة ليلية قوية',
                        'صالة ملابس مجهزة',
                        'دشات ساخنة',
                        'مكان مخصص للمشاهدين',
                        'كافيه ومرطبات',
                        'جراج آمن',
                        'إنترنت عالي السرعة',
                        'إسعافات أولية'
                      ]).map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-secondary-600" />
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Owner Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">معلومات المالك</h2>
                  {field.owner.phone && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `tel:${field.owner.phone}`}
                    >
                      <Phone className="h-5 w-5 ml-2" />
                      اتصل بالمالك
                    </Button>
                  )}
                </div>
                
                <div className="flex items-start gap-6 p-4 bg-gray-50 rounded-xl">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    {field.owner.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{field.owner.name}</h3>
                    <p className="text-gray-600 mb-4">مالك ومشغل الملعب</p>
                    
                    <div className="flex flex-wrap gap-4">
                      {field.owner.email && (
                        <a 
                          href={`mailto:${field.owner.email}`}
                          className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                        >
                          <span className="text-sm">{field.owner.email}</span>
                        </a>
                      )}
                      
                      {field.owner.phone && (
                        <a 
                          href={`tel:${field.owner.phone}`}
                          className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                        >
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{field.owner.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => field.owner.email && window.location.href = `mailto:${field.owner.email}`}
                    >
                      إرسال بريد
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRulesModal(true)}
                    >
                      شروط الاستخدام
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-8">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 shadow-lg sticky top-6">
                {/* Date Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">اختر تاريخ</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      {showCalendar ? 'إخفاء' : 'عرض التقويم'}
                      <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                  
                  {/* Quick Date Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateChange(-1)}
                      disabled={!isActiveToday}
                    >
                      <ChevronRight className="h-4 w-4" />
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
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Calendar */}
                  <AnimatePresence>
                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-7 gap-2 p-3 bg-gray-50 rounded-lg mt-3">
                          {['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'].map((day, i) => (
                            <div key={i} className="text-center text-sm text-gray-500 font-medium">
                              {day}
                            </div>
                          ))}
                          
                          {next7Days.map((date) => {
                            const isToday = isSameDay(date, new Date());
                            const isSelected = isSameDay(date, selectedDate);
                            const isActive = field.activeDays.includes(date.getDay());
                            
                            return (
                              <button
                                key={date.toISOString()}
                                onClick={() => isActive && handleSelectDate(date)}
                                disabled={!isActive}
                                className={`
                                  h-10 rounded-lg text-sm font-medium transition-all
                                  ${isSelected
                                    ? 'bg-primary-600 text-white'
                                    : isToday
                                    ? 'bg-primary-100 text-primary-700'
                                    : isActive
                                    ? 'bg-white text-gray-700 hover:bg-gray-100'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }
                                `}
                              >
                                {format(date, 'd')}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Available Slots */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">الأوقات المتاحة</h3>
                  
                  {!isActiveToday ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                      <p className="text-yellow-700">الملعب غير متاح في هذا اليوم</p>
                    </div>
                  ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-3" />
                      <p className="text-gray-600">جاري تحميل الأوقات...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">لا توجد أوقات متاحة في هذا اليوم</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleDateChange(1)}
                      >
                        جرب اليوم التالي
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {availableSlots.map((slot) => {
                        const deposit = calculateSlotDeposit(slot);
                        const isPeak = isPeakHour(slot.start);
                        
                        return (
                          <BookingSlot
                            key={slot.slotId}
                            slotId={slot.slotId}
                            label={slot.label}
                            start={slot.start}
                            end={slot.end}
                            price={slot.price}
                            deposit={deposit}
                            status={slot.status}
                            peakHour={isPeak}
                            loading={bookingLoading === slot.slotId}
                            onBook={() => handleQuickBook(slot)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
                        <p className="text-danger-700 text-sm">{error}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
                        <p className="text-secondary-700 text-sm">{success}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Security Info */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-secondary-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">حجز آمن</div>
                      <div className="text-xs text-gray-600">دفع آمن مع ضمان استرداد الأموال</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* Deposit Info */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">معلومات الدفع</h4>
                    <p className="text-sm text-gray-600">
                      دفع وديعة مطلوب للحجز قبل 24 ساعة. الدفع عبر بطاقات الائتمان أو فوري.
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Quick Actions */}
              <Card className="p-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => router.push('/fields')}
                  >
                    تصفح ملاعب أخرى
                  </Button>
                  
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    العودة للأعلى
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showBookingConfirmation}
        onClose={() => {
          setShowBookingConfirmation(false);
          setSelectedSlot(null);
        }}
        title="تأكيد الحجز"
      >
        {selectedSlot && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">تفاصيل الحجز</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت:</span>
                  <span className="font-medium">{selectedSlot.start} - {selectedSlot.end}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">السعر:</span>
                  <span className="font-medium">{formatCurrency(selectedSlot.price)}</span>
                </div>
                {calculateSlotDeposit(selectedSlot) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الوديعة:</span>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(calculateSlotDeposit(selectedSlot))}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>المجموع:</span>
                    <span>
                      {formatCurrency(selectedSlot.price + calculateSlotDeposit(selectedSlot))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={confirmBooking}
                loading={bookingLoading === selectedSlot.slotId}
              >
                تأكيد الحجز والدفع
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowBookingConfirmation(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="مشاركة الملعب"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            شارك هذا الملعب مع أصدقائك
          </p>
          
          <div className="space-y-3">
            <Button fullWidth onClick={copyLink}>
              نسخ رابط الملعب
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(`${field.name} - ${window.location.href}`)}`, '_blank');
                setShowShareModal(false);
              }}
            >
              مشاركة عبر WhatsApp
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${field.name} - ${window.location.href}`)}`, '_blank');
                setShowShareModal(false);
              }}
            >
              مشاركة على Twitter
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="شروط الاستخدام"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            يرجى الالتزام بالشروط التالية عند استخدام الملعب:
          </p>
          
          <ul className="space-y-2 text-sm">
            {(field.rules || [
              'الحضور قبل وقت الحجز بـ 15 دقيقة على الأقل',
              'إحضار بطاقة الهوية الشخصية',
              'الالتزام بموعد نهاية الحجز المحدد',
              'المحافظة على نظافة الملعب والتجهيزات',
              'عدم التدخين داخل الملعب',
              'احترام اللاعبين الآخرين والموظفين',
              'دفع أي أضرار تحدث للملعب أو تجهيزاته',
              'إلغاء الحجز قبل 24 ساعة للحصول على استرداد كامل'
            ]).map((rule, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-secondary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{rule}</span>
              </li>
            ))}
          </ul>
          
          <Button
            fullWidth
            onClick={() => setShowRulesModal(false)}
            className="mt-4"
          >
            فهمت الشروط
          </Button>
        </div>
      </Modal>
    </div>
  );
}
