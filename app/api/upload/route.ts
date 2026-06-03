import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { nanoid } from '@/lib/utils'

// 支持两种存储后端：Cloudflare R2 或 Supabase Storage
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'supabase' // 'r2' | 'supabase'

// 获取预签名上传 URL
export async function POST(req: Request) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { filename, contentType, folder = 'photos' } = await req.json()

    // 生成唯一文件名
    const ext = filename.split('.').pop()
    const uniqueId = nanoid(12)
    const path = `${folder}/${uniqueId}.${ext}`

    if (STORAGE_PROVIDER === 'r2') {
      // Cloudflare R2
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

      const R2 = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
        },
      })

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: path,
        ContentType: contentType,
      })

      const presignedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })

      return NextResponse.json({
        provider: 'r2',
        presignedUrl,
        path,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${path}`,
      })
    } else {
      // Supabase Storage
      const { getUploadUrl } = await import('@/lib/supabase')

      const { signedUrl } = await getUploadUrl('baby-planet', path)

      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/baby-planet/${path}`

      return NextResponse.json({
        provider: 'supabase',
        presignedUrl: signedUrl,
        path,
        publicUrl,
      })
    }
  } catch (error) {
    console.error('Generate upload URL error:', error)
    return NextResponse.json({ error: '生成上传链接失败' }, { status: 500 })
  }
}
