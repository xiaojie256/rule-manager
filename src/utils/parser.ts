import * as YAML from 'yaml'
import { nanoid } from 'nanoid'
import type { RuleItem, RuleSection, RuleTemplate } from '../types/rule'
import { SECTIONS } from '../types/rule'

export function parseRuleLine(line: string, section: RuleSection): RuleItem {
  const raw = typeof line === 'string' ? line.trim() : String(line)
  const parts = raw.split(',').map(s => s.trim())
  const type = parts[0] || ''
  const value = parts[1] || ''
  const policy = parts[2] || ''
  const extra = parts.slice(3)

  let error: string | undefined
  if (!type) error = '匹配类型为空'
  else if (!raw.includes(',')) error = '规则格式异常，缺少逗号分隔'

  return {
    id: nanoid(10),
    section,
    enabled: true,
    raw,
    type,
    value,
    policy,
    extra,
    error,
  }
}

export function parseYamlToTemplate(yamlText: string): RuleTemplate {
  const doc = YAML.parse(yamlText)
  if (!doc || typeof doc !== 'object') {
    throw new Error('YAML 解析结果为空或格式不正确')
  }

  const sections: RuleTemplate['sections'] = {
    prepend: [],
    append: [],
    delete: [],
  }

  for (const section of SECTIONS) {
    const raw = doc[section]
    if (Array.isArray(raw)) {
      sections[section] = raw.map((item: unknown) => {
        const str = typeof item === 'string' ? item : String(item)
        return parseRuleLine(str, section)
      })
    } else if (raw === null || raw === undefined) {
      sections[section] = []
    } else {
      sections[section] = [parseRuleLine(String(raw), section)]
    }
  }

  // Extract proxy-groups from YAML
  const proxyGroups: string[] = Array.isArray(doc['proxy-groups'])
    ? (doc['proxy-groups'] as unknown[])
        .map((g: unknown) => {
          if (g && typeof g === 'object' && 'name' in (g as Record<string, unknown>)) {
            return String((g as { name?: unknown }).name || '').trim()
          }
          return ''
        })
        .filter(Boolean)
    : []

  return {
    id: nanoid(10),
    name: '导入的模板',
    sections,
    proxyGroups,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
