'use client'
import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

type Props = {
  id: string
  name: string
  pricePerHour: number
  areaName?: string
}

export default function FieldCard({ id, name, pricePerHour, areaName }: Props) {
  const router = useRouter()
  const { user } = useAuth()

  const handleBook = () => {
    if (!user) {
      router.push(`/login?redirect=/fields/${id}`)
      return
    }
    router.push(`/fields/${id}`)
  }

  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{areaName}</p>
      <p>{pricePerHour} جنيه / ساعة</p>
      <div className="flex gap-2">
        <button onClick={handleBook}>احجز الآن</button>
        <Link href={`/fields/${id}`}><button>تفاصيل</button></Link>
      </div>
    </div>
  )
}
// أضف imports:
'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// أضف في بداية المكون:
const router = useRouter()
const { user } = useAuth()

// عدل دالة handleView:
const handleView = () => {
  if (onView) onView(id)
  router.push(`/fields/${id}`)
}

// عدل زر "احجز الآن":
<Button 
  variant="outline"
  fullWidth
  className="justify-center"
  onClick={() => {
    if (!user) {
      router.push(`/login?redirect=/fields/${id}`)
    } else {
      router.push(`/fields/${id}?book=true`)
    }
  }}
>
  احجز الآن
</Button>
    // أضف في أعلى الملف
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// في دالة handleView أضف:
const { user } = useAuth()
const router = useRouter()

const handleView = () => {
  if (onView) onView(id)
  router.push(`/fields/${id}`)
}

// في زر "احجز الآن" أضف:
<Button 
  variant="outline"
  fullWidth
  className="justify-center"
  onClick={() => {
    if (!user) {
      router.push(`/login?redirect=/fields/${id}`)
    } else {
      router.push(`/fields/${id}?book=true`)
    }
  }}
>
  احجز الآن
</Button>
    
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users, Star } from 'lucide-react'
import Button from '@/components/ui/Button'

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
  onView?: (id: string) => void
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
  onView
}: FieldCardProps) {
  const handleView = () => {
    if (onView) onView(id)
  }

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${type === 'SOCCER' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
            {type === 'SOCCER' ? 'كرة قدم' : 'بادل'}
          </span>
        </div>

        {/* Price */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-lg font-bold text-gray-900">{pricePerHour} ج</span>
          <span className="text-sm text-gray-600">/ ساعة</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{areaName}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm truncate">{location}</span>
            </div>
          </div>

          {/* Rating */}
          {reviewsCount > 0 && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-xs text-gray-500">({reviewsCount})</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-xs text-gray-700">24/7</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
            <Users className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-xs text-gray-700">5 ضد 5</span>
          </div>
          
          <div className="px-2.5 py-1 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-700">إضاءة ليلية</span>
          </div>
          
          <div className="px-2.5 py-1 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-700">مظلات</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/fields/${id}`} className="flex-1">
            <Button 
              fullWidth
              onClick={handleView}
              className="justify-center"
            >
              عرض التفاصيل
            </Button>
          </Link>
          
          <Link href={`/fields/${id}?book=true`} className="flex-1">
            <Button 
              variant="outline"
              fullWidth
              className="justify-center"
            >
              احجز الآن
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
