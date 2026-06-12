import { useState, useMemo } from 'react'
import { ArrowRight, Zap, Plus, X } from 'lucide-react'
import type { RuleItem, PolicyAlias } from '../types/rule'

interface Props {
  rules: RuleItem[]
  policies: PolicyAlias[]
  onReplace: (from: string, to: string) => void
  onBatchReplaceAll: (to: string) => void
  proxyGroups: string[]
  onAddProxyGroup: (name: string) => void
  onRemoveProxyGroup: (name: string) => void
}

const BUILTIN_POLICIES = ['DIRECT', 'PROXY', 'REJECT']

function detectMainGroup(groups: string[]): string | null {
  if (groups.length === 0) return null
  const keywords = ['节点选择', 'select', 'proxy', '代理', '手动', '自动', '香港', '日本', '美国', '🚀']
  const found = groups.find(g => keywords.some(k => g.toLowerCase().includes(k.toLowerCase())))
  return found || groups[0]
}

export function PolicyReplacePanel({
  rules,
  policies,
  onReplace,
  onBatchReplaceAll,
  proxyGroups,
  onAddProxyGroup,
  onRemoveProxyGroup,
}: Props) {
  const [fromPolicy, setFromPolicy] = useState('')
  const [toPolicy, setToPolicy] = useState('')
  const [newGroup, setNewGroup] = useState('')

  const allPolicies = useMemo(() => {
    const set = new Set<string>(BUILTIN_POLICIES)
    for (const r of rules) { if (r.policy) set.add(r.policy) }
    for (const g of proxyGroups) set.add(g)
    for (const p of policies) { if (p.value) set.add(p.value) }
    return Array.from(set).sort((a, b) => {
      const ai = BUILTIN_POLICIES.indexOf(a)
      const bi = BUILTIN_POLICIES.indexOf(b)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
  }, [rules, policies, proxyGroups])

  const stats = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rules) {
      if (!r.enabled) continue
      m.set(r.policy, (m.get(r.policy) || 0) + 1)
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [rules])

  const mainGroup = detectMainGroup(proxyGroups)

  const handleAddGroup = () => {
    const name = newGroup.trim()
    if (name && !proxyGroups.includes(name)) {
      onAddProxyGroup(name)
      setNewGroup('')
    }
  }

  return (
    <div className="policy-panel">
      <div className="panel-title"><Zap size={14} /> 策略快速替换</div>

      <div className="policy-replace-section">
        <div className="section-label">策略组</div>
        {proxyGroups.length > 0 ? (
          <div className="group-tags">
            {proxyGroups.map(g => (
              <span key={g} className={`group-tag ${g === mainGroup ? 'group-tag-main' : ''}`}>
                {g}
                {g === mainGroup && <span className="group-tag-badge">主</span>}
                <button className="group-tag-remove" onClick={() => onRemoveProxyGroup(g)}><X size={10} /></button>
              </span>
            ))}
          </div>
        ) : (
          <div className="group-empty">暂无策略组，请导入 YAML 或手动添加</div>
        )}
        <div className="group-add-row">
          <input
            className="cell-input"
            value={newGroup}
            onChange={e => setNewGroup(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddGroup() }}
            placeholder="输入策略组名称，如 🚀 节点选择"
          />
          <button className="btn btn-sm" onClick={handleAddGroup} disabled={!newGroup.trim()}>
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="policy-stats">
        {stats.length === 0 && <div className="policy-stat-empty">暂无策略数据</div>}
        {stats.map(([policy, count]) => (
          <div key={policy} className="policy-stat-item">
            <span className="policy-stat-name">{policy}</span>
            <span className="policy-stat-count">{count} 条</span>
          </div>
        ))}
      </div>

      <div className="policy-replace-section">
        <div className="section-label">单项替换</div>
        <div className="policy-replace-row">
          <select className="cell-select" value={fromPolicy} onChange={e => setFromPolicy(e.target.value)}>
            <option value="">-- 原策略 --</option>
            {allPolicies.map(p => (<option key={p} value={p}>{p}</option>))}
          </select>
          <ArrowRight size={14} className="arrow-icon" />
          <select className="cell-select" value={toPolicy} onChange={e => setToPolicy(e.target.value)}>
            <option value="">-- 新策略 --</option>
            {allPolicies.map(p => (<option key={p} value={p}>{p}</option>))}
          </select>
        </div>
        <button
          className="btn btn-sm btn-primary btn-full"
          disabled={!fromPolicy || !toPolicy || fromPolicy === toPolicy}
          onClick={() => { onReplace(fromPolicy, toPolicy); setFromPolicy(''); setToPolicy('') }}
        >
          替换
        </button>
      </div>

      <div className="policy-replace-section">
        <div className="section-label">全部替换为</div>
        <div className="quick-buttons">
          {BUILTIN_POLICIES.map(p => (
            <button key={p} className="btn btn-sm btn-full" onClick={() => onBatchReplaceAll(p)}>{p}</button>
          ))}
        </div>
        {mainGroup && (
          <button className="btn btn-sm btn-full btn-main-group" onClick={() => onBatchReplaceAll(mainGroup)}>
            全部改为 {mainGroup}
          </button>
        )}
      </div>
    </div>
  )
}
