'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Badge, Input } from '@/components/ui'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  category: string | null
  tags: string[]
  viewCount: number
  publishedAt: string | null
}

export default function KnowledgePage() {
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const url = search
          ? `/api/knowledge?search=${encodeURIComponent(search)}`
          : '/api/knowledge'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error('获取文章失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [search])

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PageHeader title="知识库" />

      {/* 搜索框 */}
      <div className="px-4 pb-4 pt-4">
        <Input
          placeholder="搜索育儿知识..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* 文章列表 */}
      <div className="px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-4xl">📚</div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="flex flex-col gap-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.slug}`}>
                <Card variant="elevated" padding="none">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="h-32 w-full rounded-t-lg object-cover"
                    />
                  ) : (
                    <div className="h-24 bg-gradient-to-r from-primary-100 to-mint-100 rounded-t-lg" />
                  )}
                  <div className="p-3">
                    {article.category && (
                      <Badge variant="primary" size="sm" className="mb-1">
                        {article.category}
                      </Badge>
                    )}
                    <h4 className="font-semibold text-neutral-800">
                      {article.title}
                    </h4>
                    {article.excerpt && (
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-neutral-400">
                      👁️ {article.viewCount} 次阅读
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl">📚</p>
            <h3 className="mt-4 text-lg font-bold text-neutral-700">
              {search ? '没有找到相关文章' : '暂无文章'}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {search ? '试试其他关键词' : '知识库正在建设中...'}
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
