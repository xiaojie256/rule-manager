import type { RuleItem, PolicyAlias, ValidationIssue } from '../types/rule'
import { ValidationPanel } from './ValidationPanel'
import { PolicyReplacePanel } from './PolicyReplacePanel'

interface Props {
  rules: RuleItem[]
  policies: PolicyAlias[]
  issues: ValidationIssue[]
  onReplace: (from: string, to: string) => void
  onBatchReplaceAll: (to: string) => void
}

export function RightPanel({
  rules,
  policies,
  issues,
  onReplace,
  onBatchReplaceAll,
}: Props) {
  return (
    <div className="right-panel">
      <PolicyReplacePanel
        rules={rules}
        policies={policies}
        onReplace={onReplace}
        onBatchReplaceAll={onBatchReplaceAll}
      />
      <ValidationPanel issues={issues} />
    </div>
  )
}
