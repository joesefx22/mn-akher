'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

interface PlatformStats {
  totalUsers: number
  totalFields: number
  totalBookings: number
  totalRevenue: number
  activeToday: number
  pendingApprovals: number
}

interface RecentActivity {
  id: string
  type: 'USER_REGISTER' | 'FIELD_ADDED' | 'BOOKING_CREATED' | 'PAYMENT_RECEIVED' | 'SUPPORT_TICKET'
  user: string
  description: string
  timestamp: string
  status: 'SUCCESS' | 'WARNING' | 'ERROR'
}

interface PendingApproval {
  id: string
  type: 'FIELD' | 'OWNER' | 'EMPLOYEE'
  name: string
  submittedBy: string
  submittedAt: string
  details: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalFields: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeToday: 0,
    pendingApprovals: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [systemHealth, setSystemHealth] = useState({
    status: 'HEALTHY' as 'HEALTHY' | 'WARNING' | 'CRITICAL',
    uptime: '99.9%',
    responseTime: '120ms',
    lastIncident: '3 أيام'
  })

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard/player')
      return
    }
    fetchAdminData()
  }, [user])

  const fetchAdminData = async () => {
    setLoading(true)
    
    try {
      // Mock data for admin
      const mockStats: PlatformStats = {
        totalUsers: 1245,
        totalFields: 48,
        totalBookings: 8924,
        totalRevenue: 1784800,
        activeToday: 342,
        pendingApprovals: 7
      }

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'USER_REGISTER',
          user: 'أحمد محمد',
          description: 'تسجيل مستخدم جديد',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
          status: 'SUCCESS'
        },
        {
          id: '2',
          type: 'FIELD_ADDED',
          user: 'محمد علي',
          description: 'إضافة ملعب جديد',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
          status: 'SUCCESS'
        },
        {
          id: '3',
          type: 'BOOKING_CREATED',
          user: 'سعيد محمود',
          description: 'حجز جديد بقيمة 200 ج',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          status: 'SUCCESS'
        },
        {
          id: '4',
          type: 'PAYMENT_RECEIVED',
          user: 'مصطفى أحمد',
          description: 'دفع حجز منتظر',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          status: 'SUCCESS'
        },
        {
          id: '5',
          type: 'SUPPORT_TICKET',
          user: 'خالد سامي',
          description: 'تذكرة دعم جديدة',
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          status: 'WARNING'
        }
      ]

      const mockApprovals: PendingApproval[] = [
        {
          id: '1',
          type: 'FIELD',
          name: 'ملعب الأحلام الجديد',
          submittedBy: 'أحمد صاحب',
          submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          details: 'طلب إضافة ملعب كرة قدم في المقطم'
        },
        {
          id: '2',
          type: 'OWNER',
          name: 'محمد حسين',
          submittedBy: 'محمد حسين',
          submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          details: 'طلب تسجيل كصاحب ملعب'
        },
        {
          id: '3',
          type: 'EMPLOYEE',
          name: 'سامي عبدالله',
          submittedBy: 'أحمد صاحب',
          submittedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          details: 'طلب تعيين موظف لملعب النجوم'
        }
      ]

      setStats(mockStats)
      setRecentActivities(mockActivities)
      setPendingApprovals(mockApprovals)

    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-EG') + ' ج'
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `منذ ${diffMins} دقيقة`
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`
    } else {
      return `منذ ${diffDays} يوم`
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTER': return <Users className="h-5 w-5" />
      case 'FIELD_ADDED': return <Building className="h-5 w-5" />
      case 'BOOKING_CREATED': return <DollarSign className="h-5 w-5" />
      case 'PAYMENT_RECEIVED': return <TrendingUp className="h-5 w-5" />
      case 'SUPPORT_TICKET': return <AlertCircle className="h-5 w-5" />
      default: return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-secondary-600" />
      case 'WARNING': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'ERROR': return <XCircle className="h-5 w-5 text-danger-600" />
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const handleApprove = (approvalId: string) => {
    if (confirm('هل تريد الموافقة على هذا الطلب؟')) {
      // In production: API call to approve
      alert('تمت الموافقة على الطلب')
      fetchAdminData() // Refresh
    }
  }

  const handleReject = (approvalId: string) => {
    const reason = prompt('يرجى إدخال سبب الرفض:')
    if (reason) {
      // In production: API call to reject with reason
      alert('تم رفض الطلب')
      fetchAdminData() // Refresh
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            لوحة تحكم المسؤول، {user?.name} 🛡️
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة النظام بالكامل، المراقبة، والتحكم في جميع جوانب المنصة.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/settings')}
          >
            <Settings className="h-5 w-5 ml-2" />
            إعدادات النظام
          </Button>
          <Button 
            onClick={() => router.push('/admin/analytics')}
          >
            <BarChart3 className="h-5 w-5 ml-2" />
            التحليلات المتقدمة
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalUsers.toLocaleString('ar-EG')}
              </div>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-secondary-600">
            <TrendingUp className="h-4 w-4" />
            <span>+{Math.floor(stats.totalUsers * 0.05)} هذا الشهر</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الملاعب</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalFields}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            {stats.activeToday} نشط اليوم
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalBookings.toLocaleString('ar-EG')}
              </div>
            </div>
            <div className="p-3 bg-secondary-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            {formatCurrency(stats.totalRevenue)} إجمالي الإيرادات
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">طلبات بانتظار الموافقة</p>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingApprovals}
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => router.push('/admin/approvals')}
          >
            مراجعة الطلبات
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health & Recent Activities */}
        <div className="lg:col-span-2 space-y-8">
          {/* System Health */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">صحة النظام</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.status === 'HEALTHY' 
                  ? 'bg-green-100 text-green-800'
                  : systemHealth.status === 'WARNING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {systemHealth.status === 'HEALTHY' ? 'سليم' :
                 systemHealth.status === 'WARNING' ? 'تحذير' : 'حرج'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">معدل التشغيل</p>
                <div className="text-2xl font-bold text-gray-900">{systemHealth.uptime}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">زمن الاستجابة</p>
                <div className="text-2xl font-bold text-gray-900">{systemHealth.responseTime}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">آخر حادث</p>
                <div className="text-2xl font-bold text-gray-900">{systemHealth.lastIncident}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/admin/monitoring')}
                >
                  <Shield className="h-4 w-4 ml-2" />
                  مراقبة النظام
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/admin/logs')}
                >
                  سجلات النظام
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">النشاطات الحديثة</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/admin/activities')}
              >
                عرض الكل
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">بواسطة: {activity.user}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Approvals */}
        <div>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">طلبات بانتظار الموافقة</h2>
              <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {pendingApprovals.length}
              </span>
            </div>
            
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">لا توجد طلبات بانتظار الموافقة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            approval.type === 'FIELD' ? 'bg-blue-100 text-blue-700' :
                            approval.type === 'OWNER' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {approval.type === 'FIELD' ? 'ملعب' :
                             approval.type === 'OWNER' ? 'مالك' : 'موظف'}
                          </span>
                          <h4 className="font-semibold text-gray-900">{approval.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">مقدم من: {approval.submittedBy}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(approval.submittedAt)}
                        </p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">{approval.details}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleApprove(approval.id)}
                      >
                        الموافقة
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(approval.id)}
                      >
                        الرفض
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/approvals/${approval.id}`)}
                      >
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              fullWidth 
              className="mt-6"
              onClick={() => router.push('/admin/approvals')}
            >
              <ChevronRight className="h-4 w-4 ml-2" />
              عرض جميع الطلبات
            </Button>
          </Card>

          {/* Quick Admin Actions */}
          <Card className="p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إجراءات المسؤول</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="h-5 w-5 ml-2" />
                إدارة المستخدمين
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/admin/fields')}
              >
                <Building className="h-5 w-5 ml-2" />
                إدارة الملاعب
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/admin/finance')}
              >
                <DollarSign className="h-5 w-5 ml-2" />
                المالية والتقارير
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                className="justify-start"
                onClick={() => router.push('/admin/support')}
              >
                <AlertCircle className="h-5 w-5 ml-2" />
                إدارة الدعم
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Platform Analytics Preview */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">نظرة على تحليلات المنصة</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin/analytics')}
          >
            <BarChart3 className="h-4 w-4 ml-2" />
            تحليلات متقدمة
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">نمو المستخدمين</span>
              <span className="text-sm font-medium text-secondary-600">+12%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-secondary-500 rounded-full w-3/4"></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">نسبة الإشغال</span>
              <span className="text-sm font-medium text-secondary-600">68%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-primary-500 rounded-full w-2/3"></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">معدل النجاح</span>
              <span className="text-sm font-medium text-secondary-600">94%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-green-500 rounded-full w-[94%]"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">42%</div>
            <div className="text-sm text-gray-600">كرة قدم</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">58%</div>
            <div className="text-sm text-gray-600">بادل</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">35%</div>
            <div className="text-sm text-gray-600">المقطم</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">65%</div>
            <div className="text-sm text-gray-600">مدينة نصر</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
