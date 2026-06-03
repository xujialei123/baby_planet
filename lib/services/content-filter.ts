/**
 * 内容审核服务 - DFA 敏感词过滤
 * 使用确定有限自动机算法实现高效敏感词匹配
 */

// 基础敏感词库（实际项目应从数据库加载）
const DEFAULT_SENSITIVE_WORDS = [
  // 涉政敏感词
  '暴力', '恐怖', '色情', '赌博', '毒品',
  // 广告词
  '代购', '刷单', '兼职日赚',
  // 侮辱性词汇
  '傻逼', '操你', '去死',
]

interface DFAState {
  [key: string]: DFAState | null
}

/**
 * 构建 DFA 状态机
 */
function buildDFA(words: string[]): DFAState {
  const root: DFAState = {}

  for (const word of words) {
    let current = root
    for (const char of word) {
      if (!current[char]) {
        current[char] = {}
      }
      current = current[char] as DFAState
    }
    // 标记词尾
    current['\0'] = null
  }

  return root
}

/**
 * 检测文本是否包含敏感词
 */
export function filterText(
  text: string,
  customWords: string[] = []
): { isClean: boolean; filtered: string; matches: string[] } {
  const allWords = [...DEFAULT_SENSITIVE_WORDS, ...customWords]
  const dfa = buildDFA(allWords)
  const matches: string[] = []
  let filtered = text

  for (let i = 0; i < text.length; i++) {
    let current: DFAState | null = dfa
    let matchEnd = -1

    for (let j = i; j < text.length; j++) {
      const char = text[j]
      if (!current || !current[char]) break

      current = current[char] as DFAState
      if (current['\0'] !== undefined) {
        matchEnd = j
      }
    }

    if (matchEnd !== -1) {
      const match = text.slice(i, matchEnd + 1)
      matches.push(match)
      // 替换为 *
      const replacement = '*'.repeat(match.length)
      filtered =
        filtered.slice(0, i) +
        replacement +
        filtered.slice(i + match.length)
      i = matchEnd // 跳过已匹配的部分
    }
  }

  return {
    isClean: matches.length === 0,
    filtered,
    matches,
  }
}

/**
 * 检查帖子/评论内容是否合规
 */
export async function moderateContent(
  content: string,
  customWords: string[] = []
): Promise<{
  approved: boolean
  reason?: string
  filteredContent: string
}> {
  const result = filterText(content, customWords)

  if (!result.isClean) {
    return {
      approved: false,
      reason: `内容包含敏感词：${result.matches.slice(0, 3).join('、')}`,
      filteredContent: result.filtered,
    }
  }

  // 检查内容长度
  if (content.length < 2) {
    return {
      approved: false,
      reason: '内容过短',
      filteredContent: content,
    }
  }

  return {
    approved: true,
    filteredContent: content,
  }
}
