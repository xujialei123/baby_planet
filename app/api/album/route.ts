import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

// 获取相册照片
export async function GET(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const babyId = searchParams.get('babyId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tag = searchParams.get('tag')

    if (!babyId) {
      return NextResponse.json({ error: '缺少 babyId' }, { status: 400 })
    }

    const where: Record<string, unknown> = { babyId }
    if (tag) {
      where.aiTags = { has: tag }
    }

    const [photos, total] = await Promise.all([
      db.photo.findMany({
        where,
        orderBy: { takenAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.photo.count({ where }),
    ])

    // 按月分组
    const grouped = photos.reduce((acc, photo) => {
      const date = photo.takenAt ? new Date(photo.takenAt) : new Date()
      const month = date.toISOString().slice(0, 7)
      if (!acc[month]) acc[month] = []
      acc[month].push(photo)
      return acc
    }, {} as Record<string, typeof photos>)

    return NextResponse.json({
      photos,
      grouped,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get album error:', error)
    return NextResponse.json({ error: '获取相册失败' }, { status: 500 })
  }
}

// 保存照片记录（上传后调用）
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { babyId, url, thumbnailUrl, caption, aiTags, takenAt } = await req.json()

    const photo = await db.photo.create({
      data: {
        babyId,
        url,
        thumbnailUrl,
        caption,
        aiTags: aiTags || [],
        takenAt: takenAt ? new Date(takenAt) : new Date(),
      },
    })

    return NextResponse.json(photo)
  } catch (error) {
    console.error('Save photo error:', error)
    return NextResponse.json({ error: '保存照片失败' }, { status: 500 })
  }
}
