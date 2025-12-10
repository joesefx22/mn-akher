'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  User,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { isValidEmail } from '@/lib/helpers';

// Component for handling search params separately
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, user } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/dashboard/player';
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      
      showToast('تم تسجيل الدخول بنجاح!', 'success');
      
      // Redirect based on user role or redirect param
      const redirectTo = searchParams.get('redirect') || '/dashboard/player';
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500);
      
    } catch (error: any) {
      let errorMessage = 'فشل تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.';
      
      if (error.message?.includes('Invalid credentials')) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.message?.includes('User not found')) {
        errorMessage = 'لا يوجد حساب بهذا البريد الإلكتروني';
      } else if (error.message?.includes('Email not verified')) {
        errorMessage = 'الرجاء تفعيل حسابك عبر البريد الإلكتروني';
      }
      
      showToast(errorMessage, 'error');
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    showToast(`تسجيل الدخول عبر ${provider} قيد التطوير`, 'info');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button for mobile */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>رجوع</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6"
          >
            <User className="h-10 w-10" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            مرحباً بعودتك!
          </h1>
          
          <p className="text-gray-600 max-w-sm mx-auto">
            سجل دخولك للوصول إلى حسابك ومتابعة حجوزاتك
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 md:p-8 shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </motion.div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                error={errors.email}
                required
                fullWidth
                className={errors.email ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : ''}
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  كلمة المرور
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={showPassword ? 
                  <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} /> : 
                  <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                }
                error={errors.password}
                required
                fullWidth
                className={errors.password ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : ''}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700">
                تذكرني
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
              fullWidth
              size="lg"
              className="mt-4"
            >
              {isLoading || isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">أو</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('Facebook')}
                className="gap-2"
              >
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <Link 
                href="/register" 
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              >
                أنشئ حساب جديد
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/fields')}
              className="gap-2"
            >
              تصفح الملاعب كزائر
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              العودة للرئيسية
            </Button>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            بالدخول فإنك توافق على{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              الشروط والأحكام
            </Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Loading fallback
function LoginLoading() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-20 w-20 mx-auto rounded-2xl" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Card className="p-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// Main component with Suspense for search params
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
