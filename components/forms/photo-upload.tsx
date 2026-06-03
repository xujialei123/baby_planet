'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui'

interface PhotoUploadProps {
  babyId: string
  onUploadComplete?: (photo: any) => void
}

export function PhotoUpload({ babyId, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadPhoto = useCallback(
    async (file: File) => {
      setUploading(true)
      setProgress(0)

      try {
        // 1. 获取预签名 URL
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder: `album/${babyId}`,
          }),
        })

        if (!res.ok) throw new Error('获取上传链接失败')
        const { presignedUrl, publicUrl } = await res.json()

        // 2. 上传文件到 R2
        setProgress(30)
        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })
        setProgress(60)

        // 3. 浏览器端 AI 标签（Transformers.js）
        const aiTags = await generateAITags(file)
        setProgress(80)

        // 4. 保存照片记录
        const photoRes = await fetch('/api/album', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            babyId,
            url: publicUrl,
            thumbnailUrl: publicUrl, // 实际应生成缩略图
            caption: '',
            aiTags,
            takenAt: new Date().toISOString(),
          }),
        })

        if (!photoRes.ok) throw new Error('保存照片失败')
        const photo = await photoRes.json()
        setProgress(100)

        onUploadComplete?.(photo)
        return photo
      } catch (error) {
        console.error('Upload error:', error)
        throw error
      } finally {
        setUploading(false)
      }
    },
    [babyId, onUploadComplete]
  )

  return { uploadPhoto, uploading, progress }
}

/**
 * 浏览器端 AI 图片标签（Transformers.js + MobileNet）
 * 完全免费，零成本
 */
async function generateAITags(file: File): Promise<string[]> {
  try {
    // 动态加载 Transformers.js
    const { pipeline } = await import('@xenova/transformers')

    // 加载图像分类模型
    const classifier = await pipeline('image-classification', 'Xenova/mobilenet_v2_1.0_224')

    // 转换文件为 URL
    const imageUrl = URL.createObjectURL(file)

    // 分类
    const results = await classifier(imageUrl)

    // 清理
    URL.revokeObjectURL(imageUrl)

    // 转换为中文标签
    const tagMap: Record<string, string> = {
      'baby': '宝宝',
      'smile': '微笑',
      'eat': '吃饭',
      'sleep': '睡觉',
      'crawl': '爬行',
      'play': '玩耍',
      'bath': '洗澡',
      'toy': '玩具',
      'food': '食物',
      'dog': '狗狗',
      'cat': '猫咪',
    }

    const tags = (results as any[])
      .filter((r) => r.score > 0.3)
      .map((r) => {
        const label = r.label.toLowerCase()
        for (const [en, zh] of Object.entries(tagMap)) {
          if (label.includes(en)) return zh
        }
        return r.label
      })
      .slice(0, 5)

    return tags.length > 0 ? tags : ['其他']
  } catch (error) {
    console.error('AI tagging error:', error)
    return ['未分类']
  }
}
