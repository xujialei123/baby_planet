import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取文章列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { status: 'PUBLISHED' }
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          tags: true,
          viewCount: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ])

    return NextResponse.json({
      articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get articles error:', error)
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 })
  }
}
