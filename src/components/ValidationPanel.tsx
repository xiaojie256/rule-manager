import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import type { ValidationIssue } from '../types/rule'

interface Props {
  issues: ValidationIssue[]
}

export function ValidationPanel({ issues }: Props) {
  const errors = issues.filter(i => i.level === 'error')
  const warnings = issues.filter(i => i.level === 'warning')

  if (issues.length === 0) {
    return (
      <div className="validation-panel">
        <div className="panel-title">
          <CheckCircle size={14} className="icon-success" /> 校验结果
        </div>
        <div className="validation-ok">所有规则校验通过</div>
      </div>
    )
  }

  return (
    <div className="validation-panel">
      <div className="panel-title">
        校验结果
        {errors.length > 0 && (
          <span className="badge badge-error">{errors.length} 错误</span>
        )}
        {warnings.length > 0 && (
          <span className="badge badge-warning">{warnings.length} 警告</span>
        )}
      </div>
      <div className="validation-list">
        {issues.map(issue => (
          <div
            key={issue.id}
            className={`validation-item validation-${issue.level}`}
          >
            {issue.level === 'error' ? (
              <AlertCircle size={14} />
            ) : (
              <AlertTriangle size={14} />
            )}
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
