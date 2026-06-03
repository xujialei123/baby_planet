'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Badge } from '@/components/ui'

const CATEGORY_CONFIG = {
  MOTOR: { label: '大运动', icon: '🏃', color: 'primary' as const },
  LANGUAGE: { label: '语言', icon: '🗣️', color: 'mint' as const },
  COGNITIVE: { label: '认知', icon: '🧠', color: 'lavender' as const },
  SOCIAL: { label: '社交', icon: '👋', color: 'honey' as const },
}

const MILESTONES = [
  { id: '1', category: 'MOTOR', title: '抬头', description: '俯卧时能抬头45度', typicalAgeMonths: 2, achieved: true, achievedAt: '2025-03-15' },
  { id: '2', category: 'MOTOR', title: '翻身', description: '能从仰卧翻到俯卧', typicalAgeMonths: 4, achieved: true, achievedAt: '2025-05-20' },
  { id: '3', category: 'MOTOR', title: '独坐', description: '能独立坐稳', typicalAgeMonths: 6, achieved: false },
  { id: '4', category: 'MOTOR', title: '爬行', description: '能手膝爬行', typicalAgeMonths: 8, achieved: false },
  { id: '5', category: 'LANGUAGE', title: '咿呀学语', description: '能发出"ba"、"ma"等音节', typicalAgeMonths: 6, achieved: true, achievedAt: '2025-07-10' },
  { id: '6', category: 'LANGUAGE', title: '叫爸妈', description: '有意识地叫"爸爸"、"妈妈"', typicalAgeMonths: 10, achieved: false },
  { id: '7', category: 'COGNITIVE', title: '认生', description: '能区分熟悉和陌生面孔', typicalAgeMonths: 6, achieved: true, achievedAt: '2025-07-15' },
  { id: '8', category: 'SOCIAL', title: '社交微笑', description: '看到人会微笑', typicalAgeMonths: 2, achieved: true, achievedAt: '2025-03-10' },
]

export default function MilestonesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [filter, setFilter] = useState<string | null>(null)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/milestones`)
    }
  }, [user, authLoading, router, params.id])

  const filtered = filter
    ? MILESTONES.filter((m) => m.category === filter)
    : MILESTONES

  const achievedCount = MILESTONES.filter((m) => m.achieved).length

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎯</div>
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
      <PageHeader title="发育里程碑" showBack />

      {/* 进度卡片 */}
      <div className="mx-4 mb-4">
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <p className="text-4xl">🎯</p>
            <h2 className="mt-2 text-xl font-bold text-neutral-800">
              已达成 {achievedCount}/{MILESTONES.length}
            </h2>
            <div className="mx-auto mt-3 h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-primary-300 transition-all"
                style={{ width: `${(achievedCount / MILESTONES.length) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        <button
          onClick={() => setFilter(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            filter === null
              ? 'bg-primary-300 text-white'
              : 'border border-neutral-200 text-neutral-600'
          }`}
        >
          全部
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              filter === key
                ? 'bg-primary-300 text-white'
                : 'border border-neutral-200 text-neutral-600'
            }`}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>

      {/* 里程碑列表 */}
      <div className="px-4">
        <div className="flex flex-col gap-2">
          {filtered.map((milestone) => {
            const config = CATEGORY_CONFIG[milestone.category as keyof typeof CATEGORY_CONFIG]
            return (
              <Card
                key={milestone.id}
                variant={milestone.achieved ? 'elevated' : 'outlined'}
                padding="sm"
                className={milestone.achieved ? 'border-mint-200 bg-mint-50' : ''}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                    milestone.achieved ? 'bg-mint-200' : 'bg-neutral-100'
                  }`}>
                    {milestone.achieved ? '✅' : config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800">
                        {milestone.title}
                      </span>
                      <Badge variant={config.color} size="sm">
                        {config.label}
                      </Badge>
                      <span className="text-xs text-neutral-400">
                        {milestone.typicalAgeMonths}月龄
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {milestone.description}
                    </p>
                    {milestone.achieved && milestone.achievedAt && (
                      <p className="mt-1 text-xs text-mint-600">
                        ✅ {milestone.achievedAt} 达成
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
