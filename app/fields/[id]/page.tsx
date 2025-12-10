import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import FieldDetailsClient from './FieldDetailsClient';
import { Skeleton } from '@/components/ui/Skeleton';
import { getFieldDetails } from '@/lib/data';

interface FieldDetailsPageProps {
  params: {
    id: string;
  };
  searchParams: {
    date?: string;
    quickBook?: string;
  };
}

export async function generateMetadata(
  { params }: FieldDetailsPageProps
): Promise<Metadata> {
  try {
    const field = await getFieldDetails(params.id);
    
    if (!field) {
      return {
        title: 'الملعب غير موجود | احجزلي',
        description: 'لم يتم العثور على الملعب المطلوب'
      };
    }
    
    return {
      title: `${field.name} | احجزلي`,
      description: field.description || `احجز ${field.name} في ${field.location}. ${field.type === 'SOCCER' ? 'ملعب كرة قدم' : 'ملعب بادل'} بسعر ${field.pricePerHour} جنيه للساعة.`,
      openGraph: {
        title: field.name,
        description: field.description || `ملعب ${field.type === 'SOCCER' ? 'كرة قدم' : 'بادل'} في ${field.location}`,
        images: field.image ? [field.image] : [],
      },
    };
  } catch {
    return {
      title: 'تفاصيل الملعب | احجزلي',
      description: 'تفاصيل الملعب وحجز الأوقات'
    };
  }
}

export const revalidate = 60; // Revalidate every minute

function FieldDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button Skeleton */}
      <Skeleton className="h-10 w-32 mb-6" />
      
      {/* Hero Image Skeleton */}
      <Skeleton className="h-64 md:h-96 rounded-2xl mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default async function FieldDetailsPage({ params, searchParams }: FieldDetailsPageProps) {
  let field;
  let initialDate;
  
  try {
    // Parse initial date from search params or use today
    initialDate = searchParams.date 
      ? new Date(searchParams.date) 
      : new Date();
    
    // Fetch field details
    field = await getFieldDetails(params.id);
    
    if (!field) {
      notFound();
    }
  } catch (error) {
    notFound();
  }
  
  return (
    <Suspense fallback={<FieldDetailsLoading />}>
      <FieldDetailsClient 
        fieldId={params.id}
        initialField={field}
        initialDate={initialDate}
        quickBook={searchParams.quickBook === 'true'}
      />
    </Suspense>
  );
}
