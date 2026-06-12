import { nanoid } from 'nanoid'
import type { RuleItem, RuleTemplate, ValidationIssue } from '../types/rule'
import { SECTIONS } from '../types/rule'

const DOMAIN_TYPES = ['DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD']

function ruleKey(r: RuleItem): string {
  return `${r.type},${r.value},${r.policy}`
}

export function validateTemplate(template: RuleTemplate): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const allRules: RuleItem[] = []

  for (const section of SECTIONS) {
    allRules.push(...template.sections[section])
  }

  // Basic validation
  for (const rule of allRules) {
    if (!rule.enabled) continue

    if (!rule.type) {
      issues.push({
        id: nanoid(8),
        level: 'error',
        ruleId: rule.id,
        message: `匹配类型不能为空 [${rule.raw}]`,
      })
    }

    if (!rule.policy) {
      issues.push({
        id: nanoid(8),
        level: 'error',
        ruleId: rule.id,
        message: `策略不能为空 [${rule.raw}]`,
      })
    }

    if (rule.type !== 'MATCH' && !rule.value) {
      issues.push({
        id: nanoid(8),
        level: 'error',
        ruleId: rule.id,
        message: `参数不能为空 [${rule.type}]`,
      })
    }

    if (
      DOMAIN_TYPES.includes(rule.type) &&
      (rule.value.startsWith('http://') || rule.value.startsWith('https://'))
    ) {
      issues.push({
        id: nanoid(8),
        level: 'warning',
        ruleId: rule.id,
        message: `域名参数不应包含协议头 [${rule.value}]`,
      })
    }

    if (DOMAIN_TYPES.includes(rule.type) && rule.value.includes(' ')) {
      issues.push({
        id: nanoid(8),
        level: 'error',
        ruleId: rule.id,
        message: `域名参数不能包含空格 [${rule.value}]`,
      })
    }

    if (
      (rule.type === 'IP-CIDR' || rule.type === 'IP-CIDR6') &&
      !rule.value.includes('/')
    ) {
      issues.push({
        id: nanoid(8),
        level: 'warning',
        ruleId: rule.id,
        message: `IP-CIDR 类型建议包含 CIDR 前缀 [${rule.value}]`,
      })
    }

    if (rule.error) {
      issues.push({
        id: nanoid(8),
        level: 'error',
        ruleId: rule.id,
        message: rule.error,
      })
    }
  }

  // Duplicate check
  const enabledRules = allRules.filter(r => r.enabled)
  const keyCount = new Map<string, RuleItem[]>()
  for (const r of enabledRules) {
    const key = ruleKey(r)
    if (!keyCount.has(key)) keyCount.set(key, [])
    keyCount.get(key)!.push(r)
  }
  for (const [key, items] of keyCount) {
    if (items.length > 1) {
      issues.push({
        id: nanoid(8),
        level: 'warning',
        ruleId: items[0].id,
        message: `发现完全重复的规则 (${items.length} 条): ${key}`,
      })
    }
  }

  // Near-duplicate & policy inconsistency
  const domainRules = enabledRules.filter(r => DOMAIN_TYPES.includes(r.type))
  for (let i = 0; i < domainRules.length; i++) {
    for (let j = i + 1; j < domainRules.length; j++) {
      const a = domainRules[i]
      const b = domainRules[j]
      const parent = a.value.length < b.value.length ? a : b
      const child = a.value.length < b.value.length ? b : a

      if (
        child.value.endsWith('.' + parent.value) &&
        child.policy !== parent.policy
      ) {
        issues.push({
          id: nanoid(8),
          level: 'warning',
          ruleId: child.id,
          message: `同域名体系下策略可能不一致: ${parent.value}(${parent.policy}) 与 ${child.value}(${child.policy})`,
        })
      }

      if (
        (a.value === b.value || child.value.endsWith('.' + parent.value)) &&
        a.type === b.type &&
        a.policy === b.policy &&
        a.value !== b.value
      ) {
        issues.push({
          id: nanoid(8),
          level: 'warning',
          ruleId: b.id,
          message: `可能存在父子域名重复: ${a.value} 与 ${b.value}`,
        })
      }
    }
  }

  return issues
}

export function getDuplicateCount(template: RuleTemplate): number {
  const allRules = [
    ...template.sections.prepend,
    ...template.sections.append,
    ...template.sections.delete,
  ].filter(r => r.enabled)

  const keyCount = new Map<string, number>()
  let dupes = 0
  for (const r of allRules) {
    const key = ruleKey(r)
    const count = (keyCount.get(key) || 0) + 1
    keyCount.set(key, count)
    if (count === 2) dupes++ // count the pair once
  }
  return dupes
}
