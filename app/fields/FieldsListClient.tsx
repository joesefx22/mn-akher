'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import FieldCard from '@/components/features/FieldCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/helpers';

interface Field {
  id: string;
  name: string;
  type: 'SOCCER' | 'PADEL';
  pricePerHour: number;
  location: string;
  image?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  area: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    name: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Area {
  id: string;
  name: string;
  fieldCount?: number;
}

interface FieldsListClientProps {
  areas: Area[];
}

export default function FieldsListClient({ areas }: FieldsListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [fields, setFields] = useState<Field[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [fieldType, setFieldType] = useState<'ALL' | 'SOCCER' | 'PADEL'>(
    (searchParams.get('type') as 'ALL' | 'SOCCER' | 'PADEL') || 'ALL'
  );
  const [area, setArea] = useState(searchParams.get('area') || 'ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounced search
  const [debouncedSearch] = useDebounce(search, 500);
  
  // Field type options
  const fieldTypes = [
    { id: 'ALL', name: 'جميع الملاعب', icon: '🏟️' },
    { id: 'SOCCER', name: 'كرة قدم', icon: '⚽' },
    { id: 'PADEL', name: 'بادل', icon: '🎾' }
  ];
  
  // Price ranges
  const priceRanges = [
    { label: 'أي سعر', min: 0, max: 10000 },
    { label: 'اقتصادي (حتى 100 جنيه)', min: 0, max: 100 },
    { label: 'متوسط (100 - 200 جنيه)', min: 100, max: 200 },
    { label: 'فاخر (أكثر من 200 جنيه)', min: 200, max: 10000 }
  ];

  // Fetch fields with filters
  const fetchFields = useCallback(async (page = 1, reset = false) => {
    if (fetching && !reset) return;
    
    setFetching(true);
    if (reset) {
      setLoading(true);
      setPage(1);
    }
    
    try {
      // Build query params
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (fieldType !== 'ALL') params.set('type', fieldType);
      if (area !== 'ALL') params.set('areaId', area);
      params.set('minPrice', priceRange[0].toString());
      params.set('maxPrice', priceRange[1].toString());
      params.set('page', page.toString());
      params.set('limit', '12');
      
      const response = await fetch(`/api/fields/list?${params}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل تحميل الملاعب');
      }
      
      const data = await response.json();
      
      // Validate response
      if (!data.data || !Array.isArray(data.data.fields)) {
        throw new Error('Invalid response format');
      }
      
      setFields(data.data.fields);
      setPagination(data.data.pagination || {
        total: data.data.fields.length,
        page,
        limit: 12,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
      
      // Update URL without refresh
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) newParams.set('q', debouncedSearch);
      else newParams.delete('q');
      
      if (fieldType !== 'ALL') newParams.set('type', fieldType);
      else newParams.delete('type');
      
      if (area !== 'ALL') newParams.set('area', area);
      else newParams.delete('area');
      
      router.replace(`/fields?${newParams.toString()}`, { scroll: false });
      
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
      console.error('Error fetching fields:', err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [debouncedSearch, fieldType, area, priceRange, router, searchParams, fetching, showToast]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchFields(1, true);
  }, [fieldType, area, priceRange, debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFields(1, true);
  };

  const handlePageChange = (newPage: number) => {
    fetchFields(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearch('');
    setFieldType('ALL');
    setArea('ALL');
    setPriceRange([0, 1000]);
    setShowFilters(false);
  };

  const handleViewField = (id: string) => {
    router.push(`/fields/${id}`);
  };

  const handleQuickBook = (fieldId: string) => {
    if (!user) {
      router.push(`/login?redirect=/fields/${fieldId}`);
      return;
    }
    router.push(`/fields/${fieldId}?quickBook=true`);
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (fieldType !== 'ALL') count++;
    if (area !== 'ALL') count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    return count;
  }, [debouncedSearch, fieldType, area, priceRange]);

  // Filter fields for featured (highly rated)
  const featuredFields = useMemo(() => 
    fields.filter(field => (field.rating || 0) >= 4.5).slice(0, 3)
  , [fields]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          اكتشف أفضل الملاعب
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          اختر من بين ملاعب كرة القدم والبابل في القاهرة. كل ملعب مجهز بأحدث التقنيات 
          ويوفر تجربة لعب استثنائية مع ضمان أفضل الأسعار.
        </p>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">150+</div>
            <div className="text-gray-600">ملعب متاح</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">4.8★</div>
            <div className="text-gray-600">تقييم متوسط</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">98%</div>
            <div className="text-gray-600">رضا العملاء</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Search & Filters Bar */}
        <Card className="p-6 shadow-lg border border-gray-200">
          <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="ابحث عن ملعب، منطقة، أو ميزة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="h-5 w-5" />}
                  fullWidth
                />
              </div>
              <Button type="submit" loading={fetching}>
                بحث
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-5 w-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </form>

            {/* Advanced Filters (Collapsible) */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                    {/* Field Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        نوع الملعب
                      </label>
                      <div className="space-y-2">
                        {fieldTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFieldType(type.id as any)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all ${
                              fieldType === type.id
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xl">{type.icon}</span>
                            <span className="font-medium">{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        المنطقة
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => setArea('ALL')}
                          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border ${
                            area === 'ALL'
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-200 hover:border-primary-200'
                          }`}
                        >
                          <MapPin className="h-5 w-5" />
                          <span className="font-medium">جميع المناطق</span>
                        </button>
                        {areas.map((areaItem) => (
                          <button
                            key={areaItem.id}
                            type="button"
                            onClick={() => setArea(areaItem.id)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border ${
                              area === areaItem.id
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'border-gray-200 hover:border-primary-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <span className="font-medium">{areaItem.name}</span>
                            </div>
                            {areaItem.fieldCount && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {areaItem.fieldCount}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        نطاق السعر
                      </label>
                      <div className="space-y-2">
                        {priceRanges.map((range, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setPriceRange([range.min, range.max])}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg border ${
                              priceRange[0] === range.min && priceRange[1] === range.max
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'border-gray-200 hover:border-primary-200'
                            }`}
                          >
                            <span className="font-medium">{range.label}</span>
                            {range.max < 10000 && (
                              <span className="text-sm text-gray-500">
                                حتى {formatCurrency(range.max)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* View & Actions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        طريقة العرض
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={viewMode === 'grid' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('grid')}
                            className="flex-1 gap-2"
                          >
                            <Grid className="h-4 w-4" />
                            شبكة
                          </Button>
                          <Button
                            size="sm"
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            onClick={() => setViewMode('list')}
                            className="flex-1 gap-2"
                          >
                            <List className="h-4 w-4" />
                            قائمة
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          onClick={handleClearFilters}
                          className="w-full gap-2"
                        >
                          <X className="h-4 w-4" />
                          مسح جميع الفلاتر
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
                
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    بحث: {debouncedSearch}
                    <button 
                      onClick={() => setSearch('')}
                      className="hover:text-primary-900 ml-1"
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
                      className="hover:text-primary-900 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {area !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    منطقة: {areas.find(a => a.id === area)?.name || area}
                    <button 
                      onClick={() => setArea('ALL')}
                      className="hover:text-primary-900 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    سعر: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    <button 
                      onClick={() => setPriceRange([0, 1000])}
                      className="hover:text-primary-900 ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Featured Fields (if any) */}
        {featuredFields.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">مميز هذا الأسبوع</h2>
                <p className="text-gray-600 mt-1">أفضل الملاعب تقييماً</p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-700">تقييم 4.5+</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {featuredFields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  featured
                  onQuickBook={() => handleQuickBook(field.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        <div>
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
            
            <div className="flex items-center gap-4">
              {pagination.totalPages > 1 && (
                <div className="text-sm text-gray-600 hidden md:block">
                  الصفحة {pagination.page} من {pagination.totalPages}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium">
                  {pagination.page}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
                <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                <p className="text-lg font-medium">{error}</p>
              </div>
              <Button onClick={() => fetchFields(1, true)}>
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

          {/* Fields Grid/List */}
          {!loading && !error && fields.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {fields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    viewMode={viewMode}
                    onView={() => handleViewField(field.id)}
                    onQuickBook={() => handleQuickBook(field.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
                    {pagination.total} ملعب
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="gap-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                      السابق
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
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
                        );
                      })}
                      
                      {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                        <>
                          <span className="px-2 py-1">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.totalPages)}
                          >
                            {pagination.totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="gap-2"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Stats & Info */}
        {!loading && fields.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-700 mb-2">
                    ⚡ حجز فوري
                  </div>
                  <p className="text-gray-700 text-sm">
                    احجز في دقائق بدون انتظار
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-700 mb-2">
                    🔒 دفع آمن
                  </div>
                  <p className="text-gray-700 text-sm">
                    أنظمة دفع متعددة مع حماية كاملة
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-700 mb-2">
                    📞 دعم 24/7
                  </div>
                  <p className="text-gray-700 text-sm">
                    فريق دعم متاح على مدار الساعة
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
