import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充种子数据...')

  // 创建测试用户
  const hashedPassword = await hash('Test1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'test@babyplanet.com' },
    update: {},
    create: {
      name: '测试妈妈',
      email: 'test@babyplanet.com',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log('✅ 创建测试用户:', user.email)

  // 创建家庭
  const family = await prisma.family.upsert({
    where: { inviteCode: 'TEST0001' },
    update: {},
    create: {
      name: '测试一家',
      inviteCode: 'TEST0001',
      ownerId: user.id,
    },
  })

  // 添加家庭成员
  await prisma.familyMember.upsert({
    where: {
      familyId_userId: { familyId: family.id, userId: user.id },
    },
    update: {},
    create: {
      familyId: family.id,
      userId: user.id,
      role: 'OWNER',
    },
  })
  console.log('✅ 创建测试家庭')

  // 创建宝宝
  const baby = await prisma.baby.upsert({
    where: { id: 'test-baby-1' },
    update: {},
    create: {
      id: 'test-baby-1',
      familyId: family.id,
      name: '小豆豆',
      gender: 'FEMALE',
      birthday: new Date('2025-01-15'),
      bloodType: 'A',
      birthWeight: 3.5,
      birthHeight: 50,
    },
  })
  console.log('✅ 创建测试宝宝:', baby.name)

  // 创建积分账户
  await prisma.pointBalance.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      balance: 120,
      totalEarned: 120,
      totalSpent: 0,
    },
  })
  console.log('✅ 创建积分账户')

  // 创建知识库分类
  const categories = await Promise.all(
    [
      { name: '喂养营养', slug: 'feeding', description: '母乳喂养、辅食添加等营养知识' },
      { name: '睡眠护理', slug: 'sleep', description: '宝宝睡眠习惯培养' },
      { name: '生长发育', slug: 'growth', description: '宝宝生长发育指标' },
      { name: '疫苗接种', slug: 'vaccine', description: '疫苗接种计划与注意事项' },
      { name: '常见疾病', slug: 'health', description: '婴幼儿常见疾病预防与护理' },
      { name: '早教启蒙', slug: 'education', description: '早期教育与智力开发' },
    ].map((cat) =>
      prisma.articleCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  )
  console.log('✅ 创建知识库分类')

  // 创建示例文章
  await prisma.article.upsert({
    where: { slug: 'breastfeeding-guide' },
    update: {},
    create: {
      title: '母乳喂养完全指南',
      slug: 'breastfeeding-guide',
      content: `
# 母乳喂养完全指南

母乳是宝宝最天然、最营养的食物。本文将为您详细介绍母乳喂养的方方面面。

## 开奶时机

产后1小时内是开奶的黄金时期。尽早让宝宝吸吮，有助于促进乳汁分泌。

## 正确的喂奶姿势

1. **摇篮式**：最常见的姿势，适合足月健康宝宝
2. **交叉式**：适合早产儿或吸吮力弱的宝宝
3. **橄榄球式**：适合剖腹产妈妈或双胞胎

## 喂奶频率

新生儿期：每天8-12次，按需喂养
2-3个月：每天6-8次
4-6个月：每天5-6次

## 注意事项

- 保证充足的水分摄入
- 均衡饮食，避免刺激性食物
- 保持良好的心态和充足的休息
      `,
      excerpt: '从开奶到断奶，全面了解母乳喂养的知识和技巧',
      category: '喂养营养',
      tags: ['母乳', '喂养', '新生儿'],
      authorId: user.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
  console.log('✅ 创建示例文章')

  // 创建示例圈子
  const circles = await Promise.all(
    [
      { name: '新手妈妈', description: '新手妈妈交流圈', icon: '👶' },
      { name: '辅食交流', description: '辅食制作与分享', icon: '🍚' },
      { name: '睡眠训练', description: '宝宝睡眠问题讨论', icon: '😴' },
      { name: '早教分享', description: '早教经验分享', icon: '📚' },
    ].map((circle) =>
      prisma.circle.upsert({
        where: { id: circle.name },
        update: {},
        create: {
          ...circle,
          memberCount: 1,
        },
      })
    )
  )
  console.log('✅ 创建社区圈子')

  // 创建敏感词库
  await prisma.sensitiveWord.createMany({
    data: [
      { word: '暴力', category: 'VIOLENCE', isActive: true },
      { word: '色情', category: 'PORNOGRAPHY', isActive: true },
      { word: '赌博', category: 'GAMBLING', isActive: true },
      { word: '毒品', category: 'DRUGS', isActive: true },
      { word: '代购', category: 'SPAM', isActive: true },
      { word: '刷单', category: 'SPAM', isActive: true },
    ],
    skipDuplicates: true,
  })
  console.log('✅ 创建敏感词库')

  console.log('🎉 种子数据填充完成！')
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
