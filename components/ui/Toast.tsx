'use client'

import { ReactNode, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  const config = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800'
    },
    error: {
      icon: <XCircle className="h-5 w-5" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800'
    },
    warning: {
      icon: <AlertCircle className="h-5 w-5" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800'
    },
    info: {
      icon: <AlertCircle className="h-5 w-5" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800'
    }
  }
  
  const { icon, bg, border, text } = config[type]
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bg} ${border} ${text} flex items-center gap-3 rounded-lg border p-4 shadow-lg`}>
        {icon}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
