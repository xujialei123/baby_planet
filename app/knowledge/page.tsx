'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader, BottomNav } from '@/components/layout'
import { Card, Badge, Input } from '@/components/ui'

const CATEGORIES = [
  { id: '1', name: '喂养营养', icon: '🍼', count: 45 },
  { id: '2', name: '睡眠护理', icon: '😴', count: 32 },
  { id: '3', name: '生长发育', icon: '📈', count: 28 },
  { id: '4', name: '疫苗接种', icon: '💉', count: 18 },
  { id: '5', name: '常见疾病', icon: '🏥', count: 25 },
  { id: '6', name: '早教启蒙', icon: '📚', count: 36 },
]

const ARTICLES = [
  {
    id: '1',
    title: '母乳喂养完全指南：从开奶到断奶',
    category: '喂养营养',
    excerpt: '详细介绍母乳喂养的正确姿势、常见问题及解决方案...',
    views: 2345,
    coverColor: 'bg-primary-100',
  },
  {
    id: '2',
    title: '宝宝辅食添加时间表与注意事项',
    category: '喂养营养',
    excerpt: '6个月开始添加辅食的科学方法，从米糊到多样化饮食...',
    views: 1890,
    coverColor: 'bg-mint-100',
  },
  {
    id: '3',
    title: '如何培养宝宝自主入睡能力',
    category: '睡眠护理',
    excerpt: '科学的睡眠训练方法，帮助宝宝建立健康的睡眠习惯...',
    views: 1567,
    coverColor: 'bg-lavender-100',
  },
]

export default function KnowledgePage() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PageHeader title="知识库" />

      {/* 搜索框 */}
      <div className="px-4 pb-4">
        <Input
          placeholder="搜索育儿知识..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* 分类网格 */}
      <div className="px-4 pb-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">知识分类</h3>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/knowledge/categories/${cat.id}`}>
              <Card variant="outlined" padding="sm" className="text-center">
                <p className="text-2xl">{cat.icon}</p>
                <p className="mt-1 text-xs font-medium text-neutral-700">
                  {cat.name}
                </p>
                <p className="text-[10px] text-neutral-400">{cat.count}篇</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 热门文章 */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">推荐文章</h3>
        <div className="flex flex-col gap-3">
          {ARTICLES.map((article) => (
            <Link key={article.id} href={`/knowledge/${article.id}`}>
              <Card variant="elevated" padding="none">
                <div className={`h-24 ${article.coverColor} rounded-t-lg`} />
                <div className="p-3">
                  <Badge variant="primary" size="sm" className="mb-1">
                    {article.category}
                  </Badge>
                  <h4 className="font-semibold text-neutral-800">
                    {article.title}
                  </h4>
                  <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    👁️ {article.views} 次阅读
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
