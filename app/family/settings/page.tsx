'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Button, Avatar, Badge, Input } from '@/components/ui'

const MOCK_FAMILY = {
  name: '豆豆一家',
  inviteCode: 'ABC12345',
  members: [
    { id: '1', name: '豆豆妈', role: 'OWNER', avatar: null },
    { id: '2', name: '豆豆爸', role: 'ADMIN', avatar: null },
    { id: '3', name: '奶奶', role: 'MEMBER', avatar: null },
  ],
  babies: [
    { id: '1', name: '小豆豆', gender: 'FEMALE', birthday: '2025-01-15' },
  ],
}

const ROLE_LABELS = {
  OWNER: { label: '管理员', color: 'primary' as const },
  ADMIN: { label: '副管理员', color: 'lavender' as const },
  MEMBER: { label: '成员', color: 'default' as const },
}

export default function FamilySettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/family/settings')
    }
  }, [user, authLoading, router])

  // 加载中显示
  if (authLoading) {
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
              {MOCK_FAMILY.name}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              邀请码：{MOCK_FAMILY.inviteCode}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(MOCK_FAMILY.inviteCode)
                alert('已复制邀请码')
              }}
            >
              📋 复制邀请码
            </Button>
          </div>
        </Card>
      </div>

      {/* 宝宝列表 */}
      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-600">宝宝</h3>
          <span className="text-xs text-neutral-400">
            {MOCK_FAMILY.babies.length}/5
          </span>
        </div>
        {MOCK_FAMILY.babies.map((baby) => (
          <Card key={baby.id} variant="outlined" padding="sm">
            <div className="flex items-center gap-3">
              <Avatar alt={baby.name} size="md" />
              <div className="flex-1">
                <p className="font-medium text-neutral-800">{baby.name}</p>
                <p className="text-xs text-neutral-500">
                  {baby.gender === 'FEMALE' ? '👧' : '👦'} {baby.birthday}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 家庭成员 */}
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
        {MOCK_FAMILY.members.map((member) => {
          const role = ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]
          return (
            <Card key={member.id} variant="outlined" padding="sm">
              <div className="flex items-center gap-3">
                <Avatar alt={member.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-800">{member.name}</p>
                </div>
                <Badge variant={role.color}>{role.label}</Badge>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 我的积分 */}
      <div className="px-4 pb-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">我的积分</h3>
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">当前积分</p>
              <p className="text-2xl font-bold text-primary-600">120</p>
            </div>
            <Button variant="secondary" size="sm">
              签到 +5
            </Button>
          </div>
        </Card>
      </div>

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
              <button onClick={() => setShowInvite(false)} className="text-neutral-400">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                label="邮箱地址"
                type="email"
                placeholder="family@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button onClick={() => setShowInvite(false)}>发送邀请</Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
