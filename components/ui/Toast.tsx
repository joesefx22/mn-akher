'use client'

import { useEffect, useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  X 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
  onClose: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showProgress?: boolean
}

export default function Toast({ 
  type, 
  message, 
  description,
  duration = 5000,
  onClose,
  position = 'top-right',
  showProgress = true
}: ToastProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  
  useEffect(() => {
    if (!duration || !showProgress) return
    
    const interval = 10
    const totalSteps = duration / interval
    const decrement = 100 / totalSteps
    
    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            onClose()
            return 0
          }
          return prev - decrement
        })
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [duration, onClose, showProgress, isPaused])
  
  const config = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      progress: 'bg-green-500'
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      progress: 'bg-red-500'
    },
    warning: {
      icon: <AlertCircle className="h-5 w-5" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      progress: 'bg-yellow-500'
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      progress: 'bg-blue-500'
    }
  }
  
  const { icon, bg, border, text, progress: progressColor } = config[type]
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  
  return (
    <div 
      className={cn(
        "fixed z-[9999] w-full max-w-sm animate-slide-up",
        positionClasses[position]
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn(
        "relative rounded-xl border shadow-lg overflow-hidden",
        bg,
        border,
        text
      )}>
        {/* Progress Bar */}
        {showProgress && duration && (
          <div 
            className={cn(
              "h-1 absolute top-0 left-0 transition-all duration-100",
              progressColor
            )}
            style={{ width: `${progress}%` }}
          />
        )}
        
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium">{message}</p>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded p-1 hover:opacity-70 transition-opacity"
            aria-label="إغلاق الإشعار"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
