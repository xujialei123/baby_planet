'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Button, Avatar, Badge, Input } from '@/components/ui'

interface Family {
  id: string
  name: string
  inviteCode: string
  role: string
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  babies: Array<{
    id: string
    name: string
    gender: string | null
    birthday: string | null
  }>
}

const ROLE_LABELS: Record<string, { label: string; color: 'primary' | 'lavender' | 'default' }> = {
  OWNER: { label: '管理员', color: 'primary' },
  ADMIN: { label: '副管理员', color: 'lavender' },
  MEMBER: { label: '成员', color: 'default' },
}

export default function FamilySettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/family/settings')
    }
  }, [user, authLoading, router])

  // 获取家庭信息
  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const response = await fetch('/api/family')
        if (response.ok) {
          const data = await response.json()
          setFamily(data)
        }
      } catch (error) {
        console.error('获取家庭信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchFamily()
    }
  }, [user])

  // 发送邀请
  const handleInvite = async () => {
    setInviteError('')
    setInviteSuccess('')
    setInviteLoading(true)

    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '发送邀请失败')
      }

      setInviteSuccess('邀请已发送！')
      setInviteEmail('')
    } catch (err: any) {
      setInviteError(err.message)
    } finally {
      setInviteLoading(false)
    }
  }

  // 加载中显示
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">👨‍👩‍👧</div>
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
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PageHeader title="家庭设置" />

      {/* 家庭信息卡片 */}
      <div className="mx-4 mb-4">
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <p className="text-4xl">👨‍👩‍👧</p>
            <h2 className="mt-2 text-xl font-bold text-neutral-800">
              {family?.name || '未创建家庭'}
            </h2>
            {family?.inviteCode && (
              <>
                <p className="mt-1 text-sm text-neutral-500">
                  邀请码：{family.inviteCode}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(family.inviteCode)
                    alert('已复制邀请码')
                  }}
                >
                  📋 复制邀请码
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* 宝宝列表 */}
      {family?.babies && family.babies.length > 0 && (
        <div className="px-4 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-600">宝宝</h3>
            <span className="text-xs text-neutral-400">
              {family.babies.length}/5
            </span>
          </div>
          {family.babies.map((baby) => (
            <Card key={baby.id} variant="outlined" padding="sm">
              <div className="flex items-center gap-3">
                <Avatar alt={baby.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-800">{baby.name}</p>
                  <p className="text-xs text-neutral-500">
                    {baby.gender === 'FEMALE' ? '👧' : baby.gender === 'MALE' ? '👦' : '🤷'} {baby.birthday || '未设置生日'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 家庭成员 */}
      {family?.members && family.members.length > 0 && (
        <div className="px-4 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-600">家庭成员</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInvite(true)}
            >
              + 邀请
            </Button>
          </div>
          {family.members.map((member) => {
            const role = ROLE_LABELS[member.role] || ROLE_LABELS.MEMBER
            return (
              <Card key={member.id} variant="outlined" padding="sm">
                <div className="flex items-center gap-3">
                  <Avatar alt={member.user.name || '用户'} size="md" src={member.user.image} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{member.user.name || '未设置昵称'}</p>
                  </div>
                  <Badge variant={role.color}>{role.label}</Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 功能入口 */}
      <div className="px-4 pb-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">更多功能</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
            <p className="text-2xl">📊</p>
            <p className="text-xs font-medium text-neutral-700">积分记录</p>
          </Card>
          <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
            <p className="text-2xl">🔔</p>
            <p className="text-xs font-medium text-neutral-700">通知设置</p>
          </Card>
          <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
            <p className="text-2xl">📄</p>
            <p className="text-xs font-medium text-neutral-700">导出报告</p>
          </Card>
          <Card variant="outlined" padding="sm" className="cursor-pointer text-center">
            <p className="text-2xl">⚙️</p>
            <p className="text-xs font-medium text-neutral-700">账号设置</p>
          </Card>
        </div>
      </div>

      {/* 邀请浮层 */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-screen-sm rounded-t-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">邀请家庭成员</h3>
              <button onClick={() => {
                setShowInvite(false)
                setInviteError('')
                setInviteSuccess('')
              }} className="text-neutral-400">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {inviteError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                  {inviteSuccess}
                </div>
              )}
              <Input
                label="邮箱地址"
                type="email"
                placeholder="family@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button onClick={handleInvite} loading={inviteLoading}>
                发送邀请
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
