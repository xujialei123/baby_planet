import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyRecordSchema } from '@/lib/validators'

// 获取记录列表
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const babyId = searchParams.get('babyId')
    const type = searchParams.get('type')
    const date = searchParams.get('date') // YYYY-MM-DD
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!babyId) {
      return NextResponse.json({ error: '缺少 babyId' }, { status: 400 })
    }

    const where: any = { babyId }
    if (type) where.type = type
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      where.startTime = { gte: start, lt: end }
    }

    const [records, total] = await Promise.all([
      db.dailyRecord.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dailyRecord.count({ where }),
    ])

    return NextResponse.json({
      records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get records error:', error)
    return NextResponse.json({ error: '获取记录失败' }, { status: 500 })
  }
}

// 创建记录
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const data = dailyRecordSchema.parse(body)

    const record = await db.dailyRecord.create({
      data: {
        babyId: data.babyId,
        userId,
        type: data.type,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        data: (data.data || {}) as any,
        notes: data.notes,
      },
    })

    return NextResponse.json(record)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create record error:', error)
    return NextResponse.json({ error: '创建记录失败' }, { status: 500 })
  }
}
