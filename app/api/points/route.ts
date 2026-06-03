import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { POINTS } from '@/lib/constants'

// 获取积分信息
export async function GET() {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id

    const [balance, transactions, freeConsultation] = await Promise.all([
      db.pointBalance.findUnique({ where: { userId } }),
      db.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.freeConsultation.findFirst({
        where: {
          userId,
          month: new Date().toISOString().slice(0, 7),
        },
      }),
    ])

    return NextResponse.json({
      balance: balance?.balance || 0,
      totalEarned: balance?.totalEarned || 0,
      totalSpent: balance?.totalSpent || 0,
      transactions,
      freeConsultation: {
        used: freeConsultation?.usedCount || 0,
        max: freeConsultation?.maxCount || 2,
      },
    })
  } catch (error) {
    console.error('Get points error:', error)
    return NextResponse.json({ error: '获取积分信息失败' }, { status: 500 })
  }
}

// 签到获取积分
export async function POST() {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 检查今天是否已签到
    const existingCheckin = await db.pointTransaction.findFirst({
      where: {
        userId,
        source: 'DAILY_CHECKIN',
        createdAt: { gte: today },
      },
    })

    if (existingCheckin) {
      return NextResponse.json(
        { error: '今天已经签到过了' },
        { status: 409 }
      )
    }

    // 更新积分
    const balance = await db.pointBalance.update({
      where: { userId },
      data: {
        balance: { increment: POINTS.DAILY_CHECKIN },
        totalEarned: { increment: POINTS.DAILY_CHECKIN },
      },
    })

    // 记录交易
    await db.pointTransaction.create({
      data: {
        userId,
        amount: POINTS.DAILY_CHECKIN,
        type: 'EARN',
        source: 'DAILY_CHECKIN',
        description: '每日签到',
      },
    })

    return NextResponse.json({
      message: `签到成功，获得 ${POINTS.DAILY_CHECKIN} 积分`,
      balance: balance.balance,
    })
  } catch (error) {
    console.error('Checkin error:', error)
    return NextResponse.json({ error: '签到失败' }, { status: 500 })
  }
}
