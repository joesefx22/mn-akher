import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-xl font-bold">ح</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">احجزلي</h2>
                <p className="text-gray-400">حجز ملعبك في دقيقة</p>
              </div>
            </div>
            <p className="text-gray-400">
              منصة رائدة لحجز ملاعب كرة القدم والبابل في القاهرة. 
              نسعى لتسهيل عملية الحجز وتوفير أفضل التجارب الرياضية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/fields" className="text-gray-400 hover:text-white transition-colors">
                  جميع الملاعب
                </Link>
              </li>
              <li>
                <Link href="/fields?type=SOCCER" className="text-gray-400 hover:text-white transition-colors">
                  ملاعب كرة قدم
                </Link>
              </li>
              <li>
                <Link href="/fields?type=PADEL" className="text-gray-400 hover:text-white transition-colors">
                  ملاعب بادل
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="text-gray-400 hover:text-white transition-colors">
                  حجوزاتي
                </Link>
              </li>
              <li>
                <Link href="/dashboard/owner" className="text-gray-400 hover:text-white transition-colors">
                  إضافة ملعب
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">المناطق</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>المقطم</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>الهضبة الوسطي</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>مدينة نصر</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>العبور</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>الشروق</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-400" />
                <a href="tel:+201234567890" className="text-gray-400 hover:text-white transition-colors">
                  01234567890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <a href="mailto:info@ahgzly.com" className="text-gray-400 hover:text-white transition-colors">
                  info@ahgzly.com
                </a>
              </li>
            </ul>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">تابعنا</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {currentYear} احجزلي. جميع الحقوق محفوظة.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              الشروط والأحكام
            </Link>
            <Link href="/refund" className="hover:text-white transition-colors">
              سياسة الإرجاع
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
