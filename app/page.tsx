'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Football, 
  Users, 
  Clock, 
  Shield,
  Star,
  ArrowLeft,
  ArrowRight,
  Search,
  MapPin,
  Filter
} from 'lucide-react';
import Button from '@/components/ui/Button';
import FieldCard from '@/components/features/FieldCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

// بيانات المناطق
const AREAS = [
  { id: 1, name: 'المقطم', count: 12, image: '/areas/maqttam.jpg' },
  { id: 2, name: 'الهضبة الوسطي', count: 8, image: '/areas/hadaba.jpg' },
  { id: 3, name: 'مدينة نصر', count: 15, image: '/areas/nasr-city.jpg' },
  { id: 4, name: 'الشروق', count: 6, image: '/areas/shrouk.jpg' },
  { id: 5, name: 'العبور', count: 4, image: '/areas/obour.jpg' },
];

// الميزات الرئيسية
const FEATURES = [
  {
    icon: <Calendar className="h-10 w-10" />,
    title: 'حجز سريع',
    description: 'احجز ملعبك في أقل من دقيقة بدون تعقيد'
  },
  {
    icon: <Football className="h-10 w-10" />,
    title: 'تنوع في الخيارات',
    description: 'ملاعب كرة قدم وبادل بمواصفات احترافية'
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: 'للفرق والأفراد',
    description: 'بإمكانية حجز للمباريات أو التدريبات الفردية'
  },
  {
    icon: <Clock className="h-10 w-10" />,
    title: 'مرونة في المواعيد',
    description: 'اختر الوقت واليوم الذي يناسب جدولك'
  },
  {
    icon: <Shield className="h-10 w-10" />,
    title: 'دفع آمن',
    description: 'أنظمة دفع متعددة مع ضمان استرداد الأموال'
  },
  {
    icon: <Star className="h-10 w-10" />,
    title: 'تقييمات حقيقية',
    description: 'اقرأ تجارب اللاعبين السابقين قبل الحجز'
  }
];

