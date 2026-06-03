'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Avatar, Badge } from '@/components/ui'

// 模拟圈子数据
const CIRCLES = [
  { id: '1', name: '新手妈妈', icon: '👶', members: 1234 },
  { id: '2', name: '辅食交流', icon: '🍚', members: 856 },
  { id: '3', name: '睡眠训练', icon: '😴', members: 642 },
  { id: '4', name: '早教分享', icon: '📚', members: 521 },
]

// 模拟帖子数据
const POSTS = [
  {
    id: '1',
    title: '宝宝6个月了，开始添加辅食的经验分享',
    author: { name: '豆豆妈', avatar: null },
    circle: '辅食交流',
    type: 'EXPERIENCE',
    likes: 42,
    comments: 15,
    time: '2小时前',
    preview: '分享一下我们从纯母乳过渡到辅食的过程，希望能帮到其他妈妈...',
  },
  {
    id: '2',
    title: '宝宝晚上频繁夜醒怎么办？',
    author: { name: '困困爸爸', avatar: null },
    circle: '睡眠训练',
    type: 'QUESTION',
    likes: 28,
    comments: 23,
    time: '5小时前',
    preview: '宝宝8个月了，最近晚上每隔2小时就醒一次，求有经验的家长支招...',
  },
  {
    id: '3',
    title: '小豆豆学会走路啦！🎉',
    author: { name: '豆豆妈', avatar: null },
    circle: '新手妈妈',
    type: 'MILESTONE',
    likes: 156,
    comments: 38,
    time: '1天前',
    preview: '今天小豆豆终于迈出了人生第一步！记录一下这个珍贵的时刻...',
  },
]

const TYPE_CONFIG = {
  DISCUSSION: { label: '讨论', color: 'default' as const },
  QUESTION: { label: '求助', color: 'honey' as const },
  EXPERIENCE: { label: '经验', color: 'mint' as const },
  MILESTONE: { label: '里程碑', color: 'primary' as const },
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PageHeader
        title="社区"
        action={
          <Link href="/community/new">
            <span className="text-sm font-medium text-primary-500">+ 发帖</span>
          </Link>
        }
      />

      {/* 圈子列表 */}
      <div className="px-4 pb-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">热门圈子</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CIRCLES.map((circle) => (
            <Link key={circle.id} href={`/community/${circle.id}`}>
              <div className="flex min-w-[100px] flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition-all hover:border-primary-300">
                <span className="text-2xl">{circle.icon}</span>
                <span className="text-xs font-medium text-neutral-700">
                  {circle.name}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {circle.members}人
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">最新动态</h3>
        <div className="flex flex-col gap-3">
          {POSTS.map((post) => {
            const typeConfig = TYPE_CONFIG[post.type as keyof typeof TYPE_CONFIG]
            return (
              <Link key={post.id} href={`/community/${post.id}`}>
                <Card variant="elevated" padding="md">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar alt={post.author.name} size="sm" />
                    <span className="text-sm font-medium text-neutral-700">
                      {post.author.name}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-400">{post.circle}</span>
                    <Badge variant={typeConfig.color} size="sm">
                      {typeConfig.label}
                    </Badge>
                  </div>
                  <h4 className="mb-1 font-semibold text-neutral-800">
                    {post.title}
                  </h4>
                  <p className="mb-3 text-sm text-neutral-500 line-clamp-2">
                    {post.preview}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>{post.time}</span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
