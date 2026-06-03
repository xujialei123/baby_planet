import webPush from 'web-push'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? ''
const vapidMailto = process.env.VAPID_MAILTO ?? 'mailto:admin@babyplanet.com'

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey)
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  url?: string
}

/**
 * 发送 Web Push 通知
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string
    p256dh: string
    auth: string
  },
  payload: PushPayload
) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    }

    await webPush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    )

    return { success: true }
  } catch (error: any) {
    console.error('Push notification error:', error)

    // 订阅过期或无效
    if (error.statusCode === 410) {
      return { success: false, expired: true }
    }

    return { success: false, error: error.message }
  }
}

/**
 * 批量发送推送通知
 */
export async function sendBulkPush(
  subscriptions: Array<{
    endpoint: string
    p256dh: string
    auth: string
  }>,
  payload: PushPayload
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  )

  const succeeded = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length

  const failed = results.filter(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
  ).length

  const expired = results.filter(
    (r) =>
      r.status === 'fulfilled' && (r.value as any).expired
  ).length

  return { succeeded, failed, expired }
}

/**
 * 生成 VAPID 密钥对（首次配置时使用）
 */
export function generateVapidKeys() {
  return webPush.generateVAPIDKeys()
}
