'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.error) setError(result.error);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">تسجيل الدخول</h1>

      {error && <p className="text-red-500">{error}</p>}

      <Input label="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <Button onClick={handleLogin} className="w-full mt-4">
        تسجيل الدخول
      </Button>
    </div>
  );
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email || !formData.password) {
      setError('البريد الإلكتروني وكلمة المرور مطلوبان')
      return
    }

    try {
      await login(formData.email, formData.password)
      setSuccess('تم تسجيل الدخول بنجاح! يتم توجيهك...')
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بعودتك!</h1>
          <p className="text-gray-600">سجل دخولك للوصول إلى حسابك</p>
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
              <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-200 text-secondary-700">
                <span className="text-sm">{success}</span>
              </div>
            )}

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

            <div>
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
              <div className="mt-2 text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <Link 
                href="/register" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                أنشئ حساب جديد
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/fields')}
              >
                تصفح الملاعب
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/')}
              >
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
