'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Shield,
  Heart,
  MessageSquare
} from 'lucide-react'

// بيانات المناطق (يمكن استبدالها بـ API)
const AREAS = [
  { id: 1, name: 'المقطم', count: 12 },
  { id: 2, name: 'الهضبة الوسطي', count: 8 },
  { id: 3, name: 'مدينة نصر', count: 15 },
  { id: 4, name: 'العبور', count: 6 },
  { id: 5, name: 'الشروق', count: 9 },
  { id: 6, name: 'التجمع الخامس', count: 11 },
  { id: 7, name: 'مصر الجديدة', count: 7 },
  { id: 8, name: 'المعادي', count: 5 },
]

// روابط سريعة
const QUICK_LINKS = [
  { label: 'جميع الملاعب', href: '/fields', icon: Calendar },
  { label: 'ملاعب كرة قدم', href: '/fields?type=SOCCER', icon: Calendar },
  { label: 'ملاعب بادل', href: '/fields?type=PADEL', icon: Calendar },
  { label: 'كيفية الحجز', href: '/how-to-book', icon: MessageSquare },
  { label: 'سياسة الاستخدام', href: '/privacy', icon: Shield },
]

// روابط وسائل التواصل الاجتماعي
const SOCIAL_LINKS = [
  { icon: Facebook, href: 'https://facebook.com/ahgzly', label: 'فيسبوك' },
  { icon: Twitter, href: 'https://twitter.com/ahgzly', label: 'تويتر' },
  { icon: Instagram, href: 'https://instagram.com/ahgzly', label: 'انستجرام' },
]

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showAllAreas, setShowAllAreas] = useState(false)

  // التحديث التلقائي للسنة
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  // المناطق المعروضة (أول 4 أو الكل)
  const displayedAreas = showAllAreas ? AREAS : AREAS.slice(0, 4)

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-20">
      {/* موجز الإحصائيات */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">1,250+</div>
              <div className="text-gray-400 text-sm mt-1">حجز مكتمل</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">85+</div>
              <div className="text-gray-400 text-sm mt-1">ملعب متاح</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">98%</div>
              <div className="text-gray-400 text-sm mt-1">تقييم العملاء</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">24/7</div>
              <div className="text-gray-400 text-sm mt-1">دعم فني</div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                  احجزلي
                </h2>
                <p className="text-gray-400">حجز ملعبك في دقيقة</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              المنصة الرائدة في مصر لحجز ملاعب كرة القدم والبادل. 
              نوفر تجربة حجز سلسة وآمنة مع أفضل الملاعب في مختلف أنحاء القاهرة.
            </p>
            
            {/* Newsletter Subscription */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">اشترك في النشرة البريدية</h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  اشتراك
                </button>
              </form>
              <p className="text-gray-500 text-sm">
                سنرسل لك عروض خاصة وتحديثات الملاعب الجديدة
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="h-1 w-8 bg-primary-500 rounded-full"></span>
              روابط سريعة
            </h3>
            <ul className="space-y-4">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                  >
                    <link.icon className="h-4 w-4 group-hover:text-primary-400 transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/become-partner"
                  className="flex items-center gap-3 text-primary-400 hover:text-primary-300 transition-colors font-medium"
                >
                  <Heart className="h-4 w-4" />
                  <span>انضم كشريك</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="h-1 w-8 bg-primary-500 rounded-full"></span>
                المناطق
              </h3>
              {AREAS.length > 4 && (
                <button
                  onClick={() => setShowAllAreas(!showAllAreas)}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {showAllAreas ? 'عرض أقل' : 'عرض المزيد'}
                </button>
              )}
            </div>
            <ul className="space-y-3">
              {displayedAreas.map((area) => (
                <li key={area.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                    <Link 
                      href={`/fields?area=${encodeURIComponent(area.name)}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {area.name}
                    </Link>
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                    {area.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="h-1 w-8 bg-primary-500 rounded-full"></span>
              تواصل معنا
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-primary-500 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">الدعم الفني</div>
                    <a 
                      href="tel:+201234567890" 
                      className="text-lg font-medium hover:text-primary-400 transition-colors"
                    >
                      01234567890
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-primary-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                    <a 
                      href="mailto:info@ahgzly.com" 
                      className="text-lg font-medium hover:text-primary-400 transition-colors"
                    >
                      info@ahgzly.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-medium mb-4">تابعنا على</h4>
                <div className="flex gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 hover:bg-primary-500 rounded-lg transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Download App */}
              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-medium mb-3">حمل التطبيق</h4>
                <div className="flex gap-3">
                  <a 
                    href="#"
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-xs text-gray-400">احصل عليه من</div>
                    <div className="font-medium">Google Play</div>
                  </a>
                  <a 
                    href="#"
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-xs text-gray-400">حمله من</div>
                    <div className="font-medium">App Store</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-right order-2 md:order-1">
              <p className="text-gray-500">
                © {currentYear} احجزلي. جميع الحقوق محفوظة.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                مصمم بكل ❤️ لتجربة رياضية أفضل
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 order-1 md:order-2">
              <Link 
                href="/privacy" 
                className="hover:text-white transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <Link 
                href="/terms" 
                className="hover:text-white transition-colors"
              >
                الشروط والأحكام
              </Link>
              <Link 
                href="/refund" 
                className="hover:text-white transition-colors"
              >
                سياسة الإرجاع
              </Link>
              <Link 
                href="/cookies" 
                className="hover:text-white transition-colors"
              >
                سياسة الكوكيز
              </Link>
              <Link 
                href="/sitemap" 
                className="hover:text-white transition-colors"
              >
                خريطة الموقع
              </Link>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm order-3">
              <Shield className="h-4 w-4" />
              <span>حجوزات آمنة</span>
              <span className="mx-2">•</span>
              <span>مدفوعات مشفرة</span>
              <span className="mx-2">•</span>
              <span>دعم 24/7</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-center text-gray-500 text-sm mb-4">
              وسائل الدفع المقبولة
            </div>
            <div className="flex justify-center gap-4">
              {['Visa', 'MasterCard', 'Meeza', 'Vodafone Cash', 'Paymob'].map((method) => (
                <div 
                  key={method}
                  className="px-4 py-2 bg-gray-800 rounded-lg text-gray-400 text-sm"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
        aria-label="العودة للأعلى"
      >
        <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </footer>
  )
}