// التستيمونيات
const TESTIMONIALS = [
  {
    name: 'أحمد محمد',
    role: 'لاعب محترف',
    content: 'أفضل منصة لحجز الملاعب في القاهرة، سريعة ومضمونة.',
    rating: 5,
    image: '/avatars/avatar1.jpg'
  },
  {
    name: 'محمود السيد',
    role: 'مدرب فريق',
    content: 'سهولة الحجز وتنوع الخيارات وفر علي الكثير من الوقت.',
    rating: 5,
    image: '/avatars/avatar2.jpg'
  },
  {
    name: 'سارة علي',
    role: 'لاعبة بادل',
    content: 'المنصة العربية الأولى في حجز ملاعب البادل.',
    rating: 4,
    image: '/avatars/avatar3.jpg'
  },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<any[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    fetchFeaturedFields();
  }, []);

  const fetchFeaturedFields = async () => {
    try {
      setLoading(true);
      // TODO: استبدل هذا مع API حقيقي
      setTimeout(() => {
        const mockFields = [
          {
            id: '1',
            name: 'ملعب النجوم الرياضي',
            type: 'SOCCER',
            pricePerHour: 200,
            location: 'المقطم',
            area: { name: 'المقطم' },
            owner: { name: 'أكاديمية النجوم' },
            image: '/fields/field1.jpg',
            rating: 4.8,
            reviewCount: 124,
            features: ['إضاءة ليلية', 'صالة ملابس', 'كافيه']
          },
          {
            id: '2',
            name: 'نادي البادل المتطور',
            type: 'PADEL',
            pricePerHour: 150,
            location: 'مدينة نصر',
            area: { name: 'مدينة نصر' },
            owner: { name: 'نادي التطور' },
            image: '/fields/field2.jpg',
            rating: 4.9,
            reviewCount: 89,
            features: ['تكييف', 'تجهيزات احترافية', 'تدريب']
          },
          {
            id: '3',
            name: 'ملعب الشباب الرياضي',
            type: 'SOCCER',
            pricePerHour: 180,
            location: 'الهضبة الوسطي',
            area: { name: 'الهضبة الوسطي' },
            owner: { name: 'نادي الشباب' },
            image: '/fields/field3.jpg',
            rating: 4.7,
            reviewCount: 67,
            features: ['جراج', 'كافتيريا', 'مدرجات']
          },
        ];
        setFields(mockFields);
        setLoading(false);
      }, 1000);
    } catch (error) {
      showToast('حدث خطأ في تحميل البيانات', 'error');
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/5" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 mb-6 animate-pulse">
              <span className="text-sm font-medium">📍</span>
              <span className="text-sm font-semibold">المقطم | الهضبة | مدينة نصر | الشروق | العبور</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gray-900">احجز ملعبك</span>
              <span className="block text-primary-600 bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">
                في دقيقة واحدة
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              منصة رائدة لحجز ملاعب كرة القدم والبابل في القاهرة. 
              اختر من بين أفضل الملاعب واحجز وقتك المناسب مع ضمان سعر مناسب وخدمة مميزة.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/fields?type=SOCCER">
                <Button size="xl" className="min-w-[200px] gap-2">
                  <Football className="h-5 w-5" />
                  ملاعب كرة قدم
                </Button>
              </Link>
              
              <Link href="/fields?type=PADEL">
                <Button size="xl" variant="outline" className="min-w-[200px]">
                  ملاعب بادل
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold">ابحث عن ملعب</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن منطقة..."
                  className="input-field pr-10"
                />
              </div>
              
              <div>
                <select className="input-field">
                  <option value="">نوع الملعب</option>
                  <option value="SOCCER">كرة قدم</option>
                  <option value="PADEL">بادل</option>
                </select>
              </div>
              
              <div>
                <Button className="w-full gap-2">
                  <Filter className="h-4 w-4" />
                  بحث متقدم
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختار احجزلي؟</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نقدم لك تجربة حجز سلسة ومميزة مع كل ما تحتاجه من مميزات
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="feature-card group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Areas */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">المناطق الأكثر طلباً</h2>
            <p className="text-gray-600 mt-2">اكتشف أفضل الملاعب في مناطقك المفضلة</p>
          </div>
          <Link 
            href="/fields" 
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            عرض جميع الملاعب
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {AREAS.map((area) => (
            <Link
              key={area.id}
              href={`/fields?area=${area.name}`}
              className="group block"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 h-48"
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <div className="text-4xl mb-2">📍</div>
                  <h3 className="font-bold text-lg mb-1">{area.name}</h3>
                  <p className="text-sm opacity-90">{area.count} ملعب</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Fields */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">أشهر الملاعب</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            اكتشف الملاعب الأكثر تقييماً وطلباً بين اللاعبين
          </p>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {fields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link href="/fields">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              عرض جميع الملاعب
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ماذا يقول عملاؤنا؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              انضم إلى آلاف اللاعبين الذين يثقون بنا لحجز ملاعبهم
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-soft p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                  {TESTIMONIALS[currentTestimonial].name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{TESTIMONIALS[currentTestimonial].name}</h4>
                  <p className="text-gray-600 text-sm">{TESTIMONIALS[currentTestimonial].role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < TESTIMONIALS[currentTestimonial].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed italic">
                "{TESTIMONIALS[currentTestimonial].content}"
              </p>
              
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <div className="flex gap-2">
                  {TESTIMONIALS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentTestimonial ? 'bg-primary-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              جاهز للعب؟
            </h2>
            <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
              انضم إلى آلاف اللاعبين الذين يثقون بنا لحجز ملاعبهم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="min-w-[200px]">
                  إنشاء حساب جديد
                </Button>
              </Link>
              <Link href="/fields">
                <Button size="lg" variant="outline" className="min-w-[200px] bg-white/10 border-white/20 hover:bg-white/20">
                  تصفح الملاعب
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">2,500+</div>
                <div className="text-sm opacity-90">حجز ناجح</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-sm opacity-90">ملعب متاح</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">4.9★</div>
                <div className="text-sm opacity-90">تقييم متوسط</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-sm opacity-90">رضا العملاء</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
