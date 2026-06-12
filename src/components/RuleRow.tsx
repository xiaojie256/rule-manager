import { useState, useEffect, useRef } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
} from 'lucide-react'
import type { RuleItem, RuleSection } from '../types/rule'
import { RULE_TYPES, SECTIONS } from '../types/rule'

interface Props {
  rule: RuleItem
  selected: boolean
  autoFocus?: boolean
  onSelect: (id: string, selected: boolean) => void
  onUpdate: (id: string, changes: Partial<RuleItem>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}

export function RuleRow({
  rule,
  selected,
  autoFocus,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [editingPolicy, setEditingPolicy] = useState(false)
  const valueRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && valueRef.current) {
      valueRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      valueRef.current.focus()
    }
  }, [autoFocus])

  const hasError = !!rule.error
  const className = `rule-row ${!rule.enabled ? 'rule-disabled' : ''} ${hasError ? 'rule-error' : ''}`

  return (
    <tr className={className}>
      <td className="cell-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(rule.id, e.target.checked)}
        />
      </td>
      <td className="cell-center">
        <input
          type="checkbox"
          checked={rule.enabled}
          onChange={e => onUpdate(rule.id, { enabled: e.target.checked })}
        />
      </td>
      <td>
        <select
          className="cell-select"
          value={rule.section}
          onChange={e => onUpdate(rule.id, { section: e.target.value as RuleSection })}
        >
          {SECTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
      <td>
        <select
          className="cell-select"
          value={rule.type}
          onChange={e => onUpdate(rule.id, { type: e.target.value })}
        >
          <option value="">-- 选择 --</option>
          {RULE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
          {rule.type && !RULE_TYPES.includes(rule.type as typeof RULE_TYPES[number]) && (
            <option value={rule.type}>{rule.type}</option>
          )}
        </select>
      </td>
      <td>
        <input
          ref={valueRef}
          className="cell-input"
          value={rule.value}
          onChange={e => onUpdate(rule.id, { value: e.target.value })}
          placeholder="参数"
        />
      </td>
      <td>
        {editingPolicy ? (
          <input
            className="cell-input"
            value={rule.policy}
            onChange={e => onUpdate(rule.id, { policy: e.target.value })}
            onBlur={() => setEditingPolicy(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') setEditingPolicy(false)
            }}
            autoFocus
          />
        ) : (
          <span
            className="policy-badge"
            onClick={() => setEditingPolicy(true)}
            title="点击编辑策略"
          >
            {rule.policy || '(空)'}
          </span>
        )}
      </td>
      <td>
        <input
          className="cell-input cell-input-small"
          value={rule.extra.join(', ')}
          onChange={e =>
            onUpdate(rule.id, {
              extra: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
            })
          }
          placeholder="额外参数"
        />
      </td>
      <td>
        <input
          className="cell-input cell-input-small"
          value={rule.comment || ''}
          onChange={e => onUpdate(rule.id, { comment: e.target.value })}
          placeholder="备注"
        />
      </td>
      <td className="cell-actions">
        <button className="btn-icon" onClick={() => onMoveUp(rule.id)} title="上移">
          <ChevronUp size={14} />
        </button>
        <button className="btn-icon" onClick={() => onMoveDown(rule.id)} title="下移">
          <ChevronDown size={14} />
        </button>
        <button className="btn-icon" onClick={() => onDuplicate(rule.id)} title="复制">
          <Copy size={14} />
        </button>
        <button className="btn-icon btn-icon-danger" onClick={() => onDelete(rule.id)} title="删除">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  )
}
