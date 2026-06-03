'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Badge, Button } from '@/components/ui'

const EXPERTS = [
  {
    id: '1',
    name: '张医生',
    title: '儿科主任医师',
    specialty: '新生儿护理、儿童营养',
    rating: 4.9,
    consultations: 328,
    price: 50, // 积分
    avatar: null,
    isAvailable: true,
  },
  {
    id: '2',
    name: '李老师',
    title: '早教专家',
    specialty: '0-3岁早期教育、感统训练',
    rating: 4.8,
    consultations: 215,
    price: 30,
    avatar: null,
    isAvailable: true,
  },
  {
    id: '3',
    name: '王营养师',
    title: '注册营养师',
    specialty: '婴幼儿辅食、营养搭配',
    rating: 4.7,
    consultations: 186,
    price: 40,
    avatar: null,
    isAvailable: false,
  },
]

export default function ExpertPage() {
  const [filter, setFilter] = useState('all')

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PageHeader
        title="专家咨询"
        subtitle="每月2次免费咨询"
      />

      {/* 积分信息 */}
      <div className="mx-4 mb-4 rounded-lg bg-gradient-to-r from-primary-100 to-mint-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">我的积分</p>
            <p className="text-2xl font-bold text-primary-700">120</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">本月免费咨询</p>
            <p className="text-2xl font-bold text-mint-700">1/2</p>
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
        {EXPERTS.map((expert) => (
          <Link key={expert.id} href={`/expert/${expert.id}`}>
            <Card variant="elevated" padding="md">
              <div className="flex gap-3">
                <Avatar alt={expert.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-neutral-800">{expert.name}</h3>
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
                    <span>📋 {expert.consultations}次咨询</span>
                    <span className="font-semibold text-primary-600">
                      {expert.price}积分/次
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
