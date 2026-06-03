'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'

// 模拟照片数据
const MOCK_PHOTOS = [
  { id: '1', url: '', caption: '第一次翻身', aiTags: ['翻身', '运动'], takenAt: '2025-05-20', month: '2025-05' },
  { id: '2', url: '', caption: '吃辅食', aiTags: ['吃饭', '辅食'], takenAt: '2025-06-10', month: '2025-06' },
  { id: '3', url: '', caption: '开心笑', aiTags: ['微笑', '开心'], takenAt: '2025-06-15', month: '2025-06' },
  { id: '4', url: '', caption: '学爬行', aiTags: ['爬行', '运动'], takenAt: '2025-07-01', month: '2025-07' },
  { id: '5', url: '', caption: '玩玩具', aiTags: ['玩耍', '玩具'], takenAt: '2025-07-10', month: '2025-07' },
  { id: '6', url: '', caption: '洗澡', aiTags: ['洗澡', '日常'], takenAt: '2025-07-15', month: '2025-07' },
]

// 模拟 AI 标签
const AI_TAGS = ['全部', '微笑', '吃饭', '睡觉', '爬行', '玩耍', '洗澡']

export default function AlbumPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [selectedTag, setSelectedTag] = useState('全部')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/baby/${params.id}/album`)
    }
  }, [user, authLoading, router, params.id])

  const filteredPhotos =
    selectedTag === '全部'
      ? MOCK_PHOTOS
      : MOCK_PHOTOS.filter((p) => p.aiTags.includes(selectedTag))

  // 按月分组
  const grouped = filteredPhotos.reduce((acc, photo) => {
    if (!acc[photo.month]) acc[photo.month] = []
    acc[photo.month].push(photo)
    return acc
  }, {} as Record<string, typeof MOCK_PHOTOS>)

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">📷</div>
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
      <PageHeader
        title="成长相册"
        showBack
        action={
          <Button size="sm" onClick={handleUpload}>
            📷 上传
          </Button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* AI 标签筛选 */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        {AI_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-all ${
              selectedTag === tag
                ? 'bg-primary-300 text-white'
                : 'border border-neutral-200 text-neutral-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* AI 标签说明 */}
      <div className="mx-4 mb-4 rounded-lg border border-mint-200 bg-mint-50 p-3">
        <p className="text-sm text-mint-700">
          🤖 照片由 AI 自动识别标签，支持离线分类
        </p>
      </div>

      {/* 照片网格 */}
      {Object.entries(grouped).map(([month, photos]) => (
        <div key={month} className="mb-4">
          <h3 className="mb-2 px-4 text-sm font-semibold text-neutral-600">
            {month.replace('-', '年')}月
          </h3>
          <div className="grid grid-cols-3 gap-1 px-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-sm bg-neutral-100"
              >
                <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">
                  📷
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-xs text-white">{photo.caption}</p>
                  <div className="mt-0.5 flex flex-wrap gap-0.5">
                    {photo.aiTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredPhotos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl">📷</p>
          <h3 className="mt-4 text-lg font-bold text-neutral-700">
            还没有照片
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            上传宝宝的照片，AI 会自动分类
          </p>
          <Button className="mt-4" onClick={handleUpload}>
            上传第一张照片
          </Button>
        </div>
      )}
    </div>
  )
}
