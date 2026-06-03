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

    // 检查用户是否已有家庭
    const existingMembership = await db.familyMember.findFirst({
      where: { userId: user.id },
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
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
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

    // 查找用户所属的家庭
    let membership = await db.familyMember.findFirst({
      where: { userId: user.id },
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

    // 如果没有家庭，自动创建一个
    if (!membership) {
      const inviteCode = nanoid(8)
      const family = await db.family.create({
        data: {
          name: user.user_metadata?.name ? `${user.user_metadata.name}的家` : '我的家庭',
          inviteCode,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      })

      // 重新查询以获取完整数据
      membership = await db.familyMember.findFirst({
        where: { userId: user.id },
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
    }

    if (!membership) {
      return NextResponse.json({ error: '获取家庭信息失败' }, { status: 500 })
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
