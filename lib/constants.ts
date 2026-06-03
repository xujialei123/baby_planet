/** 应用名称 */
export const APP_NAME = '宝贝星球'
export const APP_DESCRIPTION = '智能育儿助手，陪伴宝宝每一步成长'

/** 免费服务限制 */
export const FREE_LIMITS = {
  R2_STORAGE_GB: 10,
  R2_BANDWIDTH_GB_PER_MONTH: 10,
  BREVO_EMAILS_PER_DAY: 300,
  FAMILY_MEMBERS_MAX: 10,
  BABIES_PER_FAMILY: 5,
  PHOTOS_PER_BABY: 500,
  FREE_CONSULTATIONS_PER_MONTH: 2,
} as const

/** 积分系统 */
export const POINTS = {
  SIGNUP_BONUS: 100,
  DAILY_CHECKIN: 5,
  FIRST_RECORD: 20,
  CONSULTATION_COST: 50,
  REFERRAL_BONUS: 30,
} as const

/** 记录类型 */
export const RECORD_TYPES = {
  FEEDING: 'feeding',
  SLEEP: 'sleep',
  DIAPER: 'diaper',
  MEDICINE: 'medicine',
  TEMPERATURE: 'temperature',
} as const

/** 喂养方式 */
export const FEEDING_METHODS = {
  BREAST_LEFT: 'breast_left',
  BREAST_RIGHT: 'breast_right',
  BOTTLE: 'bottle',
  SOLID: 'solid',
} as const

/** 疫苗接种状态 */
export const VACCINE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  OVERDUE: 'overdue',
} as const

/** 社区帖子类型 */
export const POST_TYPES = {
  DISCUSSION: 'discussion',
  QUESTION: 'question',
  EXPERIENCE: 'experience',
  MILESTONE: 'milestone',
} as const
