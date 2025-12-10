'use client'

import { useState } from 'react'
import { 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  CreditCard,
  Lock,
  Calendar,
  UserCheck
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface BookingSlotProps {
  slotId: string
  label: string
  start: string
  end: string
  price: number
  status: 'available' | 'booked' | 'pending' | 'cancelled' | 'unavailable'
  isPeakHours?: boolean
  peakPrice?: number
  disabled?: boolean
  isLoading?: boolean
  userBooked?: boolean
  onBook?: (slotId: string) => Promise<void> | void
  onCancel?: (slotId: string) => Promise<void> | void
  onPay?: (slotId: string) => Promise<void> | void
  className?: string
}

export default function BookingSlot({
  slotId,
  label,
  start,
  end,
  price,
  status,
  isPeakHours = false,
  peakPrice,
  disabled = false,
  isLoading = false,
  userBooked = false,
  onBook,
  onCancel,
  onPay,
  className
}: BookingSlotProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const getStatusConfig = () => {
    const baseConfig = {
      available: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        hoverBorderColor: 'hover:border-green-300',
        textColor: 'text-green-700',
        icon: <Clock className="h-5 w-5" />,
        iconBg: 'bg-green-100',
        buttonVariant: 'primary' as const,
        buttonText: 'احجز الآن',
        description: 'مازال متاحاً'
      },
      booked: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        hoverBorderColor: '',
        textColor: 'text-red-700',
        icon: <X className="h-5 w-5" />,
        iconBg: 'bg-red-100',
        buttonVariant: 'danger' as const,
        buttonText: 'محجوز',
        description: userBooked ? 'محجوز بواسطتك' : 'محجوز بواسطة لاعب آخر'
      },
      pending: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        hoverBorderColor: '',
        textColor: 'text-yellow-700',
        icon: <AlertCircle className="h-5 w-5" />,
        iconBg: 'bg-yellow-100',
        buttonVariant: 'warning' as const,
        buttonText: 'بانتظار الدفع',
        description: 'ينتظر إتمام عملية الدفع'
      },
      cancelled: {
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        hoverBorderColor: '',
        textColor: 'text-gray-600',
        icon: <X className="h-5 w-5" />,
        iconBg: 'bg-gray-200',
        buttonVariant: 'ghost' as const,
        buttonText: 'ملغى',
        description: 'تم إلغاء الحجز'
      },
      unavailable: {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        hoverBorderColor: '',
        textColor: 'text-gray-500',
        icon: <Lock className="h-5 w-5" />,
        iconBg: 'bg-gray-200',
        buttonVariant: 'ghost' as const,
        buttonText: 'غير متاح',
        description: 'غير متاح للحجز'
      }
    }

    return baseConfig[status]
  }

  const config = getStatusConfig()

  const handleAction = async (action: 'book' | 'cancel' | 'pay') => {
    if (disabled || isLoading || isProcessing) return
    
    setIsProcessing(true)
    try {
      switch (action) {
        case 'book':
          onBook && await onBook(slotId)
          break
        case 'cancel':
          onCancel && await onCancel(slotId)
          break
        case 'pay':
          onPay && await onPay(slotId)
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const finalPrice = isPeakHours && peakPrice ? peakPrice : price
  const displayPrice = formatCurrency(finalPrice)

  return (
    <div className={cn(
      config.bgColor,
      config.borderColor,
      config.hoverBorderColor,
      "border rounded-2xl p-5",
      "transition-all duration-200",
      status === 'available' && !disabled && "hover:shadow-md",
      (isLoading || isProcessing) && "opacity-70",
      className
    )}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "p-2.5 rounded-xl",
            config.iconBg,
            config.textColor
          )}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 truncate">{label}</h4>
              {isPeakHours && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  ساعة ذروة
                </span>
              )}
              {userBooked && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  حجزك
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{start} - {end}</span>
              {userBooked && (
                <>
                  <span className="text-gray-400">•</span>
                  <UserCheck className="h-3.5 w-3.5" />
                  <span className="text-primary-600">محجوز لك</span>
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900">{displayPrice}</div>
          <div className="text-sm text-gray-500">للساعة</div>
          {isPeakHours && peakPrice && (
            <div className="text-xs text-danger-500 line-through mt-0.5">
              {formatCurrency(price)}
            </div>
          )}
        </div>
      </div>

      {/* Status & Description */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "flex items-center gap-2",
          config.textColor
        )}>
          {config.icon}
          <span className="font-medium">
            {config.description}
          </span>
        </div>

        {/* Deposit Info */}
        {status === 'available' && (
          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
            وديعة: {formatCurrency(finalPrice * 0.3)}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        {status === 'available' && onBook && (
          <Button
            size="md"
            variant={config.buttonVariant}
            onClick={() => handleAction('book')}
            disabled={disabled || isLoading || isProcessing}
            loading={isLoading || isProcessing}
            leftIcon={<Calendar className="h-4 w-4" />}
            className="min-w-[140px] justify-center"
          >
            {config.buttonText}
          </Button>
        )}
        
        {status === 'booked' && userBooked && onCancel && (
          <Button
            size="md"
            variant="outline"
            onClick={() => handleAction('cancel')}
            disabled={disabled || isLoading || isProcessing}
            loading={isLoading || isProcessing}
            leftIcon={<X className="h-4 w-4" />}
            className="min-w-[140px] justify-center"
          >
            إلغاء الحجز
          </Button>
        )}
        
        {status === 'pending' && userBooked && (
          <div className="flex gap-2">
            {onPay && (
              <Button
                size="md"
                variant="primary"
                onClick={() => handleAction('pay')}
                disabled={disabled || isLoading || isProcessing}
                loading={isLoading || isProcessing}
                leftIcon={<CreditCard className="h-4 w-4" />}
                className="min-w-[140px] justify-center"
              >
                ادفع الآن
              </Button>
            )}
            {onCancel && (
              <Button
                size="md"
                variant="outline"
                onClick={() => handleAction('cancel')}
                disabled={disabled || isLoading || isProcessing}
                loading={isLoading || isProcessing}
              >
                إلغاء
              </Button>
            )}
          </div>
        )}
        
        {status === 'pending' && !userBooked && (
          <div className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg">
            ⏳ قيد الانتظار...
          </div>
        )}
        
        {(status === 'cancelled' || status === 'unavailable') && (
          <div className="text-sm text-gray-500 italic">
            {status === 'cancelled' ? 'تم إلغاء هذا الحجز' : 'غير متاح للحجز حالياً'}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {status === 'available' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 flex justify-between">
            <span>⚡ تأكيد فوري</span>
            <span>🔒 حجز آمن</span>
            <span>💳 دفع إلكتروني</span>
          </div>
        </div>
      )}
    </div>
  )
}
