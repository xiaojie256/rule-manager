import type { RuleItem, PolicyAlias, ValidationIssue } from '../types/rule'
import { ValidationPanel } from './ValidationPanel'
import { PolicyReplacePanel } from './PolicyReplacePanel'

interface Props {
  rules: RuleItem[]
  policies: PolicyAlias[]
  issues: ValidationIssue[]
  onReplace: (from: string, to: string) => void
  onBatchReplaceAll: (to: string) => void
  proxyGroups: string[]
  onAddProxyGroup: (name: string) => void
  onRemoveProxyGroup: (name: string) => void
}

export function RightPanel({
  rules,
  policies,
  issues,
  onReplace,
  onBatchReplaceAll,
  proxyGroups,
  onAddProxyGroup,
  onRemoveProxyGroup,
}: Props) {
  return (
    <div className="right-panel">
      <PolicyReplacePanel
        rules={rules}
        policies={policies}
        onReplace={onReplace}
        onBatchReplaceAll={onBatchReplaceAll}
        proxyGroups={proxyGroups}
        onAddProxyGroup={onAddProxyGroup}
        onRemoveProxyGroup={onRemoveProxyGroup}
      />
      <ValidationPanel issues={issues} />
    </div>
  )
}
