import { useState } from 'react'
import { Table, Code, Plus } from 'lucide-react'
import type { RuleItem, RuleSection } from '../types/rule'
import { SECTIONS } from '../types/rule'
import { RuleTable } from './RuleTable'
import { RawYamlEditor } from './RawYamlEditor'

interface Props {
  rules: RuleItem[]
  yaml: string
  parseError: string | null
  focusRuleId: string | null
  onUpdate: (id: string, changes: Partial<RuleItem>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onBatchDelete: (ids: string[]) => void
  onBatchUpdate: (ids: string[], changes: Partial<RuleItem>) => void
  onReparse: (yamlText: string) => void
  onAddRule: (section: RuleSection) => void
}

export function RuleEditor({
  rules,
  yaml,
  parseError,
  focusRuleId,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onBatchDelete,
  onBatchUpdate,
  onReparse,
  onAddRule,
}: Props) {
  const [mode, setMode] = useState<'table' | 'raw'>('table')
  const [activeSection, setActiveSection] = useState<RuleSection | 'all'>('all')

  const sectionTabs: Array<{ key: RuleSection | 'all'; label: string }> = [
    { key: 'all', label: '全部' },
    ...SECTIONS.map(s => ({ key: s as RuleSection, label: s })),
  ]

  const handleAddRule = () => {
    const targetSection: RuleSection = activeSection === 'all' ? 'prepend' : activeSection
    if (mode === 'raw') setMode('table')
    onAddRule(targetSection)
  }

  return (
    <div className="rule-editor">
      <div className="editor-header">
        <div className="section-tabs">
          {sectionTabs.map(tab => {
            const count = tab.key === 'all'
              ? rules.length
              : rules.filter(r => r.section === tab.key).length
            return (
              <button
                key={tab.key}
                className={`tab ${activeSection === tab.key ? 'tab-active' : ''}`}
                onClick={() => setActiveSection(tab.key)}
              >
                {tab.label}
                <span className="tab-count">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="mode-switch">
          <button className="btn btn-sm btn-primary" onClick={handleAddRule}>
            <Plus size={14} /> 新建规则
          </button>
          <button className={`btn btn-sm ${mode === 'table' ? 'btn-active' : ''}`} onClick={() => setMode('table')}>
            <Table size={14} /> 表格
          </button>
          <button className={`btn btn-sm ${mode === 'raw' ? 'btn-active' : ''}`} onClick={() => setMode('raw')}>
            <Code size={14} /> 原文
          </button>
        </div>
      </div>
      <div className="editor-body">
        {mode === 'table' ? (
          <RuleTable
            rules={activeSection === 'all' ? rules : rules.filter(r => r.section === activeSection)}
            focusRuleId={focusRuleId}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onBatchDelete={onBatchDelete}
            onBatchUpdate={onBatchUpdate}
            onAddRule={handleAddRule}
          />
        ) : (
          <RawYamlEditor yaml={yaml} onReparse={onReparse} error={parseError} />
        )}
      </div>
    </div>
  )
}
