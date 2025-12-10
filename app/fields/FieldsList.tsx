'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FieldCard from '@/components/FieldCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function FieldsList({
  initialFields,
  areas,
  total,
  currentPage,
  filters
}: any) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.q || '');
  
  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    
    // إضافة الفلاتر الجديدة
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== 'ALL') params.set(key, value as string);
    });
    
    router.push(`/fields?${params.toString()}`);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search, page: '1' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">الملاعب</h1>
      
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <Input
          placeholder="ابحث عن ملعب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filters.type ? 'outline' : 'primary'}
          onClick={() => updateFilters({ type: '' })}
        >
          الكل
        </Button>
        <Button
          variant={filters.type === 'SOCCER' ? 'primary' : 'outline'}
          onClick={() => updateFilters({ type: 'SOCCER' })}
        >
          كرة قدم
        </Button>
        <Button
          variant={filters.type === 'PADEL' ? 'primary' : 'outline'}
          onClick={() => updateFilters({ type: 'PADEL' })}
        >
          بادل
        </Button>
      </div>
      
      {/* Fields Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialFields.map((field: any) => (
          <FieldCard key={field.id} field={field} />
        ))}
      </div>
      
      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <span className="px-4 py-2">
            الصفحة {currentPage}
          </span>
          
          <Button
            variant="outline"
            onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
            disabled={currentPage * 12 >= total}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
