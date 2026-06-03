import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * 中国儿童免疫规划疫苗时间表
 * 来源：国家卫生健康委员会
 */
const CHINA_VACCINE_SCHEDULE = [
  { name: '乙肝疫苗', ageMonths: 0, isRequired: true, description: '预防乙型肝炎' },
  { name: '卡介苗', ageMonths: 0, isRequired: true, description: '预防结核病' },
  { name: '脊灰疫苗(第1剂)', ageMonths: 2, isRequired: true, description: '预防脊髓灰质炎' },
  { name: '百白破疫苗(第1剂)', ageMonths: 3, isRequired: true, description: '预防百日咳、白喉、破伤风' },
  { name: '脊灰疫苗(第2剂)', ageMonths: 3, isRequired: true, description: '预防脊髓灰质炎' },
  { name: '百白破疫苗(第2剂)', ageMonths: 4, isRequired: true, description: '预防百日咳、白喉、破伤风' },
  { name: '脊灰疫苗(第3剂)', ageMonths: 4, isRequired: true, description: '预防脊髓灰质炎' },
  { name: '百白破疫苗(第3剂)', ageMonths: 5, isRequired: true, description: '预防百日咳、白喉、破伤风' },
  { name: '乙肝疫苗(第3剂)', ageMonths: 6, isRequired: true, description: '预防乙型肝炎' },
  { name: 'A群流脑疫苗(第1剂)', ageMonths: 6, isRequired: true, description: '预防流行性脑脊髓膜炎' },
  { name: '麻腮风疫苗', ageMonths: 8, isRequired: true, description: '预防麻疹、腮腺炎、风疹' },
  { name: '乙脑减毒活疫苗(第1剂)', ageMonths: 8, isRequired: true, description: '预防流行性乙型脑炎' },
  { name: '百白破疫苗(第4剂)', ageMonths: 18, isRequired: true, description: '加强免疫' },
  { name: '麻腮风疫苗(第2剂)', ageMonths: 18, isRequired: true, description: '加强免疫' },
  { name: 'A群流脑疫苗(第2剂)', ageMonths: 18, isRequired: true, description: '加强免疫' },
  { name: '乙脑减毒活疫苗(第2剂)', ageMonths: 24, isRequired: true, description: '加强免疫' },
  { name: '甲肝减毒活疫苗', ageMonths: 18, isRequired: true, description: '预防甲型肝炎' },
]

// 为宝宝生成疫苗计划
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { babyId } = await req.json()

    const baby = await db.baby.findUnique({ where: { id: babyId } })
    if (!baby) {
      return NextResponse.json({ error: '宝宝不存在' }, { status: 404 })
    }

    // 检查是否已有疫苗记录
    const existing = await db.vaccineRecord.count({
      where: { babyId },
    })
    if (existing > 0) {
      return NextResponse.json(
        { error: '该宝宝已有疫苗计划' },
        { status: 409 }
      )
    }

    // 生成疫苗计划
    const records = CHINA_VACCINE_SCHEDULE.map((vaccine) => {
      const birthday = baby.birthday ? new Date(baby.birthday) : new Date()
      const scheduledDate = new Date(birthday)
      scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.ageMonths)

      // 检查是否已过期
      const now = new Date()
      const status: 'OVERDUE' | 'PENDING' =
        scheduledDate < now ? 'OVERDUE' : 'PENDING'

      return {
        babyId,
        vaccineId: null, // 需要先创建疫苗记录
        status,
        scheduledDate,
        actualDate: null,
        notes: vaccine.description,
        hospital: null,
      }
    })

    // 批量创建
    await db.vaccineRecord.createMany({ data: records as any })

    return NextResponse.json({
      message: `已生成 ${records.length} 个疫苗计划`,
      records,
    })
  } catch (error) {
    console.error('Generate vaccine schedule error:', error)
    return NextResponse.json({ error: '生成疫苗计划失败' }, { status: 500 })
  }
}

// 获取宝宝的疫苗计划
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const babyId = searchParams.get('babyId')

    if (!babyId) {
      return NextResponse.json({ error: '缺少 babyId' }, { status: 400 })
    }

    const records = await db.vaccineRecord.findMany({
      where: { babyId },
      orderBy: { scheduledDate: 'asc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Get vaccines error:', error)
    return NextResponse.json({ error: '获取疫苗计划失败' }, { status: 500 })
  }
}
