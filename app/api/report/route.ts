import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'

// 生成宝宝报告数据
export async function GET(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const babyId = searchParams.get('babyId')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!babyId) {
      return NextResponse.json({ error: '缺少 babyId' }, { status: 400 })
    }

    const dateFilter = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    }

    const [
      baby,
      records,
      growthRecords,
      vaccineRecords,
      milestones,
    ] = await Promise.all([
      db.baby.findUnique({ where: { id: babyId } }),
      db.dailyRecord.findMany({
        where: {
          babyId,
          startTime: dateFilter,
        },
        orderBy: { startTime: 'desc' },
      }),
      db.growthRecord.findMany({
        where: {
          babyId,
          date: dateFilter,
        },
        orderBy: { date: 'asc' },
      }),
      db.vaccineRecord.findMany({
        where: { babyId },
        orderBy: { scheduledDate: 'asc' },
      }),
      db.milestoneRecord.findMany({
        where: { babyId },
      }),
    ])

    if (!baby) {
      return NextResponse.json({ error: '宝宝不存在' }, { status: 404 })
    }

    // 统计数据
    const feedingRecords = records.filter((r) => r.type === 'FEEDING')
    const sleepRecords = records.filter((r) => r.type === 'SLEEP')
    const diaperRecords = records.filter((r) => r.type === 'DIAPER')

    const report = {
      baby: {
        name: baby.name,
        gender: baby.gender,
        birthday: baby.birthday,
      },
      period: { start: startDate, end: endDate },
      summary: {
        totalDays: records.length > 0
          ? Math.ceil(
              (new Date(endDate || Date.now()).getTime() -
                new Date(startDate || baby.birthday || Date.now()).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
        feedings: feedingRecords.length,
        sleeps: sleepRecords.length,
        diapers: diaperRecords.length,
      },
      growth: growthRecords.map((r) => ({
        date: r.date,
        weight: r.weight,
        height: r.height,
        headCircumference: r.headCircumference,
        weightPercentile: r.weightPercentile,
        heightPercentile: r.heightPercentile,
      })),
      vaccines: {
        total: vaccineRecords.length,
        completed: vaccineRecords.filter((v) => v.status === 'COMPLETED').length,
        pending: vaccineRecords.filter((v) => v.status === 'PENDING').length,
        overdue: vaccineRecords.filter((v) => v.status === 'OVERDUE').length,
      },
      milestones: {
        achieved: milestones.length,
      },
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: '生成报告失败' }, { status: 500 })
  }
}
