'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Avatar, Badge } from '@/components/ui'

interface Post {
  id: string
  title: string
  content: string
  type: string
  likeCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  circle: {
    id: string
    name: string
    icon: string | null
  }
}

const TYPE_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'mint' | 'lavender' | 'honey' | 'danger' }> = {
  DISCUSSION: { label: '讨论', color: 'default' },
  QUESTION: { label: '求助', color: 'honey' },
  EXPERIENCE: { label: '经验', color: 'mint' },
  MILESTONE: { label: '里程碑', color: 'primary' },
}

function timeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return past.toLocaleDateString('zh-CN')
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/community/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error('获取帖子失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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

      {/* 帖子列表 */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-4xl">💬</div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {posts.map((post) => {
              const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG.DISCUSSION
              return (
                <Link key={post.id} href={`/community/${post.id}`}>
                  <Card variant="elevated" padding="md">
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar alt={post.author.name || '用户'} size="sm" src={post.author.image} />
                      <span className="text-sm font-medium text-neutral-700">
                        {post.author.name || '匿名用户'}
                      </span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-400">{post.circle.icon} {post.circle.name}</span>
                      <Badge variant={typeConfig.color} size="sm">
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <h4 className="mb-1 font-semibold text-neutral-800">
                      {post.title}
                    </h4>
                    <p className="mb-3 text-sm text-neutral-500 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl">💬</p>
            <h3 className="mt-4 text-lg font-bold text-neutral-700">
              还没有帖子
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              成为第一个发帖的人吧！
            </p>
            <Link href="/community/new" className="mt-4">
              <span className="text-primary-500 font-medium">去发帖 →</span>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
