import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// 接受邀请
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { token } = await req.json()

    const invite = await db.familyInvite.findFirst({
      where: { token, status: 'PENDING' },
    })

    if (!invite) {
      return NextResponse.json(
        { error: '邀请无效或已过期' },
        { status: 404 }
      )
    }

    if (invite.expiresAt < new Date()) {
      await db.familyInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json(
        { error: '邀请已过期' },
        { status: 410 }
      )
    }

    // 检查用户是否已是成员
    const existing = await db.familyMember.findFirst({
      where: { familyId: invite.familyId, userId },
    })
    if (existing) {
      return NextResponse.json(
        { error: '您已是该家庭成员' },
        { status: 409 }
      )
    }

    // 添加为成员
    await db.familyMember.create({
      data: {
        familyId: invite.familyId,
        userId,
        role: 'MEMBER',
      },
    })

    // 更新邀请状态
    await db.familyInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    })

    return NextResponse.json({ message: '成功加入家庭' })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: '接受邀请失败' }, { status: 500 })
  }
}
