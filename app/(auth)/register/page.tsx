'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { isValidEmail, isValidPassword } from '@/lib/helpers';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  Object.values(checks).forEach(check => {
    if (check) score++;
  });

  if (score <= 2) return { strength: 'ضعيفة', color: 'text-red-500', percent: 40 };
  if (score <= 4) return { strength: 'جيدة', color: 'text-yellow-500', percent: 70 };
  return { strength: 'قوية', color: 'text-green-500', percent: 100 };
};

// Component for handling search params separately
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading, user } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard/player');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم الكامل مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'الاسم يجب أن يكون على الأقل حرفين';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }

    // Phone validation (optional)
    if (formData.phone && !/^01[0-2,5]{1}[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صالح';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتشمل أحرف كبيرة وصغيرة وأرقام';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    // Terms acceptance
    if (!acceptedTerms) {
      newErrors.terms = 'يجب الموافقة على الشروط والأحكام';
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
      
      // Scroll to first error
      const firstError = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      
      showToast('تم إنشاء الحساب بنجاح!', 'success');
      
      // Redirect to email verification or dashboard
      setTimeout(() => {
        router.push('/verify-email?email=' + encodeURIComponent(formData.email));
      }, 2000);
      
    } catch (error: any) {
      let errorMessage = 'فشل إنشاء الحساب. حاول مرة أخرى.';
      
      if (error.message?.includes('Email already exists')) {
        errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'البريد الإلكتروني غير صالح';
      } else if (error.message?.includes('Weak password')) {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      }
      
      showToast(errorMessage, 'error');
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

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
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white mb-6"
          >
            <User className="h-10 w-10" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            أنشئ حسابك
          </h1>
          
          <p className="text-gray-600 max-w-sm mx-auto">
            انضم إلى مجتمع احجزلي واستمتع بتجربة الحجز السهلة
          </p>
        </div>

        {/* Register Card */}
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

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="أحمد محمد"
                icon={<User className="h-5 w-5 text-gray-400" />}
                error={errors.name}
                required
                fullWidth
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني *
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
              />
            </div>

            {/* Phone Input (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                error={errors.phone}
                fullWidth
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور *
              </label>
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
              />
              
              {/* Password Strength Meter */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">قوة كلمة المرور:</span>
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${passwordStrength.strength === 'ضعيفة' ? 'bg-red-500' : passwordStrength.strength === 'جيدة' ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">8 أحرف على الأقل</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">حرف كبير</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">حرف صغير</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">رقم</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                icon={showConfirmPassword ? 
                  <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowConfirmPassword(false)} /> : 
                  <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
                }
                error={errors.confirmPassword}
                required
                fullWidth
              />
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 flex items-center gap-2"
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">كلمتا المرور متطابقتان</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">كلمتا المرور غير متطابقتان</span>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Terms Acceptance */}
            <div className="pt-4">
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="mr-2 block text-sm text-gray-700">
                  أوافق على{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    الشروط والأحكام
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    سياسة الخصوصية
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-danger-600">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting || !acceptedTerms}
              fullWidth
              size="lg"
              className="mt-6"
            >
              {isLoading || isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link 
                href="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              >
                سجل دخولك
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => router.push('/fields')}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              تصفح الملاعب كزائر
            </Button>
          </div>
        </Card>

        {/* Security Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">أمان بياناتك</h4>
              <p className="text-xs text-blue-700">
                نحن نحمي بياناتك باستخدام تشفير متقدم. لن نشارك بياناتك الشخصية مع أي طرف ثالث.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Loading fallback
function RegisterLoading() {
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// Main component with Suspense for search params
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterContent />
    </Suspense>
  );
}
