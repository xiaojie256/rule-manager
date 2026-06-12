import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import type { RuleItem, PolicyAlias } from '../types/rule'

interface Props {
  rules: RuleItem[]
  policies: PolicyAlias[]
  onReplace: (from: string, to: string) => void
  onBatchReplaceAll: (to: string) => void
}

export function PolicyReplacePanel({
  rules,
  policies,
  onReplace,
  onBatchReplaceAll,
}: Props) {
  const [fromPolicy, setFromPolicy] = useState('')
  const [toPolicy, setToPolicy] = useState('')

  // Policy statistics
  const stats = new Map<string, number>()
  for (const r of rules) {
    if (!r.enabled) continue
    stats.set(r.policy, (stats.get(r.policy) || 0) + 1)
  }

  const sortedStats = Array.from(stats.entries()).sort((a, b) => b[1] - a[1])
  const allPolicies = [
    ...new Set([...policies.map(p => p.value), ...stats.keys()]),
  ].filter(Boolean)

  const quickButtons = ['DIRECT', '节点选择', 'PROXY', 'REJECT']

  return (
    <div className="policy-panel">
      <div className="panel-title">
        <Zap size={14} /> 策略快速替换
      </div>

      {/* Stats */}
      <div className="policy-stats">
        {sortedStats.length === 0 && (
          <div className="policy-stat-empty">暂无策略数据</div>
        )}
        {sortedStats.map(([policy, count]) => (
          <div key={policy} className="policy-stat-item">
            <span className="policy-stat-name">{policy}</span>
            <span className="policy-stat-count">{count} 条</span>
          </div>
        ))}
      </div>

      {/* Single replace */}
      <div className="policy-replace-section">
        <div className="section-label">单项替换</div>
        <div className="policy-replace-row">
          <select
            className="cell-select"
            value={fromPolicy}
            onChange={e => setFromPolicy(e.target.value)}
          >
            <option value="">-- 原策略 --</option>
            {allPolicies.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ArrowRight size={14} className="arrow-icon" />
          <select
            className="cell-select"
            value={toPolicy}
            onChange={e => setToPolicy(e.target.value)}
          >
            <option value="">-- 新策略 --</option>
            {allPolicies.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-sm btn-primary btn-full"
          disabled={!fromPolicy || !toPolicy || fromPolicy === toPolicy}
          onClick={() => {
            onReplace(fromPolicy, toPolicy)
            setFromPolicy('')
            setToPolicy('')
          }}
        >
          替换
        </button>
      </div>

      {/* Quick buttons */}
      <div className="policy-replace-section">
        <div className="section-label">全部替换为</div>
        <div className="quick-buttons">
          {quickButtons.map(p => (
            <button
              key={p}
              className="btn btn-sm btn-full"
              onClick={() => onBatchReplaceAll(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
