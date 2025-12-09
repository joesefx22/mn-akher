import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "احجزلي",
  description: "منصة حجز الملاعب الرياضية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <main className="min-h-screen container mx-auto py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'احجزلي - حجز ملعبك في دقيقة',
  description: 'احجز ملاعب كرة القدم والبابل في المقطم، الهضبة الوسطي، ومدينة نصر',
  keywords: ['حجز ملاعب', 'كرة قدم', 'بادل', 'المقطم', 'الهضبة', 'مدينة نصر'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
