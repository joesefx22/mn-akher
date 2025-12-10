import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  showPasswordToggle?: boolean
  isPasswordVisible?: boolean
  onTogglePassword?: () => void
  containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint,
    fullWidth = true,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    isPasswordVisible = false,
    onTogglePassword,
    className,
    containerClassName,
    type = 'text',
    disabled,
    ...props 
  }, ref) => {
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (isPasswordVisible ? 'text' : 'password')
      : type
    
    return (
      <div className={cn(fullWidth ? 'w-full' : '', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 border rounded-xl',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'transition-all duration-200 placeholder:text-gray-400',
              leftIcon ? 'pl-10' : '',
              rightIcon || showPasswordToggle ? 'pr-10' : '',
              error 
                ? 'border-danger-500 focus:ring-danger-500/50' 
                : 'border-gray-300 focus:ring-primary-500/50 focus:border-primary-500',
              disabled && 'bg-gray-100 cursor-not-allowed text-gray-500',
              className
            )}
            {...props}
          />
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={isPasswordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
          
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-danger-500" />
            </div>
          )}
        </div>
        
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500">
            {hint}
          </p>
        )}
        
        {error && (
          <p className="mt-1.5 text-sm text-danger-600 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
