'use client';

import { useEffect, useState } from 'react';
import FieldCard from '../components/features/FieldCard';
import { apiGet } from '../lib/helpers';

export default function HomePage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/fields/list')
      .then((res) => {
        setFields(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {fields.map(field => (
        <FieldCard key={field.id} field={field} />
      ))}
    </div>
  );
}
import { Calendar, Football, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const areas = [
    { id: 1, name: 'المقطم', count: 12 },
    { id: 2, name: 'الهضبة الوسطي', count: 8 },
    { id: 3, name: 'مدينة نصر', count: 15 },
    { id: 4, name: 'الشروق', count: 6 },
    { id: 5, name: 'العبور', count: 4 },
  ]

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'حجز سريع',
      description: 'احجز ملعبك في أقل من دقيقة'
    },
    {
      icon: <Football className="h-8 w-8" />,
      title: 'متنوع',
      description: 'ملاعب كرة قدم وبادل بمواصفات عالية'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'للفرق والأفراد',
      description: 'بإمكانية حجز للمباريات أو التدريبات'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'مرن',
      description: 'اختر الوقت واليوم الذي يناسبك'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 mb-6">
            <span className="text-sm font-medium">📍</span>
            <span className="text-sm">حجز ملعبك في المقطم، الهضبة، مدينة نصر</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            احجز ملعبك
            <span className="block text-primary-600">في دقيقة</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            منصة رائدة لحجز ملاعب كرة القدم والبابل. 
            اختر من بين أفضل الملاعب في القاهرة واحجز وقتك المناسب.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fields?type=SOCCER">
              <Button size="lg" className="min-w-[180px]">
                <Football className="mr-2 h-5 w-5" />
                ملاعب كرة قدم
              </Button>
            </Link>
            
            <Link href="/fields?type=PADEL">
              <Button size="lg" variant="outline" className="min-w-[180px]">
                ملاعب بادل
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار احجزلي؟</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Areas */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">المناطق الأكثر طلباً</h2>
          <Link href="/fields" className="text-primary-600 hover:text-primary-700 font-medium">
            عرض جميع الملاعب →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/fields?area=${area.name}`}
              className="group"
            >
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-3xl mb-2">📍</div>
                <h3 className="font-semibold text-lg mb-1">{area.name}</h3>
                <p className="text-gray-500 text-sm">{area.count} ملعب</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          جاهز للعب؟
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          انضم إلى آلاف اللاعبين الذين يثقون بنا لحجز ملاعبهم
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" variant="secondary" className="min-w-[180px]">
              إنشاء حساب جديد
            </Button>
          </Link>
          <Link href="/fields">
            <Button size="lg" variant="outline" className="min-w-[180px] bg-white/10 border-white/20 hover:bg-white/20">
              تصفح الملاعب
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
