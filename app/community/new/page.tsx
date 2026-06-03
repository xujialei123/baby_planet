'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'

interface Circle {
  id: string
  name: string
  icon: string | null
}

const POST_TYPES = [
  { value: 'DISCUSSION', label: '💬 讨论', description: '分享想法' },
  { value: 'QUESTION', label: '❓ 求助', description: '寻求帮助' },
  { value: 'EXPERIENCE', label: '📝 经验', description: '分享经验' },
  { value: 'MILESTONE', label: '🎉 里程碑', description: '记录成长' },
]

export default function NewPostPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [circles, setCircles] = useState<Circle[]>([])
  const [form, setForm] = useState({
    circleId: '',
    type: 'DISCUSSION',
    title: '',
    content: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/community/new')
    }
  }, [user, authLoading, router])

  // 获取圈子列表
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        // 使用默认圈子，因为没有圈子API
        setCircles([
          { id: 'newborn', name: '新手妈妈', icon: '👶' },
          { id: 'food', name: '辅食交流', icon: '🍚' },
          { id: 'sleep', name: '睡眠训练', icon: '😴' },
          { id: 'education', name: '早教分享', icon: '📚' },
        ])
      } catch (error) {
        console.error('获取圈子失败:', error)
      }
    }

    fetchCircles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '发帖失败')
      }

      router.push('/community')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">✏️</div>
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
      <PageHeader title="发帖" showBack />

      <div className="p-4">
        <Card variant="outlined" padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-sm bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 选择圈子 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                发布到
              </label>
              <div className="flex gap-2 overflow-x-auto">
                {circles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    onClick={() => setForm({ ...form, circleId: circle.id })}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-all ${
                      form.circleId === circle.id
                        ? 'bg-primary-300 text-white'
                        : 'border border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {circle.icon} {circle.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 帖子类型 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POST_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: type.value })}
                    className={`rounded-sm border-2 p-2 text-left transition-all ${
                      form.type === type.value
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-neutral-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{type.label}</span>
                    <p className="text-xs text-neutral-500">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="标题"
              placeholder="输入帖子标题"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                内容
              </label>
              <textarea
                className="h-40 w-full rounded-sm border border-neutral-300 p-3 text-base transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="分享你的育儿经验、问题或喜悦..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </div>

            <div className="rounded-sm bg-neutral-50 p-2 text-xs text-neutral-500">
              💡 内容将经过自动审核，违规内容将被拦截
            </div>

            <Button type="submit" loading={loading}>
              发布
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
