'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'

export default function ReportPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })
  const [generating, setGenerating] = useState(false)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/tools/report')
    }
  }, [user, authLoading, router])

  const handleGenerate = async () => {
    setGenerating(true)
    // TODO: 调用 API 生成 PDF
    setTimeout(() => {
      setGenerating(false)
      alert('报告生成完成！')
    }, 2000)
  }

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">📊</div>
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
      <PageHeader title="成长报告" showBack />

      <div className="p-4">
        {/* 报告类型 */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-600">报告类型</h3>
          <div className="grid grid-cols-2 gap-2">
            <Card variant="elevated" padding="sm" className="cursor-pointer text-center">
              <p className="text-2xl">📊</p>
              <p className="text-sm font-medium text-neutral-700">月度报告</p>
              <p className="text-xs text-neutral-500">包含所有记录统计</p>
            </Card>
            <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
              <p className="text-2xl">📈</p>
              <p className="text-sm font-medium text-neutral-700">生长报告</p>
              <p className="text-xs text-neutral-500">生长曲线与百分位</p>
            </Card>
            <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
              <p className="text-2xl">💉</p>
              <p className="text-sm font-medium text-neutral-700">疫苗报告</p>
              <p className="text-xs text-neutral-500">接种记录与计划</p>
            </Card>
            <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
              <p className="text-2xl">🎯</p>
              <p className="text-sm font-medium text-neutral-700">里程碑报告</p>
              <p className="text-xs text-neutral-500">发育里程碑达成</p>
            </Card>
          </div>
        </div>

        {/* 时间范围 */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-600">时间范围</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="开始日期"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <Input
              label="结束日期"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {/* 预览 */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-600">报告预览</h3>
          <Card variant="outlined" padding="lg">
            <div className="text-center">
              <p className="text-5xl">📄</p>
              <h4 className="mt-3 text-lg font-bold text-neutral-800">
                小豆豆的月度成长报告
              </h4>
              <p className="mt-1 text-sm text-neutral-500">
                2025年6月 · 包含所有成长记录
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-primary-600">4</p>
                  <p className="text-xs text-neutral-500">次喂养/天</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-lavender-600">3h</p>
                  <p className="text-xs text-neutral-500">平均睡眠</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-mint-600">5</p>
                  <p className="text-xs text-neutral-500">次换尿布/天</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Button
          className="w-full"
          loading={generating}
          onClick={handleGenerate}
        >
          📄 生成 PDF 报告
        </Button>
      </div>
    </div>
  )
}
