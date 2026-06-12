import type { RuleItem, RuleTemplate, RuleSection } from '../types/rule'
import { SECTIONS } from '../types/rule'

function quoteYamlSingle(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function ruleItemToLine(item: RuleItem): string {
  const parts = [item.type, item.value, item.policy, ...item.extra]
  return parts.filter(Boolean).join(',')
}

export function exportTemplateToYaml(
  template: RuleTemplate,
  options?: { includeDisabled?: boolean }
): string {
  const lines: string[] = []

  for (const section of SECTIONS) {
    const items = template.sections[section]
    const filtered = options?.includeDisabled
      ? items
      : items.filter(r => r.enabled)

    if (filtered.length === 0) {
      lines.push(`${section}: []`)
    } else {
      lines.push(`${section}:`)
      for (const item of filtered) {
        lines.push(`  - ${quoteYamlSingle(ruleItemToLine(item))}`)
      }
    }
  }

  return lines.join('\n')
}
