import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { growthRecordSchema } from '@/lib/validators'
import { calculatePercentile } from '@/lib/services/growth-calculator'

// 获取生长记录
export async function GET(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const babyId = searchParams.get('babyId')

    if (!babyId) {
      return NextResponse.json({ error: '缺少 babyId' }, { status: 400 })
    }

    const records = await db.growthRecord.findMany({
      where: { babyId },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Get growth records error:', error)
    return NextResponse.json({ error: '获取生长记录失败' }, { status: 500 })
  }
}

// 添加生长记录
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await req.json()
    const data = growthRecordSchema.parse(body)

    // 获取宝宝生日以计算月龄
    const baby = await db.baby.findUnique({ where: { id: data.babyId } })
    if (!baby) {
      return NextResponse.json({ error: '宝宝不存在' }, { status: 404 })
    }

    const recordDate = new Date(data.date)
    const birthday = baby.birthday ? new Date(baby.birthday) : new Date()
    const ageMonths =
      (recordDate.getFullYear() - birthday.getFullYear()) * 12 +
      (recordDate.getMonth() - birthday.getMonth())

    // 计算 WHO 百分位
    const gender = baby.gender || 'MALE' // 默认使用男性标准
    const weightPercentile = data.weight
      ? calculatePercentile('weight', data.weight, ageMonths, gender)
      : null
    const heightPercentile = data.height
      ? calculatePercentile('height', data.height, ageMonths, gender)
      : null
    const headPercentile = data.headCircumference
      ? calculatePercentile('head', data.headCircumference, ageMonths, gender)
      : null

    const record = await db.growthRecord.create({
      data: {
        babyId: data.babyId,
        date: recordDate,
        weight: data.weight,
        height: data.height,
        headCircumference: data.headCircumference,
        weightPercentile,
        heightPercentile,
        headPercentile,
      },
    })

    return NextResponse.json(record)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create growth record error:', error)
    return NextResponse.json({ error: '添加生长记录失败' }, { status: 500 })
  }
}
