'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'

interface VaccineRecord {
  id: string
  status: string
  scheduledDate: string | null
  actualDate: string | null
  notes: string | null
  hospital: string | null
  vaccine: {
    id: string
    name: string
    description: string | null
    recommendedAgeMonths: number
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: 'mint' | 'honey' | 'default' | 'danger'; icon: string }> = {
  completed: { label: '已接种', color: 'mint', icon: '✅' },
  upcoming: { label: '即将到期', color: 'honey', icon: '⏰' },
  pending: { label: '待接种', color: 'default', icon: '⏳' },
  overdue: { label: '已过期', color: 'danger', icon: '⚠️' },
}

export default function VaccinesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([])
  const [loading, setLoading] = useState(true)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/vaccines`)
    }
  }, [user, authLoading, router, params.id])

  // 获取疫苗记录
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await fetch(`/api/vaccines?babyId=${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setVaccines(data || [])
        }
      } catch (error) {
        console.error('获取疫苗记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchVaccines()
    }
  }, [user, params.id])

  // 标记已接种
  const handleMarkCompleted = async (id: string) => {
    try {
      const response = await fetch(`/api/vaccines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          actualDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setVaccines(vaccines.map(v =>
          v.id === id ? { ...v, status: 'completed', actualDate: new Date().toISOString() } : v
        ))
      }
    } catch (error) {
      console.error('更新疫苗状态失败:', error)
    }
  }

  const upcomingCount = vaccines.filter((v) => v.status === 'upcoming' || v.status === 'overdue').length
  const completedCount = vaccines.filter((v) => v.status === 'completed').length
  const pendingCount = vaccines.filter((v) => v.status === 'pending').length

  // 加载中显示
  if (authLoading || loading) {
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
          <p className="text-lg font-bold text-mint-600">{completedCount}</p>
          <p className="text-xs text-neutral-500">已接种</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">⏰</p>
          <p className="text-lg font-bold text-honey-600">{upcomingCount}</p>
          <p className="text-xs text-neutral-500">待处理</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">⏳</p>
          <p className="text-lg font-bold text-neutral-600">{pendingCount}</p>
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
                有 {upcomingCount} 个疫苗需要处理
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
          {vaccines.length > 0 ? (
            vaccines.map((record) => {
              const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending
              return (
                <Card key={record.id} variant="outlined" padding="sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-lg">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-800">
                          {record.vaccine?.name || '未知疫苗'}
                        </span>
                        <Badge variant={config.color}>{config.label}</Badge>
                      </div>
                      {record.scheduledDate && (
                        <p className="text-sm text-neutral-500">
                          计划时间：{new Date(record.scheduledDate).toLocaleDateString('zh-CN')}
                        </p>
                      )}
                      {record.hospital && (
                        <p className="text-xs text-neutral-400">
                          📍 {record.hospital}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    {(record.status === 'upcoming' || record.status === 'overdue') && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkCompleted(record.id)}>
                        标记已接种
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-4xl">💉</p>
              <p className="mt-2 text-sm text-neutral-500">
                暂无疫苗计划
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
