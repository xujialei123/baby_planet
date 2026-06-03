'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Button, Avatar, Badge } from '@/components/ui'

interface Baby {
  id: string
  name: string
  gender: string
  birthday: string | null
  avatarUrl: string | null
}

function getAgeText(birthday: string | null) {
  if (!birthday) return '未设置生日'
  const birth = new Date(birthday)
  const now = new Date()
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (months < 1) return '新生儿'
  if (months < 12) return `${months}个月`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths > 0 ? `${years}岁${remainMonths}个月` : `${years}岁`
}

export default function BabyListPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [babies, setBabies] = useState<Baby[]>([])
  const [loading, setLoading] = useState(true)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/baby')
    }
  }, [user, authLoading, router])

  // 获取宝宝列表
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const response = await fetch('/api/baby')
        if (response.ok) {
          const data = await response.json()
          setBabies(data)
        }
      } catch (error) {
        console.error('获取宝宝列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBabies()
    }
  }, [user])

  // 加载中显示
  if (authLoading || loading) {
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
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PageHeader
        title="我的宝宝"
        action={
          <Link href="/baby/new">
            <Button size="sm">+ 添加</Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        {babies.map((baby) => (
          <Link key={baby.id} href={`/baby/${baby.id}/records`}>
            <Card variant="elevated" className="flex items-center gap-4">
              <Avatar alt={baby.name} size="lg" src={baby.avatarUrl} />
              <div className="flex-1">
                <h3 className="font-bold text-neutral-800">{baby.name}</h3>
                <p className="text-sm text-neutral-500">
                  {baby.gender === 'FEMALE' ? '👧' : baby.gender === 'MALE' ? '👦' : '🤷'} {getAgeText(baby.birthday)}
                </p>
              </div>
              <Badge variant="mint">{getAgeText(baby.birthday)}</Badge>
            </Card>
          </Link>
        ))}

        {babies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl">👶</p>
            <h3 className="mt-4 text-lg font-bold text-neutral-700">
              还没有添加宝宝
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              添加宝宝开始记录成长
            </p>
            <Link href="/baby/new" className="mt-4">
              <Button>添加第一个宝宝</Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
