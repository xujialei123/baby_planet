import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendBulkPush } from '@/lib/services/push'

// 发送推送通知（内部使用）
export async function POST(req: Request) {
  try {
    // 验证内部 API 密钥
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, title, body, url } = await req.json()

    // 获取用户的推送订阅
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
    })

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: '用户未订阅推送' })
    }

    const result = await sendBulkPush(subscriptions, {
      title,
      body,
      icon: '/icons/icon-192.png',
      url: url || '/',
    })

    // 清理过期订阅
    if (result.expired > 0) {
      // 实际应删除过期订阅
      console.log(`${result.expired} subscriptions expired`)
    }

    return NextResponse.json({
      message: `推送发送完成：${result.succeeded} 成功，${result.failed} 失败`,
      ...result,
    })
  } catch (error) {
    console.error('Send push error:', error)
    return NextResponse.json({ error: '发送推送失败' }, { status: 500 })
  }
}
