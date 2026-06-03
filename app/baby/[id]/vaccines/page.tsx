'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'

// 模拟疫苗数据
const MOCK_VACCINES = [
  { id: '1', name: '乙肝疫苗', age: '出生', status: 'completed', date: '2025-01-15', hospital: '市妇幼保健院' },
  { id: '2', name: '卡介苗', age: '出生', status: 'completed', date: '2025-01-15', hospital: '市妇幼保健院' },
  { id: '3', name: '脊灰疫苗(第1剂)', age: '2月龄', status: 'completed', date: '2025-03-15', hospital: '社区卫生中心' },
  { id: '4', name: '百白破疫苗(第1剂)', age: '3月龄', status: 'completed', date: '2025-04-15', hospital: '社区卫生中心' },
  { id: '5', name: '脊灰疫苗(第2剂)', age: '3月龄', status: 'upcoming', date: '2025-07-15', hospital: '' },
  { id: '6', name: '百白破疫苗(第2剂)', age: '4月龄', status: 'pending', date: '2025-08-15', hospital: '' },
  { id: '7', name: '乙肝疫苗(第2剂)', age: '1月龄', status: 'pending', date: '2025-09-15', hospital: '' },
]

const STATUS_CONFIG = {
  completed: { label: '已接种', color: 'mint' as const, icon: '✅' },
  upcoming: { label: '即将到期', color: 'honey' as const, icon: '⏰' },
  pending: { label: '待接种', color: 'default' as const, icon: '⏳' },
  overdue: { label: '已过期', color: 'danger' as const, icon: '⚠️' },
}

export default function VaccinesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [vaccines] = useState(MOCK_VACCINES)
  const upcomingCount = vaccines.filter((v) => v.status === 'upcoming').length

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/vaccines`)
    }
  }, [user, authLoading, router, params.id])

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">💉</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录不显示内容
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PageHeader title="疫苗管理" showBack />

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">✅</p>
          <p className="text-lg font-bold text-mint-600">
            {vaccines.filter((v) => v.status === 'completed').length}
          </p>
          <p className="text-xs text-neutral-500">已接种</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">⏰</p>
          <p className="text-lg font-bold text-honey-600">{upcomingCount}</p>
          <p className="text-xs text-neutral-500">即将到期</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">⏳</p>
          <p className="text-lg font-bold text-neutral-600">
            {vaccines.filter((v) => v.status === 'pending').length}
          </p>
          <p className="text-xs text-neutral-500">待接种</p>
        </Card>
      </div>

      {/* 即将到期提醒 */}
      {upcomingCount > 0 && (
        <div className="mx-4 mb-4 rounded-lg border border-honey-200 bg-honey-50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏰</span>
            <div>
              <p className="font-semibold text-honey-800">
                有 {upcomingCount} 个疫苗即将到期
              </p>
              <p className="text-sm text-honey-600">
                请及时带宝宝前往接种
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 疫苗列表 */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">接种计划</h3>
        <div className="flex flex-col gap-2">
          {vaccines.map((vaccine) => {
            const config = STATUS_CONFIG[vaccine.status as keyof typeof STATUS_CONFIG]
            return (
              <Card key={vaccine.id} variant="outlined" padding="sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-lg">
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800">
                        {vaccine.name}
                      </span>
                      <Badge variant={config.color}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">
                      推荐时间：{vaccine.age} · {vaccine.date}
                    </p>
                    {vaccine.hospital && (
                      <p className="text-xs text-neutral-400">
                        📍 {vaccine.hospital}
                      </p>
                    )}
                  </div>
                  {vaccine.status === 'upcoming' && (
                    <Button size="sm" variant="ghost">
                      标记已接种
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
