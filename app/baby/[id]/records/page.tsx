'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'

type RecordType = 'FEEDING' | 'SLEEP' | 'DIAPER' | 'MEDICINE' | 'TEMPERATURE'

const RECORD_CONFIG = {
  FEEDING: { icon: '🍼', label: '喂养', color: 'primary' as const },
  SLEEP: { icon: '😴', label: '睡眠', color: 'lavender' as const },
  DIAPER: { icon: '👶', label: '尿布', color: 'mint' as const },
  MEDICINE: { icon: '💊', label: '用药', color: 'honey' as const },
  TEMPERATURE: { icon: '🌡️', label: '体温', color: 'danger' as const },
}

// 模拟今日记录
const MOCK_RECORDS = [
  { id: '1', type: 'FEEDING' as RecordType, time: '08:30', duration: 25, notes: '母乳喂养' },
  { id: '2', type: 'DIAPER' as RecordType, time: '09:15', notes: '换尿布' },
  { id: '3', type: 'SLEEP' as RecordType, time: '10:00', duration: 90, notes: '上午小睡' },
  { id: '4', type: 'FEEDING' as RecordType, time: '12:00', duration: 20, notes: '母乳喂养' },
]

const TODAY_STATS = {
  feedings: 4,
  sleepMinutes: 180,
  diapers: 5,
}

export default function RecordsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/records`)
    }
  }, [user, authLoading, router, params.id])

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">📝</div>
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
      <PageHeader
        title="小豆豆的记录"
        subtitle="今天"
        showBack
        action={
          <Link href={`/baby/${params.id}/growth`}>
            <Button variant="ghost" size="sm">📈 生长曲线</Button>
          </Link>
        }
      />

      {/* 今日统计 */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">🍼</p>
          <p className="text-lg font-bold text-primary-600">{TODAY_STATS.feedings}</p>
          <p className="text-xs text-neutral-500">次喂养</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">😴</p>
          <p className="text-lg font-bold text-lavender-600">3小时</p>
          <p className="text-xs text-neutral-500">总睡眠</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">👶</p>
          <p className="text-lg font-bold text-mint-600">{TODAY_STATS.diapers}</p>
          <p className="text-xs text-neutral-500">次换尿布</p>
        </Card>
      </div>

      {/* 快捷添加按钮 */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.entries(RECORD_CONFIG) as [RecordType, typeof RECORD_CONFIG.FEEDING][]).map(
            ([type, config]) => (
              <button
                key={type}
                onClick={() => setShowQuickAdd(true)}
                className="flex min-w-[80px] flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition-all hover:border-primary-300 hover:shadow-card"
              >
                <span className="text-xl">{config.icon}</span>
                <span className="text-xs font-medium text-neutral-700">
                  {config.label}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 今日记录列表 */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">今日记录</h3>
        <div className="flex flex-col gap-2">
          {MOCK_RECORDS.map((record) => {
            const config = RECORD_CONFIG[record.type]
            return (
              <Card key={record.id} variant="outlined" padding="sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-lg">
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800">
                        {config.label}
                      </span>
                      <Badge variant={config.color} size="sm">
                        {record.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-500">{record.notes}</p>
                  </div>
                  {record.duration && (
                    <span className="text-sm font-medium text-neutral-600">
                      {record.duration}分钟
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 快捷添加浮层 */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-screen-sm rounded-t-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">快速记录</h3>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="text-neutral-400"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" className="gap-2">
                🍼 喂养
              </Button>
              <Button variant="secondary" className="gap-2">
                😴 睡眠
              </Button>
              <Button variant="secondary" className="gap-2">
                👶 换尿布
              </Button>
              <Button variant="secondary" className="gap-2">
                🌡️ 体温
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-100 bg-white safe-bottom">
        <div className="mx-auto flex max-w-screen-sm items-center justify-around py-2">
          <Link href={`/baby/${params.id}/records`} className="flex flex-col items-center text-primary-500">
            <span className="text-lg">📝</span>
            <span className="text-xs font-medium">记录</span>
          </Link>
          <Link href={`/baby/${params.id}/growth`} className="flex flex-col items-center text-neutral-400">
            <span className="text-lg">📈</span>
            <span className="text-xs font-medium">生长</span>
          </Link>
          <Link href={`/baby/${params.id}/vaccines`} className="flex flex-col items-center text-neutral-400">
            <span className="text-lg">💉</span>
            <span className="text-xs font-medium">疫苗</span>
          </Link>
          <Link href={`/baby/${params.id}/album`} className="flex flex-col items-center text-neutral-400">
            <span className="text-lg">📷</span>
            <span className="text-xs font-medium">相册</span>
          </Link>
          <Link href={`/baby/${params.id}/milestones`} className="flex flex-col items-center text-neutral-400">
            <span className="text-lg">🎯</span>
            <span className="text-xs font-medium">里程碑</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
