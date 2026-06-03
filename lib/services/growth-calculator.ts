/**
 * WHO 生长百分位计算器
 * 基于 WHO 儿童生长标准数据
 * 参考：https://www.who.int/tools/child-growth-standards
 */

// WHO 标准数据（简化版，0-24个月）
// 实际项目应使用完整的 LMS 表
const WHO_STANDARDS = {
  weight: {
    MALE: [
      { month: 0, L: -0.3487, M: 3.3464, S: 0.14602 },
      { month: 1, L: -0.2492, M: 4.4709, S: 0.13395 },
      { month: 2, L: -0.194, M: 5.5675, S: 0.12385 },
      { month: 3, L: -0.1595, M: 6.3762, S: 0.11727 },
      { month: 4, L: -0.1353, M: 7.0023, S: 0.11316 },
      { month: 5, L: -0.1174, M: 7.5105, S: 0.11081 },
      { month: 6, L: -0.1033, M: 7.934, S: 0.10958 },
      { month: 9, L: -0.0766, M: 8.909, S: 0.10772 },
      { month: 12, L: -0.0561, M: 9.648, S: 0.10716 },
      { month: 15, L: -0.0393, M: 10.243, S: 0.10747 },
      { month: 18, L: -0.025, M: 10.752, S: 0.10835 },
      { month: 21, L: -0.0126, M: 11.202, S: 0.10964 },
      { month: 24, L: -0.0016, M: 11.612, S: 0.11126 },
    ],
    FEMALE: [
      { month: 0, L: -0.3246, M: 3.2322, S: 0.1417 },
      { month: 1, L: -0.2134, M: 4.1873, S: 0.12947 },
      { month: 2, L: -0.1551, M: 5.1282, S: 0.1194 },
      { month: 3, L: -0.1194, M: 5.8458, S: 0.11306 },
      { month: 4, L: -0.0935, M: 6.4237, S: 0.10906 },
      { month: 5, L: -0.0736, M: 6.8985, S: 0.1067 },
      { month: 6, L: -0.0577, M: 7.297, S: 0.10537 },
      { month: 9, L: -0.0275, M: 8.212, S: 0.10394 },
      { month: 12, L: -0.0025, M: 8.934, S: 0.10375 },
      { month: 15, L: 0.0187, M: 9.524, S: 0.10435 },
      { month: 18, L: 0.0369, M: 10.03, S: 0.10552 },
      { month: 21, L: 0.0528, M: 10.484, S: 0.1071 },
      { month: 24, L: 0.0668, M: 10.902, S: 0.10898 },
    ],
  },
  height: {
    MALE: [
      { month: 0, L: 1, M: 49.1477, S: 0.03552 },
      { month: 1, L: 1, M: 53.6872, S: 0.03353 },
      { month: 2, L: 1, M: 57.0673, S: 0.03217 },
      { month: 3, L: 1, M: 59.8029, S: 0.03115 },
      { month: 4, L: 1, M: 62.0899, S: 0.03036 },
      { month: 5, L: 1, M: 64.0637, S: 0.02975 },
      { month: 6, L: 1, M: 65.7341, S: 0.02928 },
      { month: 9, L: 1, M: 69.8014, S: 0.02852 },
      { month: 12, L: 1, M: 73.3508, S: 0.0281 },
      { month: 15, L: 1, M: 76.4989, S: 0.02787 },
      { month: 18, L: 1, M: 79.3284, S: 0.02777 },
      { month: 21, L: 1, M: 81.9014, S: 0.02777 },
      { month: 24, L: 1, M: 84.2678, S: 0.02784 },
    ],
    FEMALE: [
      { month: 0, L: 1, M: 48.6207, S: 0.03466 },
      { month: 1, L: 1, M: 52.9084, S: 0.03278 },
      { month: 2, L: 1, M: 56.1117, S: 0.03159 },
      { month: 3, L: 1, M: 58.7421, S: 0.0307 },
      { month: 4, L: 1, M: 60.9549, S: 0.03 },
      { month: 5, L: 1, M: 62.8657, S: 0.02944 },
      { month: 6, L: 1, M: 64.5325, S: 0.02901 },
      { month: 9, L: 1, M: 68.485, S: 0.02833 },
      { month: 12, L: 1, M: 71.9053, S: 0.02798 },
      { month: 15, L: 1, M: 74.9269, S: 0.0278 },
      { month: 18, L: 1, M: 77.6308, S: 0.02773 },
      { month: 21, L: 1, M: 80.0881, S: 0.02774 },
      { month: 24, L: 1, M: 82.3529, S: 0.02781 },
    ],
  },
}

