import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Analytics } from '@/components/layout/Analytics'

// إعداد الخطوط للعربية والإنجليزية
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'احجزلي - حجز ملاعب كرة القدم والبابل',
    template: '%s | احجزلي'
  },
  description: 'منصة رائدة لحجز ملاعب كرة القدم والبابل في القاهرة. احجز ملعبك في دقيقة واحدة في المقطم، الهضبة الوسطي، مدينة نصر، والشروق.',
  keywords: [
    'حجز ملاعب', 'كرة قدم', 'بادل', 'المقطم', 'الهضبة الوسطي', 
    'مدينة نصر', 'الشروق', 'العبور', 'حجز رياضي', 'ملاعب'
  ],
  authors: [{ name: 'احجزلي' }],
  creator: 'احجزلي',
  publisher: 'احجزلي',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: '/',
    title: 'احجزلي - حجز ملاعب كرة القدم والبابل',
    description: 'احجز ملعبك في دقيقة واحدة في أفضل الملاعب',
    siteName: 'احجزلي',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'احجزلي - منصة حجز الملاعب',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'احجزلي - حجز ملاعب كرة القدم والبابل',
    description: 'احجز ملعبك في دقيقة واحدة',
    images: ['/twitter-image.png'],
    creator: '@7gezly',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`${inter.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`
        min-h-screen 
        bg-gradient-to-br 
        from-gray-50 via-white to-primary-50/30 
        font-sans 
        text-gray-900
        antialiased
        selection:bg-primary-100 selection:text-primary-900
      `}>
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <div className="container mx-auto px-4 py-6 md:py-8">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
            <Analytics />
          </ToastProvider>
        </AuthProvider>
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              "name": "احجزلي",
              "description": "منصة حجز ملاعب كرة القدم والبابل في القاهرة",
              "url": process.env.NEXT_PUBLIC_BASE_URL,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "EG",
                "addressRegion": "Cairo"
              },
              "sports": ["Soccer", "Padel tennis"],
              "priceRange": "$$",
            })
          }}
        />
      </body>
    </html>
  )
}
