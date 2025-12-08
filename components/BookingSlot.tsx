import { Clock, Check, X, AlertCircle, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'

interface BookingSlotProps {
  slotId: string
  label: string
  start: string
  end: string
  price: number
  status: 'available' | 'booked' | 'pending' | 'cancelled'
  disabled?: boolean
  onBook?: (slotId: string) => void
  onCancel?: (slotId: string) => void
}

export default function BookingSlot({
  slotId,
  label,
  start,
  end,
  price,
  status,
  disabled = false,
  onBook,
  onCancel
}: BookingSlotProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          icon: <Clock className="h-5 w-5" />,
          buttonVariant: 'primary' as const,
          buttonText: 'احجز الآن'
        }
      case 'booked':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          icon: <X className="h-5 w-5" />,
          buttonVariant: 'danger' as const,
          buttonText: 'محجوز'
        }
      case 'pending':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          icon: <AlertCircle className="h-5 w-5" />,
          buttonVariant: 'secondary' as const,
          buttonText: 'بانتظار الدفع'
        }
      case 'cancelled':
        return {
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-600',
          icon: <X className="h-5 w-5" />,
          buttonVariant: 'ghost' as const,
          buttonText: 'ملغى'
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          icon: <Clock className="h-5 w-5" />,
          buttonVariant: 'outline' as const,
          buttonText: 'غير متاح'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`
      ${config.bgColor} 
      ${config.borderColor}
      border rounded-xl p-4
      transition-all duration-200
      hover:shadow-md
      ${status === 'available' && !disabled ? 'cursor-pointer hover:border-green-300' : ''}
    `}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            {config.icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{label}</h4>
            <p className="text-sm text-gray-600">
              {start} - {end}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{price} ج</div>
          <div className="text-sm text-gray-500">للساعة</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 ${config.textColor}`}>
          {config.icon}
          <span className="text-sm font-medium">
            {status === 'available' && 'متاح'}
            {status === 'booked' && 'محجوز'}
            {status === 'pending' && 'بانتظار الدفع'}
            {status === 'cancelled' && 'ملغى'}
          </span>
        </div>

        <div className="flex gap-2">
          {status === 'available' && onBook && (
            <Button
              size="sm"
              variant={config.buttonVariant}
              onClick={() => onBook(slotId)}
              disabled={disabled}
              className="min-w-[100px]"
            >
              {config.buttonText}
            </Button>
          )}
          
          {status === 'booked' && onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(slotId)}
              disabled={disabled}
              className="min-w-[100px]"
            >
              إلغاء
            </Button>
          )}
          
          {status === 'pending' && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = `/payments/${slotId}`}
                className="min-w-[100px]"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                ادفع الآن
              </Button>
              {onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCancel(slotId)}
                  disabled={disabled}
                >
                  إلغاء
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
