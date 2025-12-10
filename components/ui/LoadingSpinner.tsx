import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className,
  ...props 
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  }
  
  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-gray-200 border-t-white',
    gray: 'border-gray-200 border-t-gray-600'
  }
  
  const spinner = (
    <div className={cn(
      "animate-spin rounded-full",
      sizeClasses[size],
      colorClasses[color],
      className
    )} 
    {...props} 
    />
  )
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
        {text && (
          <p className="mt-4 text-gray-600 font-medium">{text}</p>
        )}
      </div>
    )
  }
  
  if (text) {
    return (
      <div className="flex flex-col items-center justify-center">
        {spinner}
        <p className="mt-3 text-sm text-gray-600">{text}</p>
      </div>
    )
  }
  
  return spinner
}
