import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { familySchema } from '@/lib/validators'
import { nanoid } from '@/lib/utils'

// 创建家庭
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await req.json()
    const { name } = familySchema.parse(body)
    const userId = user.id

    // 检查用户是否已有家庭
    const existingMembership = await db.familyMember.findFirst({
      where: { userId },
    })
    if (existingMembership) {
      return NextResponse.json(
        { error: '您已经加入了一个家庭' },
        { status: 409 }
      )
    }

    const inviteCode = nanoid(8)

    const family = await db.family.create({
      data: {
        name,
        inviteCode,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: { members: true },
    })

    return NextResponse.json(family)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create family error:', error)
    return NextResponse.json({ error: '创建家庭失败' }, { status: 500 })
  }
}

// 获取当前用户的家庭信息
export async function GET() {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = user.id

    const membership = await db.familyMember.findFirst({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
            babies: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: '未找到家庭' }, { status: 404 })
    }

    return NextResponse.json({
      ...membership.family,
      role: membership.role,
    })
  } catch (error) {
    console.error('Get family error:', error)
    return NextResponse.json({ error: '获取家庭信息失败' }, { status: 500 })
  }
}
