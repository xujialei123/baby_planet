import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { userId, email: userEmail, name: userName } = await req.json()

    // 检查用户是否已有家庭
    const existingMembership = await db.familyMember.findFirst({
      where: { userId },
    })

    let familyId: string | null = null

    // 如果没有家庭，自动创建一个
    if (!existingMembership) {
      const inviteCode = nanoid(8)
      const family = await db.family.create({
        data: {
          name: userName ? `${userName}的家` : '我的家庭',
          inviteCode,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
      })
      familyId = family.id
    }

    // 创建积分账户
    const existingBalance = await db.pointBalance.findUnique({
      where: { userId },
    })

    if (!existingBalance) {
      await db.pointBalance.create({
        data: {
          userId,
          balance: 100, // 注册赠送 100 积分
          totalEarned: 100,
          totalSpent: 0,
        },
      })

      // 记录积分交易
      await db.pointTransaction.create({
        data: {
          userId,
          amount: 100,
          type: 'EARN',
          source: 'SIGNUP',
          description: '新用户注册赠送',
        },
      })
    }

    // 创建免费咨询券（每月 2 次）
    const currentMonth = new Date().toISOString().slice(0, 7)
    const existingConsultation = await db.freeConsultation.findFirst({
      where: { userId, month: currentMonth },
    })

    if (!existingConsultation) {
      await db.freeConsultation.create({
        data: {
          userId,
          month: currentMonth,
          usedCount: 0,
          maxCount: 2,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: '用户资料创建成功',
      data: { userId, email: userEmail, name: userName, familyId },
    })
  } catch (error: unknown) {
    console.error('Register error:', error)
    const errorMessage = error instanceof Error ? error.message : '创建用户资料失败'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
