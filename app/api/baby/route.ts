import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { babySchema } from '@/lib/validators'
import { nanoid } from '@/lib/utils'

/**
 * 获取或创建用户的家庭
 */
async function getOrCreateFamily(userId: string) {
  // 查找用户所属的家庭
  let membership = await db.familyMember.findFirst({
    where: { userId },
  })

  if (membership) {
    return membership
  }

  // 如果没有家庭，自动创建一个
  const user = await db.user.findUnique({ where: { id: userId } })
  const inviteCode = nanoid(8)

  const family = await db.family.create({
    data: {
      name: user?.name ? `${user.name}的家` : '我的家庭',
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

  return {
    id: '',
    familyId: family.id,
    userId,
    role: 'OWNER',
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// 获取家庭的所有宝宝
export async function GET() {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const membership = await getOrCreateFamily(user.id)

    const babies = await db.baby.findMany({
      where: { familyId: membership.familyId },
      orderBy: { birthday: 'desc' },
    })

    return NextResponse.json(babies)
  } catch (error) {
    console.error('Get babies error:', error)
    return NextResponse.json({ error: '获取宝宝列表失败' }, { status: 500 })
  }
}

// 添加宝宝
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const membership = await getOrCreateFamily(user.id)

    // 检查宝宝数量上限
    const babyCount = await db.baby.count({
      where: { familyId: membership.familyId },
    })
    if (babyCount >= 5) {
      return NextResponse.json(
        { error: '最多添加5个宝宝' },
        { status: 409 }
      )
    }

    const body = await req.json()
    const data = babySchema.parse(body)

    const baby = await db.baby.create({
      data: {
        familyId: membership.familyId,
        name: data.name,
        gender: data.gender,
        birthday: new Date(data.birthday),
        bloodType: data.bloodType,
        birthWeight: data.birthWeight,
        birthHeight: data.birthHeight,
      },
    })

    return NextResponse.json(baby)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create baby error:', error)
    return NextResponse.json({ error: '添加宝宝失败' }, { status: 500 })
  }
}
