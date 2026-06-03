import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * 发育里程碑标准数据
 * 基于 WHO 儿童发育里程碑
 */
const MILESTONE_DATA = [
  // 大运动
  { category: 'MOTOR', title: '抬头', description: '俯卧时能抬头45度', typicalAgeMonths: 2 },
  { category: 'MOTOR', title: '翻身', description: '能从仰卧翻到俯卧', typicalAgeMonths: 4 },
  { category: 'MOTOR', title: '独坐', description: '能独立坐稳', typicalAgeMonths: 6 },
  { category: 'MOTOR', title: '爬行', description: '能手膝爬行', typicalAgeMonths: 8 },
  { category: 'MOTOR', title: '扶站', description: '能扶着东西站起来', typicalAgeMonths: 9 },
  { category: 'MOTOR', title: '独走', description: '能独立行走', typicalAgeMonths: 12 },
  // 语言
  { category: 'LANGUAGE', title: '咿呀学语', description: '能发出"ba"、"ma"等音节', typicalAgeMonths: 6 },
  { category: 'LANGUAGE', title: '叫爸妈', description: '有意识地叫"爸爸"、"妈妈"', typicalAgeMonths: 10 },
  { category: 'LANGUAGE', title: '说词语', description: '能说3-5个有意义的词语', typicalAgeMonths: 12 },
  { category: 'LANGUAGE', title: '说短句', description: '能说2-3个词的短句', typicalAgeMonths: 18 },
  // 认知
  { category: 'COGNITIVE', title: '认生', description: '能区分熟悉和陌生面孔', typicalAgeMonths: 6 },
  { category: 'COGNITIVE', title: '找玩具', description: '能找到被遮住的玩具', typicalAgeMonths: 8 },
  { category: 'COGNITIVE', title: '模仿动作', description: '能模仿简单的动作', typicalAgeMonths: 12 },
  // 社交
  { category: 'SOCIAL', title: '社交微笑', description: '看到人会微笑', typicalAgeMonths: 2 },
  { category: 'SOCIAL', title: '拍手游戏', description: '喜欢玩拍手等互动游戏', typicalAgeMonths: 9 },
  { category: 'SOCIAL', title: '挥手再见', description: '能挥手表示再见', typicalAgeMonths: 10 },
]

// 获取里程碑列表
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const babyId = searchParams.get('babyId')

    if (!babyId) {
      // 返回所有里程碑标准
      return NextResponse.json(MILESTONE_DATA)
    }

    // 获取宝宝已达成的里程碑
    const achieved = await db.milestoneRecord.findMany({
      where: { babyId },
    })

    const achievedIds = new Set(achieved.map((a) => a.milestoneId))

    const milestones = MILESTONE_DATA.map((m, index) => ({
      id: `ms-${index}`,
      ...m,
      achieved: achievedIds.has(`ms-${index}`),
      achievedAt: achieved.find((a) => a.milestoneId === `ms-${index}`)?.achievedAt,
    }))

    return NextResponse.json(milestones)
  } catch (error) {
    console.error('Get milestones error:', error)
    return NextResponse.json({ error: '获取里程碑失败' }, { status: 500 })
  }
}

// 标记里程碑已达成
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { babyId, milestoneId, notes } = await req.json()

    const record = await db.milestoneRecord.create({
      data: {
        babyId,
        milestoneId,
        achievedAt: new Date(),
        notes,
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Achieve milestone error:', error)
    return NextResponse.json({ error: '标记里程碑失败' }, { status: 500 })
  }
}
