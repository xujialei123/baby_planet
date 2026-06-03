import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// 保存推送订阅
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { endpoint, keys } = await req.json()

    await db.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint,
        },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    return NextResponse.json({ message: '订阅成功' })
  } catch (error) {
    console.error('Subscribe push error:', error)
    return NextResponse.json({ error: '订阅失败' }, { status: 500 })
  }
}

// 取消订阅
export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json()

    await db.pushSubscription.deleteMany({
      where: { endpoint },
    })

    return NextResponse.json({ message: '已取消订阅' })
  } catch (error) {
    console.error('Unsubscribe push error:', error)
    return NextResponse.json({ error: '取消订阅失败' }, { status: 500 })
  }
}
