/**
 * Brevo (原 Sendinblue) 邮件服务
 * 免费额度：300封/天
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface EmailOptions {
  to: string
  subject: string
  htmlContent: string
  senderEmail?: string
  senderName?: string
}

export async function sendEmail(options: EmailOptions) {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    console.warn('Brevo API key not configured')
    return { success: false, error: 'API key not configured' }
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          email: options.senderEmail || process.env.BREVO_SENDER_EMAIL,
          name: options.senderName || process.env.BREVO_SENDER_NAME || '宝贝星球',
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 发送疫苗提醒邮件
 */
export async function sendVaccineReminder(
  email: string,
  babyName: string,
  vaccineName: string,
  scheduledDate: string
) {
  return sendEmail({
    to: email,
    subject: `💉 疫苗提醒：${babyName}的${vaccineName}即将到期`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b85;">🌍 宝贝星球 - 疫苗提醒</h2>
        <p>亲爱的家长，</p>
        <p><strong>${babyName}</strong>的<strong>${vaccineName}</strong>将于 <strong>${scheduledDate}</strong> 到期。</p>
        <p>请及时带宝宝前往接种点完成接种。</p>
        <a href="https://babyplanet.com/baby/vaccines"
           style="display: inline-block; background: #ffb5c2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          查看疫苗计划
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 12px;">
          此邮件由宝贝星球自动发送，如需退订请在设置中关闭邮件通知。
        </p>
      </div>
    `,
  })
}

/**
 * 发送每日摘要邮件
 */
export async function sendDailySummary(
  email: string,
  babyName: string,
  summary: {
    feedings: number
    sleepHours: number
    diapers: number
  }
) {
  return sendEmail({
    to: email,
    subject: `📊 ${babyName}的今日成长摘要`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b85;">🌍 宝贝星球 - 今日摘要</h2>
        <p>亲爱的家长，</p>
        <p>以下是<strong>${babyName}</strong>今天的成长记录：</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>🍼 喂养：${summary.feedings} 次</p>
          <p>😴 睡眠：${summary.sleepHours} 小时</p>
          <p>👶 换尿布：${summary.diapers} 次</p>
        </div>
        <a href="https://babyplanet.com/baby/records"
           style="display: inline-block; background: #ffb5c2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          查看详细记录
        </a>
      </div>
    `,
  })
}
