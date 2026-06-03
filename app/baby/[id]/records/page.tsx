'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'

interface DailyRecord {
  id: string
  type: string
  startTime: string
  endTime: string | null
  data: any
  notes: string | null
}

const RECORD_CONFIG: { [key: string]: { icon: string; label: string; color: 'primary' | 'lavender' | 'mint' | 'honey' | 'danger' } } = {
  FEEDING: { icon: '🍼', label: '喂养', color: 'primary' },
  SLEEP: { icon: '😴', label: '睡眠', color: 'lavender' },
  DIAPER: { icon: '👶', label: '尿布', color: 'mint' },
  MEDICINE: { icon: '💊', label: '用药', color: 'honey' },
  TEMPERATURE: { icon: '🌡️', label: '体温', color: 'danger' },
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function calculateDuration(start: string, end: string | null) {
  if (!end) return null
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(diff / 60000)
  return mins
}

export default function RecordsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/records`)
    }
  }, [user, authLoading, router, params.id])

  // 获取记录列表
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await fetch(`/api/records?babyId=${params.id}&date=${today}`)
        if (response.ok) {
          const data = await response.json()
          setRecords(data.records || [])
        }
      } catch (error) {
        console.error('获取记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchRecords()
    }
  }, [user, params.id])

  // 快速添加记录
  const handleQuickAdd = async (type: string) => {
    setAddLoading(true)
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: params.id,
          type,
          startTime: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const newRecord = await response.json()
        setRecords([newRecord, ...records])
        setShowQuickAdd(false)
      }
    } catch (error) {
      console.error('添加记录失败:', error)
    } finally {
      setAddLoading(false)
    }
  }

  // 统计今日数据
  const todayStats = {
    feedings: records.filter(r => r.type === 'FEEDING').length,
    sleepMinutes: records
      .filter(r => r.type === 'SLEEP')
      .reduce((acc, r) => acc + (calculateDuration(r.startTime, r.endTime) || 0), 0),
    diapers: records.filter(r => r.type === 'DIAPER').length,
  }

  // 加载中显示
  if (authLoading || loading) {
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
        title="今日记录"
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
          <p className="text-lg font-bold text-primary-600">{todayStats.feedings}</p>
          <p className="text-xs text-neutral-500">次喂养</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">😴</p>
          <p className="text-lg font-bold text-lavender-600">
            {todayStats.sleepMinutes >= 60
              ? `${Math.floor(todayStats.sleepMinutes / 60)}小时`
              : `${todayStats.sleepMinutes}分钟`}
          </p>
          <p className="text-xs text-neutral-500">总睡眠</p>
        </Card>
        <Card variant="elevated" padding="sm" className="text-center">
          <p className="text-2xl">👶</p>
          <p className="text-lg font-bold text-mint-600">{todayStats.diapers}</p>
          <p className="text-xs text-neutral-500">次换尿布</p>
        </Card>
      </div>

      {/* 快捷添加按钮 */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(RECORD_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => handleQuickAdd(type)}
              disabled={addLoading}
              className="flex min-w-[80px] flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition-all hover:border-primary-300 hover:shadow-card disabled:opacity-50"
            >
              <span className="text-xl">{config.icon}</span>
              <span className="text-xs font-medium text-neutral-700">
                {config.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 今日记录列表 */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">今日记录</h3>
        <div className="flex flex-col gap-2">
          {records.length > 0 ? (
            records.map((record) => {
              const config = RECORD_CONFIG[record.type] || RECORD_CONFIG.FEEDING
              const duration = calculateDuration(record.startTime, record.endTime)
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
                          {formatTime(record.startTime)}
                        </Badge>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-neutral-500">{record.notes}</p>
                      )}
                    </div>
                    {duration && (
                      <span className="text-sm font-medium text-neutral-600">
                        {duration}分钟
                      </span>
                    )}
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-4xl">📝</p>
              <p className="mt-2 text-sm text-neutral-500">
                今天还没有记录，点击上方按钮添加
              </p>
            </div>
          )}
        </div>
      </div>

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
