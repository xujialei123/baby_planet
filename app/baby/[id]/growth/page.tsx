'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'

interface GrowthRecord {
  id: string
  date: string
  weight: number | null
  height: number | null
  headCircumference: number | null
  weightPercentile: number | null
  heightPercentile: number | null
  headPercentile: number | null
}

export default function GrowthPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [records, setRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
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

  // 获取生长记录
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`/api/growth?babyId=${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setRecords(data || [])
        }
      } catch (error) {
        console.error('获取生长记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRecords()
    }
  }, [user, params.id])

  // 添加生长记录
  const handleAddRecord = async () => {
    setAddLoading(true)
    try {
      const response = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: params.id,
          date: newRecord.date,
          weight: newRecord.weight ? parseFloat(newRecord.weight) : undefined,
          height: newRecord.height ? parseFloat(newRecord.height) : undefined,
          headCircumference: newRecord.headCircumference ? parseFloat(newRecord.headCircumference) : undefined,
        }),
      })

      if (response.ok) {
        const record = await response.json()
        setRecords([...records, record])
        setShowAdd(false)
        setNewRecord({
          date: new Date().toISOString().split('T')[0],
          weight: '',
          height: '',
          headCircumference: '',
        })
      }
    } catch (error) {
      console.error('添加生长记录失败:', error)
    } finally {
      setAddLoading(false)
    }
  }

  // 获取最新记录
  const latestRecord = records.length > 0 ? records[records.length - 1] : null

  // 加载中显示
  if (authLoading || loading) {
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
          <p className="text-xl font-bold text-primary-600">
            {latestRecord?.weight ?? '--'}
          </p>
          <p className="text-xs text-neutral-400">
            kg {latestRecord?.weightPercentile ? `· P${latestRecord.weightPercentile}` : ''}
          </p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-xs text-neutral-500">身高</p>
          <p className="text-xl font-bold text-mint-600">
            {latestRecord?.height ?? '--'}
          </p>
          <p className="text-xs text-neutral-400">
            cm {latestRecord?.heightPercentile ? `· P${latestRecord.heightPercentile}` : ''}
          </p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-xs text-neutral-500">头围</p>
          <p className="text-xl font-bold text-lavender-600">
            {latestRecord?.headCircumference ?? '--'}
          </p>
          <p className="text-xs text-neutral-400">
            cm {latestRecord?.headPercentile ? `· P${latestRecord.headPercentile}` : ''}
          </p>
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
          {records.length > 0 ? (
            records.reverse().map((record) => (
              <Card key={record.id} variant="outlined" padding="sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">
                    {new Date(record.date).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex gap-4 text-sm text-neutral-500">
                    {record.weight && <span>{record.weight}kg</span>}
                    {record.height && <span>{record.height}cm</span>}
                    {record.headCircumference && <span>头围{record.headCircumference}cm</span>}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-4xl">📈</p>
              <p className="mt-2 text-sm text-neutral-500">
                还没有生长记录，点击上方按钮添加
              </p>
            </div>
          )}
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
              <Button onClick={handleAddRecord} loading={addLoading}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
