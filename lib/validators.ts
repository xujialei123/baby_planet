import { z } from 'zod'

/** 注册表单 */
export const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '密码需包含大小写字母和数字'
  ),
})

/** 登录表单 */
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

/** 创建家庭 */
export const familySchema = z.object({
  name: z.string().min(2, '家庭名称至少2个字符').max(30),
})

/** 添加宝宝 */
export const babySchema = z.object({
  name: z.string().min(1, '请输入宝宝姓名').max(30),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  birthday: z.string().min(1, '请选择生日'),
  bloodType: z.enum(['A', 'B', 'AB', 'O', 'UNKNOWN']).optional(),
  birthWeight: z.number().min(0.5).max(10).optional(), // kg
  birthHeight: z.number().min(30).max(70).optional(), // cm
})

/** 日常记录 */
export const dailyRecordSchema = z.object({
  babyId: z.string(),
  type: z.enum(['FEEDING', 'SLEEP', 'DIAPER', 'MEDICINE', 'TEMPERATURE']),
  startTime: z.string().min(1, '请选择开始时间'),
  endTime: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  notes: z.string().max(500).optional(),
})

/** 生长记录 */
export const growthRecordSchema = z.object({
  babyId: z.string(),
  date: z.string().min(1, '请选择日期'),
  weight: z.number().min(0.5).max(50).optional(), // kg
  height: z.number().min(30).max(200).optional(), // cm
  headCircumference: z.number().min(20).max(70).optional(), // cm
})

/** 社区帖子 */
export const postSchema = z.object({
  circleId: z.string(),
  title: z.string().min(2, '标题至少2个字符').max(100),
  content: z.string().min(10, '内容至少10个字符').max(10000),
  type: z.enum(['DISCUSSION', 'QUESTION', 'EXPERIENCE', 'MILESTONE']),
})

/** 评论 */
export const commentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, '评论不能为空').max(2000),
  parentId: z.string().optional(),
})

/** 积分充值（模拟） */
export const pointRechargeSchema = z.object({
  amount: z.number().min(1).max(10000),
  method: z.enum(['ALIPAY_WECHAT_SIMULATED']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BabyInput = z.infer<typeof babySchema>
export type DailyRecordInput = z.infer<typeof dailyRecordSchema>
export type GrowthRecordInput = z.infer<typeof growthRecordSchema>
export type PostInput = z.infer<typeof postSchema>
export type CommentInput = z.infer<typeof commentSchema>
