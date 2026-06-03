import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 客户端用（浏览器端，匿名权限）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端用（管理员权限，用于上传文件等）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * 使用 Supabase Storage 上传文件（可替代 Cloudflare R2）
 * 免费额度：1GB 存储
 */
export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType?: string
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    })

  if (error) throw error

  // 获取公开 URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  }
}

/**
 * 获取预签名上传 URL（用于前端直传）
 */
export async function getUploadUrl(
  bucket: string,
  path: string
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path)

  if (error) throw error

  return data
}

/**
 * 删除文件
 */
export async function deleteFromSupabase(bucket: string, paths: string[]) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .remove(paths)

  if (error) throw error
  return data
}

/**
 * 获取文件公开 URL
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}
