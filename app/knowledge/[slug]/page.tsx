import { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/layout'
import { Card, Badge } from '@/components/ui'

// 模拟文章数据
const ARTICLE = {
  title: '母乳喂养完全指南',
  slug: 'breastfeeding-guide',
  category: '喂养营养',
  author: '张医生',
  publishedAt: '2025-06-01',
  viewCount: 2345,
  content: `
# 母乳喂养完全指南

母乳是宝宝最天然、最营养的食物。世界卫生组织建议纯母乳喂养至少6个月。

## 开奶时机

产后1小时内是开奶的黄金时期。尽早让宝宝吸吮，有助于促进乳汁分泌。

## 正确的喂奶姿势

### 1. 摇篮式
最常见的姿势，适合足月健康宝宝。将宝宝放在膝盖上，头枕在肘弯处。

### 2. 交叉式
适合早产儿或吸吮力弱的宝宝。用对侧手托住宝宝的头。

### 3. 橄榄球式
适合剖腹产妈妈或双胞胎。将宝宝夹在腋下。

## 喂奶频率

- **新生儿期**：每天8-12次，按需喂养
- **2-3个月**：每天6-8次
- **4-6个月**：每天5-6次

## 常见问题

### 乳头疼痛
确保宝宝正确含乳，不要只含乳头。

### 奶水不足
增加吸吮频率，保证充足休息和营养。

### 涨奶
及时排空乳房，可用温毛巾热敷。

## 注意事项

1. 保证充足的水分摄入
2. 均衡饮食，避免刺激性食物
3. 保持良好的心态和充足的休息
4. 避免吸烟饮酒
5. 用药前咨询医生
  `,
}

export const metadata: Metadata = {
  title: ARTICLE.title,
  description: '母乳喂养完全指南，从开奶到断奶的全面指导',
}

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PageHeader title={ARTICLE.title} showBack />

      {/* 文章信息 */}
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="primary">{ARTICLE.category}</Badge>
          <span className="text-xs text-neutral-400">{ARTICLE.author}</span>
          <span className="text-xs text-neutral-400">·</span>
          <span className="text-xs text-neutral-400">{ARTICLE.publishedAt}</span>
          <span className="text-xs text-neutral-400">·</span>
          <span className="text-xs text-neutral-400">👁️ {ARTICLE.viewCount}</span>
        </div>
      </div>

      {/* 文章内容 */}
      <div className="px-4">
        <Card variant="outlined" padding="lg">
          <div className="prose prose-sm max-w-none">
            {ARTICLE.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={i} className="mb-4 text-2xl font-bold text-neutral-800">
                    {line.replace('# ', '')}
                  </h1>
                )
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={i} className="mb-3 mt-6 text-xl font-bold text-neutral-700">
                    {line.replace('## ', '')}
                  </h2>
                )
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={i} className="mb-2 mt-4 text-lg font-semibold text-neutral-700">
                    {line.replace('### ', '')}
                  </h3>
                )
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={i} className="ml-4 text-neutral-600">
                    {line.replace('- ', '')}
                  </li>
                )
              }
              if (line.match(/^\d+\. /)) {
                return (
                  <li key={i} className="ml-4 list-decimal text-neutral-600">
                    {line.replace(/^\d+\. /, '')}
                  </li>
                )
              }
              if (line.trim() === '') {
                return <br key={i} />
              }
              return (
                <p key={i} className="mb-2 text-neutral-600">
                  {line}
                </p>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 相关推荐 */}
      <div className="px-4 pt-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">相关推荐</h3>
        <div className="flex flex-col gap-2">
          <Link href="/knowledge/baby-food-guide">
            <Card variant="outlined" padding="sm">
              <p className="font-medium text-neutral-700">宝宝辅食添加时间表</p>
              <p className="text-xs text-neutral-500">喂养营养 · 1890次阅读</p>
            </Card>
          </Link>
          <Link href="/knowledge/sleep-training">
            <Card variant="outlined" padding="sm">
              <p className="font-medium text-neutral-700">如何培养宝宝自主入睡</p>
              <p className="text-xs text-neutral-500">睡眠护理 · 1567次阅读</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
