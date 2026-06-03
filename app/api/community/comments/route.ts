import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { commentSchema } from '@/lib/validators'
import { moderateContent } from '@/lib/services/content-filter'

// 获取评论
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!postId) {
      return NextResponse.json({ error: '缺少 postId' }, { status: 400 })
    }

    const comments = await db.comment.findMany({
      where: { postId, status: 'APPROVED', parentId: null },
      include: {
        author: { select: { id: true, name: true, image: true } },
        children: {
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 })
  }
}

// 创建评论
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id
    const body = await req.json()
    const data = commentSchema.parse(body)

    // 内容审核
    const moderation = await moderateContent(data.content)
    if (!moderation.approved) {
      return NextResponse.json(
        { error: moderation.reason },
        { status: 422 }
      )
    }

    const comment = await db.comment.create({
      data: {
        postId: data.postId,
        authorId: userId,
        content: moderation.filteredContent,
        parentId: data.parentId || null,
        status: 'APPROVED',
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    })

    // 更新帖子评论数
    await db.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create comment error:', error)
    return NextResponse.json({ error: '创建评论失败' }, { status: 500 })
  }
}
