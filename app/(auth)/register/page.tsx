'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const result = await registerUser(form);
    if (result.error) setError(result.error);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">إنشاء حساب</h1>

      {error && <p className="text-red-500">{error}</p>}

      <Input label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input label="كلمة المرور" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <Button onClick={handleRegister} className="w-full mt-4">
        إنشاء حساب
      </Button>
    </div>
  );
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return 'جميع الحقول مطلوبة'
    }

    if (formData.password.length < 6) {
      return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'كلمتا المرور غير متطابقتين'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'البريد الإلكتروني غير صالح'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
      setSuccess('تم إنشاء الحساب بنجاح! يتم توجيهك...')
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب. حاول مرة أخرى.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">أنشئ حسابك</h1>
          <p className="text-gray-600">انضم إلى مجتمع احجزلي واستمتع بتجربة الحجز السهلة</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-700 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <Input
              label="الاسم الكامل"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="أحمد محمد"
              icon={<User className="h-5 w-5" />}
              required
              fullWidth
            />

            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              icon={<Mail className="h-5 w-5" />}
              required
              fullWidth
            />

            <Input
              label="كلمة المرور"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              required
              fullWidth
            />

            <Input
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              required
              fullWidth
            />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${formData.password.length >= 6 ? 'bg-secondary-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">6 أحرف على الأقل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'bg-secondary-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">كلمتا المرور متطابقتان</span>
              </div>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link 
                href="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                سجل دخولك
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">أو</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => router.push('/fields')}
              >
                تصفح الملاعب كزائر
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            بالتسجيل فإنك توافق على{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              الشروط والأحكام
            </Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
