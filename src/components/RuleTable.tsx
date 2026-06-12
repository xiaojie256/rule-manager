import { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import type { RuleItem, RuleSection } from '../types/rule'
import { RULE_TYPES, SECTIONS } from '../types/rule'
import { RuleRow } from './RuleRow'

interface Props {
  rules: RuleItem[]
  focusRuleId: string | null
  onUpdate: (id: string, changes: Partial<RuleItem>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onBatchDelete: (ids: string[]) => void
  onBatchUpdate: (ids: string[], changes: Partial<RuleItem>) => void
  onAddRule: () => void
}

export function RuleTable({
  rules,
  focusRuleId,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onBatchDelete,
  onBatchUpdate,
  onAddRule,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [searchText, setSearchText] = useState('')
  const [filterSection, setFilterSection] = useState<RuleSection | 'all'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredRules = rules.filter(rule => {
    if (filterSection !== 'all' && rule.section !== filterSection) return false
    if (filterType !== 'all' && rule.type !== filterType) return false
    if (searchText) {
      const q = searchText.toLowerCase()
      return (
        rule.value.toLowerCase().includes(q) ||
        rule.type.toLowerCase().includes(q) ||
        rule.policy.toLowerCase().includes(q) ||
        (rule.comment || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const toggleSelect = (id: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === filteredRules.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredRules.map(r => r.id)))
    }
  }

  const selectedIds = Array.from(selected)

  return (
    <div className="rule-table-wrapper">
      <div className="rule-table-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="搜索域名、类型、策略、备注..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <button
            className={`btn btn-sm ${showFilters ? 'btn-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} /> 筛选
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={onAddRule}
            title="在当前分区新增一条规则"
          >
            <Plus size={14} /> 新建规则
          </button>
        </div>
        <div className="toolbar-right">
          {selectedIds.length > 0 && (
            <div className="batch-actions">
              <span className="batch-count">已选 {selectedIds.length} 条</span>
              <button className="btn btn-sm" onClick={() => onBatchUpdate(selectedIds, { enabled: true })}>启用</button>
              <button className="btn btn-sm" onClick={() => onBatchUpdate(selectedIds, { enabled: false })}>禁用</button>
              <button className="btn btn-sm" onClick={() => onBatchUpdate(selectedIds, { section: 'prepend' })}>→ prepend</button>
              <button className="btn btn-sm" onClick={() => onBatchUpdate(selectedIds, { section: 'append' })}>→ append</button>
              <button className="btn btn-sm btn-danger" onClick={() => { onBatchDelete(selectedIds); setSelected(new Set()) }}>批量删除</button>
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-bar">
          <label>
            分区:
            <select value={filterSection} onChange={e => setFilterSection(e.target.value as RuleSection | 'all')}>
              <option value="all">全部</option>
              {SECTIONS.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>
          <label>
            类型:
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">全部</option>
              {RULE_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </label>
        </div>
      )}

      <div className="rule-table-scroll">
        <table className="rule-table">
          <thead>
            <tr>
              <th className="col-check"><input type="checkbox" checked={filteredRules.length > 0 && selected.size === filteredRules.length} onChange={toggleAll} /></th>
              <th className="col-enable">启用</th>
              <th className="col-section">分区</th>
              <th className="col-type">匹配类型</th>
              <th className="col-value">参数</th>
              <th className="col-policy">策略</th>
              <th className="col-extra">额外参数</th>
              <th className="col-comment">备注</th>
              <th className="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map(rule => (
              <RuleRow
                key={rule.id}
                rule={rule}
                selected={selected.has(rule.id)}
                autoFocus={rule.id === focusRuleId}
                onSelect={toggleSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            ))}
            {filteredRules.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-table">
                  {rules.length === 0 ? '暂无规则，点击"导入"或从模板载入' : '没有匹配的规则'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
