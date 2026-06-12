import type { RuleTemplate, PolicyAlias } from '../types/rule'

const KEYS = {
  templates: 'rule-manager.templates',
  current: 'rule-manager.current',
  policies: 'rule-manager.policies',
  theme: 'rule-manager.theme',
  history: 'rule-manager.history',
  proxyGroups: 'rule-manager.proxyGroups',
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

export function saveTemplates(templates: RuleTemplate[]): void {
  safeSet(KEYS.templates, templates)
}

export function loadTemplates(): RuleTemplate[] {
  return safeGet<RuleTemplate[]>(KEYS.templates, [])
}

export function saveCurrentTemplate(template: RuleTemplate): void {
  safeSet(KEYS.current, template)
}

export function loadCurrentTemplate(): RuleTemplate | null {
  return safeGet<RuleTemplate | null>(KEYS.current, null)
}

export function savePolicies(policies: PolicyAlias[]): void {
  safeSet(KEYS.policies, policies)
}

export function loadPolicies(): PolicyAlias[] | null {
  return safeGet<PolicyAlias[] | null>(KEYS.policies, null)
}

export function saveTheme(theme: 'dark' | 'light'): void {
  safeSet(KEYS.theme, theme)
}

export function loadTheme(): 'dark' | 'light' {
  return safeGet<'dark' | 'light'>(KEYS.theme, 'dark')
}

export function saveHistory(history: RuleTemplate[]): void {
  safeSet(KEYS.history, history.slice(-20))
}

export function loadHistory(): RuleTemplate[] {
  return safeGet<RuleTemplate[]>(KEYS.history, [])
}

export function saveProxyGroups(groups: string[]): void {
  safeSet(KEYS.proxyGroups, groups)
}

export function loadProxyGroups(): string[] {
  return safeGet<string[]>(KEYS.proxyGroups, [])
}
