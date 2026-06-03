import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { nanoid } from '@/lib/utils'

// 发送邀请
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id
    const { email } = await req.json()

    // 查找用户的家庭
    const membership = await db.familyMember.findFirst({
      where: { userId, role: { in: ['OWNER', 'ADMIN'] } },
    })

    if (!membership) {
      return NextResponse.json(
        { error: '您没有邀请权限' },
        { status: 403 }
      )
    }

    // 检查家庭成员上限
    const memberCount = await db.familyMember.count({
      where: { familyId: membership.familyId },
    })
    if (memberCount >= 10) {
      return NextResponse.json(
        { error: '家庭成员已达上限（10人）' },
        { status: 409 }
      )
    }

    // 检查是否已邀请
    const existingInvite = await db.familyInvite.findFirst({
      where: {
        familyId: membership.familyId,
        email,
        status: 'PENDING',
      },
    })
    if (existingInvite) {
      return NextResponse.json(
        { error: '已向该邮箱发送过邀请' },
        { status: 409 }
      )
    }

    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天

    const invite = await db.familyInvite.create({
      data: {
        familyId: membership.familyId,
        email,
        token,
        status: 'PENDING',
        expiresAt,
      },
    })

    // TODO: 发送邀请邮件（Brevo）

    return NextResponse.json({
      message: '邀请已发送',
      inviteLink: `/family/invite?token=${token}`,
    })
  } catch (error) {
    console.error('Send invite error:', error)
    return NextResponse.json({ error: '发送邀请失败' }, { status: 500 })
  }
}
