export type RuleSection = 'prepend' | 'append' | 'delete'

export interface RuleItem {
  id: string
  section: RuleSection
  enabled: boolean
  raw: string
  type: string
  value: string
  policy: string
  extra: string[]
  comment?: string
  group?: string
  error?: string
}

export interface RuleTemplate {
  id: string
  name: string
  description?: string
  sections: {
    prepend: RuleItem[]
    append: RuleItem[]
    delete: RuleItem[]
  }
  createdAt: number
  updatedAt: number
}

export interface PolicyAlias {
  id: string
  name: string
  value: string
}

export interface ValidationIssue {
  id: string
  level: 'error' | 'warning'
  ruleId?: string
  message: string
}

export const RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'IP-CIDR6',
  'GEOIP',
  'GEOSITE',
  'PROCESS-NAME',
  'RULE-SET',
  'MATCH',
] as const

export const SECTIONS: RuleSection[] = ['prepend', 'append', 'delete']
