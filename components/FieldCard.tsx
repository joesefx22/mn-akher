'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart,
  Eye,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface FieldCardProps {
  id: string
  name: string
  image: string
  type: 'SOCCER' | 'PADEL'
  pricePerHour: number
  location: string
  areaName: string
  rating?: number
  reviewsCount?: number
  isOpen24h?: boolean
  playersCount?: number
  features?: string[]
  isFeatured?: boolean
  discount?: number
  onView?: (id: string) => void
  onFavorite?: (id: string) => void
  className?: string
}

export default function FieldCard({
  id,
  name,
  image,
  type,
  pricePerHour,
  location,
  areaName,
  rating = 4.5,
  reviewsCount = 0,
  isOpen24h = true,
  playersCount = 10,
  features = [],
  isFeatured = false,
  discount = 0,
  onView,
  onFavorite,
  className
}: FieldCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleView = () => {
    if (onView) onView(id)
    router.push(`/fields/${id}`)
  }

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push(`/login?redirect=/fields/${id}&message=يجب تسجيل الدخول للحجز`)
      return
    }

    setIsLoading(true)
    router.push(`/fields/${id}?book=true`)
    
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      router.push(`/login?redirect=/fields/${id}&message=يجب تسجيل الدخول لإضافة للمفضلة`)
      return
    }
    
    setIsFavorite(!isFavorite)
    if (onFavorite) onFavorite(id)
  }

  const typeConfig = {
    SOCCER: {
      label: 'كرة قدم',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      icon: '⚽'
    },
    PADEL: {
      label: 'بادل',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      icon: '🎾'
    }
  }

  const currentType = typeConfig[type]

  return (
    <div className={cn(
      "group relative bg-white rounded-2xl border border-gray-200 overflow-hidden",
      "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
      isFeatured && "ring-2 ring-primary-500 ring-offset-2",
      className
    )}>
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full shadow-lg">
            مميز ✨
          </span>
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 bg-gradient-to-r from-danger-500 to-danger-600 text-white text-xs font-bold rounded-full shadow-lg">
            خصم {discount}%
          </span>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110"
        aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-colors",
            isFavorite 
              ? "text-danger-500 fill-current" 
              : "text-gray-400 hover:text-danger-500"
          )} 
        />
      </button>

      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <Link href={`/fields/${id}`}>
          <Image
            src={image || '/images/field-default.jpg'}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={isFeatured}
          />
        </Link>
        
        {/* Type Badge */}
        <div className="absolute bottom-4 left-4">
          <span className={cn(
            "px-4 py-2 rounded-xl text-white font-medium text-sm shadow-lg",
            `bg-gradient-to-r ${currentType.gradient}`
          )}>
            {currentType.icon} {currentType.label}
          </span>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{pricePerHour}</span>
            <span className="text-gray-600 text-sm">ج</span>
            <span className="text-gray-500 text-sm mr-1">/ ساعة</span>
          </div>
          {discount > 0 && (
            <div className="text-xs text-danger-500 line-through mt-0.5">
              {Math.round(pricePerHour / (1 - discount/100))} ج
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Name & Rating */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <Link href={`/fields/${id}`}>
              <h3 className="text-xl font-bold text-gray-900 truncate hover:text-primary-600 transition-colors">
                {name}
              </h3>
            </Link>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{areaName}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm truncate">{location}</span>
            </div>
          </div>

          {/* Rating */}
          {reviewsCount > 0 && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl flex-shrink-0">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-bold">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({reviewsCount})</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {isOpen24h ? 'مفتوح 24/7' : 'محدد الساعات'}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {playersCount} لاعب
            </span>
          </div>
          
          {features.slice(0, 2).map((feature, index) => (
            <div 
              key={index}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg"
            >
              <span className="text-xs font-medium">{feature}</span>
            </div>
          ))}
          
          {features.length > 2 && (
            <div className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg">
              <span className="text-xs font-medium">+{features.length - 2} أكثر</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/fields/${id}`} className="flex-1">
            <Button 
              fullWidth
              variant="outline"
              onClick={handleView}
              leftIcon={<Eye className="h-4 w-4" />}
              className="justify-center"
            >
              التفاصيل
            </Button>
          </Link>
          
          <div className="flex-1">
            <Button 
              fullWidth
              variant="primary"
              onClick={handleBook}
              loading={isLoading}
              disabled={isLoading}
              leftIcon={<Calendar className="h-4 w-4" />}
              className="justify-center"
            >
              احجز الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
