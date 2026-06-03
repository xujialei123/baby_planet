'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'

// 模拟生长数据
const MOCK_GROWTH_DATA = [
  { date: '2025-01', weight: 3.5, height: 50, weightP: 50, heightP: 55 },
  { date: '2025-02', weight: 4.2, height: 54, weightP: 55, heightP: 50 },
  { date: '2025-03', weight: 5.1, height: 58, weightP: 60, heightP: 52 },
  { date: '2025-04', weight: 5.8, height: 61, weightP: 58, heightP: 55 },
  { date: '2025-05', weight: 6.3, height: 63, weightP: 55, heightP: 50 },
  { date: '2025-06', weight: 6.8, height: 65, weightP: 52, heightP: 48 },
]

export default function GrowthPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [newRecord, setNewRecord] = useState({
    date: '',
    weight: '',
    height: '',
    headCircumference: '',
  })

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/growth`)
    }
  }, [user, authLoading, router, params.id])

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">📈</div>
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
        title="生长曲线"
        showBack
        action={
          <Button size="sm" onClick={() => setShowAdd(true)}>
            + 记录
          </Button>
        }
      />

      {/* 最新数据卡片 */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-xs text-neutral-500">体重</p>
          <p className="text-xl font-bold text-primary-600">6.8</p>
          <p className="text-xs text-neutral-400">kg · P52</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-xs text-neutral-500">身高</p>
          <p className="text-xl font-bold text-mint-600">65</p>
          <p className="text-xs text-neutral-400">cm · P48</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-xs text-neutral-500">头围</p>
          <p className="text-xl font-bold text-lavender-600">42</p>
          <p className="text-xs text-neutral-400">cm · P50</p>
        </Card>
      </div>

      {/* 体重曲线图 */}
      <div className="px-4 pb-4">
        <Card variant="outlined" padding="md">
          <h3 className="mb-3 font-semibold text-neutral-700">体重变化趋势</h3>
          <div className="flex items-end justify-between gap-1" style={{ height: '160px' }}>
            {MOCK_GROWTH_DATA.map((item, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-neutral-500">{item.weight}kg</span>
                <div
                  className="w-full rounded-t-sm bg-primary-300 transition-all"
                  style={{ height: `${(item.weight / 10) * 140}px` }}
                />
                <span className="text-[10px] text-neutral-400">
                  {item.date.split('-')[1]}月
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 百分位说明 */}
      <div className="px-4 pb-4">
        <Card variant="outlined" padding="md">
          <h3 className="mb-2 font-semibold text-neutral-700">百分位说明</h3>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded-full bg-primary-200" />
              <span>P3-P15：偏小，建议咨询医生</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded-full bg-primary-300" />
              <span>P15-P85：正常范围</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded-full bg-primary-400" />
              <span>P85-P97：偏大，建议咨询医生</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 历史记录 */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">历史记录</h3>
        <div className="flex flex-col gap-2">
          {MOCK_GROWTH_DATA.reverse().map((item, index) => (
            <Card key={index} variant="outlined" padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  {item.date}
                </span>
                <div className="flex gap-4 text-sm text-neutral-500">
                  <span>{item.weight}kg</span>
                  <span>{item.height}cm</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 添加记录浮层 */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-screen-sm rounded-t-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">记录生长数据</h3>
              <button onClick={() => setShowAdd(false)} className="text-neutral-400">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                label="日期"
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="体重 (kg)"
                  type="number"
                  step="0.01"
                  placeholder="6.8"
                  value={newRecord.weight}
                  onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                />
                <Input
                  label="身高 (cm)"
                  type="number"
                  step="0.1"
                  placeholder="65"
                  value={newRecord.height}
                  onChange={(e) => setNewRecord({ ...newRecord, height: e.target.value })}
                />
              </div>
              <Input
                label="头围 (cm)"
                type="number"
                step="0.1"
                placeholder="42"
                value={newRecord.headCircumference}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, headCircumference: e.target.value })
                }
              />
              <Button onClick={() => setShowAdd(false)}>保存</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
