'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'

export default function AddBabyPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [form, setForm] = useState({
    name: '',
    gender: 'FEMALE',
    birthday: '',
    bloodType: '',
    birthWeight: '',
    birthHeight: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/baby/new')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/baby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          gender: form.gender,
          birthday: form.birthday,
          bloodType: form.bloodType || undefined,
          birthWeight: form.birthWeight ? parseFloat(form.birthWeight) : undefined,
          birthHeight: form.birthHeight ? parseFloat(form.birthHeight) : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '添加宝宝失败')
      }

      router.push('/baby')
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
          <div className="mb-4 text-4xl">👶</div>
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
      <PageHeader title="添加宝宝" showBack />
      <div className="p-4">
        <Card variant="outlined" padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="mb-4 text-center">
              <p className="text-4xl">👶</p>
              <p className="mt-2 text-sm text-neutral-500">
                填写宝宝的基本信息
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              label="宝宝姓名"
              placeholder="小名或昵称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                性别
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'FEMALE', label: '👧 女孩', color: 'primary' },
                  { value: 'MALE', label: '👦 男孩', color: 'mint' },
                  { value: 'OTHER', label: '🤷 其他', color: 'lavender' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, gender: opt.value })}
                    className={`flex-1 rounded-sm border-2 py-2.5 text-sm font-medium transition-all ${
                      form.gender === opt.value
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="生日"
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                血型（选填）
              </label>
              <div className="flex gap-2">
                {['A', 'B', 'AB', 'O', '未知'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, bloodType: type })}
                    className={`flex-1 rounded-sm border-2 py-2 text-sm font-medium transition-all ${
                      form.bloodType === type
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="出生体重 (kg)"
                type="number"
                step="0.01"
                placeholder="3.5"
                value={form.birthWeight}
                onChange={(e) =>
                  setForm({ ...form, birthWeight: e.target.value })
                }
              />
              <Input
                label="出生身高 (cm)"
                type="number"
                step="0.1"
                placeholder="50"
                value={form.birthHeight}
                onChange={(e) =>
                  setForm({ ...form, birthHeight: e.target.value })
                }
              />
            </div>

            <Button type="submit" loading={loading} className="mt-2">
              添加宝宝
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
