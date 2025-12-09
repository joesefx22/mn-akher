import React from "react";

export const revalidate = 60; // cache for 60s

export default async function FieldsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const res = await fetch(`${apiUrl}/fields/list`, { cache: "no-store" });
  if (!res.ok) {
    return <div className="p-6">فشل تحميل الملاعب</div>;
  }
  const j = await res.json();
  const fields = j.data?.fields ?? [];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">قائمة الملاعب</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((f: any) => (
          <div key={f.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">{f.name}</h2>
            <p className="text-sm text-gray-600">{f.description}</p>
            <p className="mt-2 font-bold">{f.pricePerHour} ج.م / ساعة</p>
            <a href={`/fields/${f.id}`} className="text-blue-600 underline mt-3 inline-block">عرض الملعب</a>
          </div>
        ))}
      </div>
    </main>
  );
}
import React from 'react'
import { cookies } from 'next/headers'

export const revalidate = 60

export default async function FieldsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'}/api/fields/list`, { cache: 'no-store' })
  const json = await res.json()
  const fields = json?.data?.fields || []

  return (
    <main>
      <h1>قائمة الملاعب</h1>
      <div className="grid">
        {fields.map((f: any) => (
          <div key={f.id} className="card">
            <h3>{f.name}</h3>
            <p>{f.description}</p>
            <a href={`/fields/${f.id}`}>عرض</a>
          </div>
        ))}
      </div>
    </main>
  )
}
// في دالة fetchFields أضف validation:
const fetchFields = async (page = 1) => {
  setLoading(true)
  setError('')
  
  try {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (fieldType !== 'ALL') params.set('type', fieldType)
    if (area !== 'ALL') params.set('areaId', area)
    params.set('page', page.toString())
    params.set('limit', '12')
    
    const response = await fetch(`/api/fields/list?${params}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load fields')
    }
    
    // Validate response
    if (!data.data || !Array.isArray(data.data.fields)) {
      throw new Error('Invalid response format')
    }
    
    setFields(data.data.fields)
    setPagination(data.data.pagination || {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    })
    
  } catch (err: any) {
    setError(err.message)
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
}
  'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react'
import FieldCard from '@/components/FieldCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Field {
  id: string
  name: string
  image: string
  type: 'SOCCER' | 'PADEL'
  pricePerHour: number
  location: string
  area: {
    name: string
  }
  owner: {
    name: string
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function FieldsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [fields, setFields] = useState<Field[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [fieldType, setFieldType] = useState<'SOCCER' | 'PADEL' | 'ALL'>(
    (searchParams.get('type') as 'SOCCER' | 'PADEL') || 'ALL'
  )
  const [area, setArea] = useState(searchParams.get('area') || 'ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Areas from seed (would come from API in production)
  const areas = [
    { id: 'ALL', name: 'جميع المناطق' },
    { id: 'المقطم', name: 'المقطم' },
    { id: 'الهضبة الوسطي', name: 'الهضبة الوسطي' },
    { id: 'مدينة نصر', name: 'مدينة نصر' },
    { id: 'الشروق', name: 'الشروق' },
    { id: 'العبور', name: 'العبور' }
  ]

  const fetchFields = async (page = 1) => {
    setLoading(true)
    setError('')
    
    try {
      // Build query params
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (fieldType !== 'ALL') params.set('type', fieldType)
      if (area !== 'ALL') params.set('areaId', area)
      params.set('page', page.toString())
      params.set('limit', '12')
      
      const response = await fetch(`/api/fields/list?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل تحميل الملاعب')
      }
      
      setFields(data.data.fields)
      setPagination(data.data.pagination)
      
      // Update URL without refresh
      const newParams = new URLSearchParams(searchParams)
      if (search) newParams.set('q', search)
      else newParams.delete('q')
      
      if (fieldType !== 'ALL') newParams.set('type', fieldType)
      else newParams.delete('type')
      
      if (area !== 'ALL') newParams.set('area', area)
      else newParams.delete('area')
      
      router.replace(`/fields?${newParams.toString()}`, { scroll: false })
      
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching fields:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [fieldType, area])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFields(1)
  }

  const handlePageChange = (newPage: number) => {
    fetchFields(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setSearch('')
    setFieldType('ALL')
    setArea('ALL')
    router.replace('/fields', { scroll: false })
  }

  const handleViewField = (id: string) => {
    router.push(`/fields/${id}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">ملاعبنا</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          اختر من بين أفضل ملاعب كرة القدم والبابل في القاهرة. 
          جميع الملاعب مجهزة بأحدث التقنيات وتوفر تجربة لعب استثنائية.
        </p>
      </div>

      {/* Filters Section */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="ابحث عن ملعب، منطقة، أو سمة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-5 w-5" />}
                fullWidth
              />
            </div>
            <Button type="submit">
              بحث
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClearFilters}
            >
              مسح الفلاتر
            </Button>
          </form>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الملعب
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={fieldType === 'ALL' ? 'primary' : 'outline'}
                  onClick={() => setFieldType('ALL')}
                >
                  الكل
                </Button>
                <Button
                  size="sm"
                  variant={fieldType === 'SOCCER' ? 'primary' : 'outline'}
                  onClick={() => setFieldType('SOCCER')}
                >
                  كرة قدم
                </Button>
                <Button
                  size="sm"
                  variant={fieldType === 'PADEL' ? 'primary' : 'outline'}
                  onClick={() => setFieldType('PADEL')}
                >
                  بادل
                </Button>
              </div>
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنطقة
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {areas.map((areaOption) => (
                  <option key={areaOption.id} value={areaOption.id}>
                    {areaOption.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة العرض
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="flex items-center gap-1"
                >
                  <Grid className="h-4 w-4" />
                  شبكة
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-1"
                >
                  <List className="h-4 w-4" />
                  قائمة
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(search || fieldType !== 'ALL' || area !== 'ALL') && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
              
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  بحث: {search}
                  <button 
                    onClick={() => setSearch('')}
                    className="hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {fieldType !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  نوع: {fieldType === 'SOCCER' ? 'كرة قدم' : 'بادل'}
                  <button 
                    onClick={() => setFieldType('ALL')}
                    className="hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {area !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  منطقة: {area}
                  <button 
                    onClick={() => setArea('ALL')}
                    className="hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      <div>
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              الملاعب المتاحة
            </h2>
            {!loading && (
              <p className="text-gray-600 mt-1">
                عرض {fields.length} من {pagination.total} ملعب
              </p>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            الصفحة {pagination.page} من {pagination.totalPages}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600">جاري تحميل الملاعب...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-8 text-center">
            <div className="text-danger-600 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-3" />
              <p className="text-lg font-medium">{error}</p>
            </div>
            <Button onClick={() => fetchFields()}>
              حاول مرة أخرى
            </Button>
          </Card>
        )}

        {/* No Results */}
        {!loading && !error && fields.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد ملاعب
            </h3>
            <p className="text-gray-600 mb-6">
              لم نعثر على ملاعب تطابق معايير البحث. حاول تعديل الفلاتر.
            </p>
            <Button onClick={handleClearFilters}>
              عرض جميع الملاعب
            </Button>
          </Card>
        )}

        {/* Fields Grid */}
        {!loading && !error && fields.length > 0 && (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {fields.map((field) => (
                <FieldCard
                  key={field.id}
                  id={field.id}
                  name={field.name}
                  image={field.image || 'https://picsum.photos/600/400?random'}
                  type={field.type}
                  pricePerHour={field.pricePerHour}
                  location={field.location}
                  areaName={field.area.name}
                  onView={handleViewField}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  السابق
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
