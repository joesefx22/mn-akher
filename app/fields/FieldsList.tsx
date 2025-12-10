'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Grid, List } from 'lucide-react';
import FieldCard from '@/components/FieldCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Field {
  id: string;
  name: string;
  type: 'SOCCER' | 'PADEL';
  pricePerHour: number;
  location: string;
  image?: string;
  area: { name: string };
  owner: { name: string };
}

interface Area {
  id: string;
  name: string;
}

interface Props {
  fields: Field[];
  areas: Area[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    type: string;
    area: string;
    search: string;
  };
}

export default function FieldsList({ fields, areas, pagination, filters }: Props) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: localSearch, page: '1' });
  };

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    
    // الحفاظ على الفلاتر الحالية
    if (filters.type !== 'ALL') params.set('type', filters.type);
    if (filters.area !== 'ALL') params.set('area', filters.area);
    if (filters.search) params.set('q', filters.search);
    
    // تطبيق التحديثات
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/fields?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الملاعب المتاحة</h1>
        <p className="text-gray-600">
          {fields.length} من {pagination.total * fields.length} ملعب
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="ابحث عن ملعب..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filters.type === 'ALL' ? 'primary' : 'outline'}
            onClick={() => updateFilters({ type: 'ALL' })}
          >
            الكل
          </Button>
          <Button
            size="sm"
            variant={filters.type === 'SOCCER' ? 'primary' : 'outline'}
            onClick={() => updateFilters({ type: 'SOCCER' })}
          >
            كرة قدم
          </Button>
          <Button
            size="sm"
            variant={filters.type === 'PADEL' ? 'primary' : 'outline'}
            onClick={() => updateFilters({ type: 'PADEL' })}
          >
            بادل
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">المنطقة</label>
                <select
                  value={filters.area}
                  onChange={(e) => updateFilters({ area: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="ALL">جميع المناطق</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">طريقة العرض</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fields Grid */}
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {fields.map((field) => (
          <FieldCard key={field.id} field={field} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => updateFilters({ page: (pagination.current - 1).toString() })}
            disabled={!pagination.hasPrev}
          >
            السابق
          </Button>
          
          {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={pagination.current === pageNum ? 'primary' : 'outline'}
                onClick={() => updateFilters({ page: pageNum.toString() })}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            onClick={() => updateFilters({ page: (pagination.current + 1).toString() })}
            disabled={!pagination.hasNext}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
