'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Avatar, Badge } from '@/components/ui'

interface Expert {
  id: string
  title: string | null
  specialty: string | null
  price: number
  isAvailable: boolean
  rating: number
  consultationCount: number
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function ExpertPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const url = filter !== 'all'
          ? `/api/expert?specialty=${encodeURIComponent(filter)}`
          : '/api/expert'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setExperts(data.experts || [])
        }
      } catch (error) {
        console.error('获取专家列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExperts()
  }, [filter])

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PageHeader
        title="专家咨询"
        subtitle="每月2次免费咨询"
      />

      {/* 积分信息 */}
      <div className="mx-4 mb-4 rounded-lg bg-gradient-to-r from-primary-100 to-mint-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">我的积分</p>
            <p className="text-2xl font-bold text-primary-700">--</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">本月免费咨询</p>
            <p className="text-2xl font-bold text-mint-700">-/2</p>
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        {['all', '儿科', '营养', '早教', '心理'].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              filter === tag
                ? 'bg-primary-300 text-white'
                : 'border border-neutral-200 text-neutral-600'
            }`}
          >
            {tag === 'all' ? '全部' : tag}
          </button>
        ))}
      </div>

      {/* 专家列表 */}
      <div className="flex flex-col gap-3 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-4xl">👩‍⚕️</div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : experts.length > 0 ? (
          experts.map((expert) => (
            <Link key={expert.id} href={`/expert/${expert.id}`}>
              <Card variant="elevated" padding="md">
                <div className="flex gap-3">
                  <Avatar alt={expert.user.name || '专家'} size="lg" src={expert.user.image} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-800">{expert.user.name}</h3>
                      {expert.isAvailable ? (
                        <Badge variant="mint" size="sm">在线</Badge>
                      ) : (
                        <Badge variant="default" size="sm">离线</Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">{expert.title}</p>
                    <p className="text-xs text-neutral-400">{expert.specialty}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                      <span>⭐ {expert.rating}</span>
                      <span>📋 {expert.consultationCount}次咨询</span>
                      <span className="font-semibold text-primary-600">
                        {expert.price}积分/次
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl">👩‍⚕️</p>
            <h3 className="mt-4 text-lg font-bold text-neutral-700">
              暂无专家
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              专家团队正在入驻中...
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
