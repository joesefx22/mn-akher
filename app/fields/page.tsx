import { Suspense } from 'react';
import { Metadata } from 'next';
import { Search, Filter, Grid, List, MapPin } from 'lucide-react';
import FieldsListClient from './FieldsListClient';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchAreas } from '@/lib/data';

export const metadata: Metadata = {
  title: 'الملاعب | احجزلي',
  description: 'تصفح أفضل ملاعب كرة القدم والبابل في القاهرة. ابحث، قارن، واحجز ملعبك المفضل.',
  keywords: ['ملاعب كرة قدم', 'ملاعب بادل', 'حجز ملاعب', 'القاهرة', 'المقطم', 'الهضبة'],
  openGraph: {
    title: 'الملاعب | احجزلي',
    description: 'تصفح أفضل ملاعب كرة القدم والبابل في القاهرة',
  },
};

export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-dynamic';

async function FieldsListWrapper() {
  const areas = await fetchAreas();
  
  return <FieldsListClient areas={areas} />;
}

function FieldsListLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-20 w-full rounded-xl mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FieldsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Suspense fallback={<FieldsListLoading />}>
        <FieldsListWrapper />
      </Suspense>
    </div>
  );
}
