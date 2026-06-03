import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { POINTS } from '@/lib/constants'

// 获取专家列表
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const specialty = searchParams.get('specialty')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { isAvailable: true }
    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' }
    }

    const [experts, total] = await Promise.all([
      db.expert.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { rating: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.expert.count({ where }),
    ])

    return NextResponse.json({
      experts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get experts error:', error)
    return NextResponse.json({ error: '获取专家列表失败' }, { status: 500 })
  }
}

// 预约咨询（模拟支付）
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id
    const { expertId, babyId, scheduledAt, duration = 30 } = await req.json()

    // 获取专家信息
    const expert = await db.expert.findUnique({
      where: { id: expertId },
    })
    if (!expert) {
      return NextResponse.json({ error: '专家不存在' }, { status: 404 })
    }

    // 检查免费咨询额度
    const currentMonth = new Date().toISOString().slice(0, 7)
    const freeConsultation = await db.freeConsultation.findFirst({
      where: { userId, month: currentMonth },
    })

    let pointsCost = 0
    let useFree = false

    if (freeConsultation && freeConsultation.usedCount < freeConsultation.maxCount) {
      // 使用免费咨询
      useFree = true
      await db.freeConsultation.update({
        where: { id: freeConsultation.id },
        data: { usedCount: { increment: 1 } },
      })
    } else {
      // 使用积分
      pointsCost = expert.price

      const balance = await db.pointBalance.findUnique({
        where: { userId },
      })

      if (!balance || balance.balance < pointsCost) {
        return NextResponse.json(
          { error: '积分不足，请充值或等待下月免费额度' },
          { status: 402 }
        )
      }

      // 扣除积分
      await db.pointBalance.update({
        where: { userId },
        data: {
          balance: { decrement: pointsCost },
          totalSpent: { increment: pointsCost },
        },
      })

      await db.pointTransaction.create({
        data: {
          userId,
          amount: -pointsCost,
          type: 'SPEND',
          source: 'CONSULTATION',
          description: `预约${expert.title}咨询`,
        },
      })
    }

    // 创建咨询记录
    const consultation = await db.consultation.create({
      data: {
        expertId,
        userId,
        babyId,
        status: 'CONFIRMED',
        scheduledAt: new Date(scheduledAt),
        duration,
        pointsCost: useFree ? 0 : pointsCost,
      },
    })

    // 更新专家咨询次数
    await db.expert.update({
      where: { id: expertId },
      data: { consultationCount: { increment: 1 } },
    })

    return NextResponse.json({
      consultation,
      message: useFree
        ? '预约成功（使用免费咨询）'
        : `预约成功，消耗 ${pointsCost} 积分`,
    })
  } catch (error) {
    console.error('Book consultation error:', error)
    return NextResponse.json({ error: '预约失败' }, { status: 500 })
  }
}
