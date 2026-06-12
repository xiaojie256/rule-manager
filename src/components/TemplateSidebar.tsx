import { useState } from 'react'
import { Plus, Copy, Trash2, Edit3, Check, X, FileText, Download, Upload } from 'lucide-react'
import type { RuleTemplate } from '../types/rule'

interface Props {
  templates: RuleTemplate[]
  currentId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSaveCurrent: () => void
  onImportTemplate: (json: string) => void
  onExportTemplate: (id: string) => void
}

export function TemplateSidebar({
  templates, currentId, onSelect, onCreate, onRename, onDuplicate, onDelete,
  onSaveCurrent, onImportTemplate, onExportTemplate,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const startRename = (t: RuleTemplate) => { setEditingId(t.id); setEditName(t.name) }
  const confirmRename = () => { if (editingId && editName.trim()) onRename(editingId, editName.trim()); setEditingId(null) }

  const handleImport = () => {
    try { JSON.parse(importText); onImportTemplate(importText); setShowImport(false); setImportText(''); setImportError(null) }
    catch { setImportError('JSON 格式不正确') }
  }

  return (
    <div className="template-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title"><FileText size={14} /> 模板</span>
        <div className="sidebar-actions">
          <button className="btn-icon" onClick={onCreate} title="新建模板"><Plus size={14} /></button>
          <button className="btn-icon" onClick={onSaveCurrent} title="保存当前为模板"><Check size={14} /></button>
          <button className="btn-icon" onClick={() => setShowImport(!showImport)} title="导入模板"><Upload size={14} /></button>
        </div>
      </div>

      {showImport && (
        <div className="template-import">
          <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="粘贴模板 JSON..." rows={4} className="template-import-input" />
          {importError && <div className="error-text">{importError}</div>}
          <div className="template-import-actions">
            <button className="btn btn-sm" onClick={() => setShowImport(false)}>取消</button>
            <button className="btn btn-sm btn-primary" onClick={handleImport}>导入</button>
          </div>
        </div>
      )}

      <div className="template-list">
        {templates.map(t => (
          <div key={t.id} className={`template-item ${currentId === t.id ? 'template-active' : ''}`} onClick={() => onSelect(t.id)}>
            {editingId === t.id ? (
              <div className="template-edit-row">
                <input className="template-edit-input" value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingId(null) }}
                  autoFocus onClick={e => e.stopPropagation()} />
                <button className="btn-icon" onClick={e => { e.stopPropagation(); confirmRename() }}><Check size={12} /></button>
                <button className="btn-icon" onClick={e => { e.stopPropagation(); setEditingId(null) }}><X size={12} /></button>
              </div>
            ) : (
              <>
                <span className="template-name">{t.name}</span>
                <span className="template-count">{t.sections.prepend.length + t.sections.append.length + t.sections.delete.length}</span>
                <div className="template-actions">
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); startRename(t) }} title="重命名"><Edit3 size={12} /></button>
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); onDuplicate(t.id) }} title="复制"><Copy size={12} /></button>
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); onExportTemplate(t.id) }} title="导出 JSON"><Download size={12} /></button>
                  <button className="btn-icon btn-icon-danger" onClick={e => { e.stopPropagation(); onDelete(t.id) }} title="删除"><Trash2 size={12} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {templates.length === 0 && <div className="template-empty">暂无模板，点击 + 新建模板</div>}
      </div>
    </div>
  )
}
