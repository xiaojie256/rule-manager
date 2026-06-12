import { FileUp, FileDown, Copy, Save, Trash2, Undo2, Redo2, Sun, Moon, Plus } from 'lucide-react'

interface Props {
  templateName: string
  totalRules: number
  enabledRules: number
  disabledRules: number
  canUndo: boolean
  canRedo: boolean
  theme: 'dark' | 'light'
  onImport: () => void
  onExport: () => void
  onCopy: () => void
  onSave: () => void
  onClear: () => void
  onNewTemplate: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleTheme: () => void
}

export function TopBar({
  templateName, totalRules, enabledRules, disabledRules, canUndo, canRedo, theme,
  onImport, onExport, onCopy, onSave, onClear, onNewTemplate, onUndo, onRedo, onToggleTheme,
}: Props) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">规则管理器</span>
        <span className="topbar-template-name">{templateName}</span>
      </div>
      <div className="topbar-center">
        <span className="topbar-stat">总计: {totalRules}</span>
        <span className="topbar-stat stat-enabled">启用: {enabledRules}</span>
        <span className="topbar-stat stat-disabled">禁用: {disabledRules}</span>
      </div>
      <div className="topbar-right">
        <button className="btn btn-sm" onClick={onNewTemplate} title="新建模板"><Plus size={14} /> 新建模板</button>
        <button className="btn btn-sm" onClick={onImport} title="导入 YAML"><FileUp size={14} /> 导入</button>
        <button className="btn btn-sm" onClick={onExport} title="导出 YAML"><FileDown size={14} /> 导出</button>
        <button className="btn btn-sm" onClick={onCopy} title="复制结果"><Copy size={14} /> 复制</button>
        <button className="btn btn-sm" onClick={onSave} title="保存草稿"><Save size={14} /> 保存</button>
        <button className="btn btn-sm btn-danger" onClick={onClear} title="清空"><Trash2 size={14} /> 清空</button>
        <div className="topbar-divider" />
        <button className="btn btn-sm btn-icon-only" onClick={onUndo} disabled={!canUndo} title="撤销"><Undo2 size={14} /></button>
        <button className="btn btn-sm btn-icon-only" onClick={onRedo} disabled={!canRedo} title="重做"><Redo2 size={14} /></button>
        <button className="btn btn-sm btn-icon-only" onClick={onToggleTheme} title={theme === 'dark' ? '切换到浅色' : '切换到深色'}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </div>
  )
}
