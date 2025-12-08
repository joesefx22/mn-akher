import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div className={`
      bg-white rounded-xl border border-gray-200
      ${paddings[padding]}
      ${hover ? 'hover:shadow-lg transition-shadow duration-300 cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
