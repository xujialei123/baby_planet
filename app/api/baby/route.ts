import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { babySchema } from '@/lib/validators'

// 获取家庭的所有宝宝
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const membership = await db.familyMember.findFirst({
      where: { userId },
    })

    if (!membership) {
      return NextResponse.json({ error: '未找到家庭' }, { status: 404 })
    }

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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const membership = await db.familyMember.findFirst({
      where: { userId },
    })

    if (!membership) {
      return NextResponse.json({ error: '未找到家庭' }, { status: 404 })
    }

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
