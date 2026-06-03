import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { babySchema } from '@/lib/validators'

// 获取宝宝详情
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const baby = await db.baby.findUnique({
      where: { id: params.id },
      include: { family: { include: { members: true } } },
    })

    if (!baby) {
      return NextResponse.json({ error: '宝宝不存在' }, { status: 404 })
    }

    // 验证权限
    const userId = (session.user as any).id
    const isMember = baby.family.members.some((m: any) => m.userId === userId)
    if (!isMember) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    return NextResponse.json(baby)
  } catch (error) {
    console.error('Get baby error:', error)
    return NextResponse.json({ error: '获取宝宝信息失败' }, { status: 500 })
  }
}

// 更新宝宝信息
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await req.json()
    const data = babySchema.partial().parse(body)

    const baby = await db.baby.update({
      where: { id: params.id },
      data: {
        ...data,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
    })

    return NextResponse.json(baby)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Update baby error:', error)
    return NextResponse.json({ error: '更新宝宝信息失败' }, { status: 500 })
  }
}

// 删除宝宝
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    await db.baby.delete({ where: { id: params.id } })
    return NextResponse.json({ message: '已删除' })
  } catch (error) {
    console.error('Delete baby error:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
