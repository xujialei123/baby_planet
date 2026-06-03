import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { postSchema } from '@/lib/validators'
import { moderateContent } from '@/lib/services/content-filter'

// 获取帖子列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const circleId = searchParams.get('circleId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { status: 'APPROVED' }
    if (circleId) where.circleId = circleId

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          circle: { select: { id: true, name: true, icon: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 })
  }
}

// 创建帖子
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id
    const body = await req.json()
    const data = postSchema.parse(body)

    // 内容审核
    const moderation = await moderateContent(data.title + ' ' + data.content)
    if (!moderation.approved) {
      return NextResponse.json(
        { error: moderation.reason },
        { status: 422 }
      )
    }

    const post = await db.post.create({
      data: {
        circleId: data.circleId,
        authorId: userId,
        title: data.title,
        content: moderation.filteredContent,
        type: data.type,
        status: 'APPROVED', // 自动审核通过
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    })

    // 更新圈子帖子数
    await db.circle.update({
      where: { id: data.circleId },
      data: { memberCount: { increment: 1 } },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create post error:', error)
    return NextResponse.json({ error: '创建帖子失败' }, { status: 500 })
  }
}