type MeasurementType = 'weight' | 'height' | 'head'
type Gender = 'MALE' | 'FEMALE' | 'OTHER'

/**
 * 使用 LMS 方法计算百分位
 * Z = ((X/M)^L - 1) / (L * S)
 * Percentile = CDF(Z)
 */
export function calculatePercentile(
  type: MeasurementType,
  value: number,
  ageMonths: number,
  gender: Gender
): number {
  // 头围暂用简化计算
  if (type === 'head') {
    return calculateHeadPercentile(value, ageMonths, gender)
  }

  // 如果性别是 OTHER，使用 MALE 标准
  const effectiveGender = gender === 'OTHER' ? 'MALE' : gender
  const standards = WHO_STANDARDS[type as 'weight' | 'height']?.[effectiveGender]
  if (!standards || standards.length === 0) return 50

  // 找到最接近的月龄数据
  const closest = standards.reduce((prev, curr) =>
    Math.abs(curr.month - ageMonths) < Math.abs(prev.month - ageMonths)
      ? curr
      : prev
  )

  const { L, M, S } = closest

  // LMS 公式计算 Z-score
  let z: number
  if (L === 0 || L === 1) {
    z = Math.log(value / M) / S
  } else {
    z = (Math.pow(value / M, L) - 1) / (L * S)
  }

  // Z-score 转百分位（正态分布 CDF）
  return zScoreToPercentile(z)
}

/**
 * 头围百分位（简化计算）
 */
function calculateHeadPercentile(
  value: number,
  ageMonths: number,
  gender: Gender
): number {
  // 如果性别是 OTHER，使用 MALE 标准
  const effectiveGender = gender === 'OTHER' ? 'MALE' : gender

  // 简化的头围标准值（均值和标准差）
  const headStd: Record<'MALE' | 'FEMALE', { mean: number; sd: number }[]> = {
    MALE: [
      { mean: 34.5, sd: 1.2 }, // 0月
      { mean: 37.0, sd: 1.2 }, // 1月
      { mean: 39.0, sd: 1.2 }, // 2月
      { mean: 40.5, sd: 1.2 }, // 3月
      { mean: 41.5, sd: 1.2 }, // 4月
      { mean: 42.5, sd: 1.2 }, // 5月
      { mean: 43.3, sd: 1.2 }, // 6月
      { mean: 45.0, sd: 1.2 }, // 9月
      { mean: 46.3, sd: 1.2 }, // 12月
      { mean: 47.3, sd: 1.2 }, // 15月
      { mean: 48.0, sd: 1.2 }, // 18月
      { mean: 48.6, sd: 1.2 }, // 21月
      { mean: 49.1, sd: 1.2 }, // 24月
    ],
    FEMALE: [
      { mean: 33.9, sd: 1.2 },
      { mean: 36.2, sd: 1.2 },
      { mean: 38.2, sd: 1.2 },
      { mean: 39.5, sd: 1.2 },
      { mean: 40.5, sd: 1.2 },
      { mean: 41.5, sd: 1.2 },
      { mean: 42.2, sd: 1.2 },
      { mean: 43.8, sd: 1.2 },
      { mean: 45.1, sd: 1.2 },
      { mean: 46.1, sd: 1.2 },
      { mean: 46.9, sd: 1.2 },
      { mean: 47.5, sd: 1.2 },
      { mean: 48.0, sd: 1.2 },
    ],
  }

  const index = Math.min(
    Math.floor(ageMonths / 3),
    headStd[effectiveGender].length - 1
  )
  const { mean, sd } = headStd[effectiveGender][index]
  const z = (value - mean) / sd

  return zScoreToPercentile(z)
}

/**
 * Z-score 转百分位（正态分布累积分布函数）
 */
function zScoreToPercentile(z: number): number {
  // Abramowitz and Stegun 近似公式
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return Math.round(((1.0 + sign * y) / 2) * 100)
}
