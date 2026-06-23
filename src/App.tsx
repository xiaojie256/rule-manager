import { useState, useEffect, useCallback, useRef } from 'react'
import { nanoid } from 'nanoid'
import type { RuleItem, RuleTemplate, PolicyAlias, ValidationIssue, RuleSection } from './types/rule'
import { defaultTemplate } from './data/defaultTemplates'
import { defaultPolicies } from './data/defaultPolicies'
import { parseYamlToTemplate } from './utils/parser'
import { exportTemplateToYaml } from './utils/exporter'
import { validateTemplate, getDuplicateCount } from './utils/validator'
import { saveTemplates, loadTemplates, saveCurrentTemplate, loadCurrentTemplate, savePolicies, loadPolicies, saveTheme, loadTheme, saveProxyGroups, loadProxyGroups } from './utils/storage'
import { createHistoryManager, pushHistory, undo, redo, HistoryManager } from './utils/history'
import { TopBar } from './components/TopBar'
import { TemplateSidebar } from './components/TemplateSidebar'
import { RuleEditor } from './components/RuleEditor'
import { RightPanel } from './components/RightPanel'
import { ImportDialog } from './components/ImportDialog'
import { ExportDialog } from './components/ExportDialog'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ToastContainer, type ToastMessage } from './components/Toast'

function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = nanoid(6)
    setMessages(prev => [...prev, { id, text, type }])
  }, [])
  const removeToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])
  return { messages, addToast, removeToast }
}

function upsertTemplateList(list: RuleTemplate[], template: RuleTemplate): RuleTemplate[] {
  const index = list.findIndex(item => item.id === template.id)

  if (index === -1) {
    return [...list, template]
  }

  if (list[index] === template) {
    return list
  }

  const next = [...list]
  next[index] = template
  return next
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme)
  const [templates, setTemplates] = useState<RuleTemplate[]>(() => {
    const saved = loadTemplates()
    return saved.length > 0 ? saved : [defaultTemplate]
  })
  const [currentTemplate, setCurrentTemplate] = useState<RuleTemplate>(() => loadCurrentTemplate() || defaultTemplate)
  const [policies] = useState<PolicyAlias[]>(() => loadPolicies() || defaultPolicies)
  const [proxyGroups, setProxyGroups] = useState<string[]>(() => loadProxyGroups())
  const historyRef = useRef<HistoryManager>(createHistoryManager())
  const [historyVersion, setHistoryVersion] = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [includeDisabled, setIncludeDisabled] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} })
  const { messages, addToast, removeToast } = useToast()
  const [focusRuleId, setFocusRuleId] = useState<string | null>(null)

  const allRules = [...currentTemplate.sections.prepend, ...currentTemplate.sections.append, ...currentTemplate.sections.delete]
  const validationIssues: ValidationIssue[] = validateTemplate(currentTemplate)
  const enabledCount = allRules.filter(r => r.enabled).length
  const disabledCount = allRules.filter(r => !r.enabled).length
  const duplicateCount = getDuplicateCount(currentTemplate)

  useEffect(() => {
    saveCurrentTemplate(currentTemplate)

    setTemplates(prev => upsertTemplateList(prev, currentTemplate))
  }, [currentTemplate])

  useEffect(() => {
    saveTemplates(templates)
  }, [templates])
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); saveTheme(theme) }, [theme])
  useEffect(() => { saveProxyGroups(proxyGroups) }, [proxyGroups])

  const snapshot = useCallback((msg?: string) => {
    historyRef.current = pushHistory(historyRef.current, { ...currentTemplate, id: nanoid(10), updatedAt: Date.now() })
    setHistoryVersion(v => v + 1)
    if (msg) addToast(msg, 'success')
  }, [currentTemplate, addToast])

  const updateTemplate = useCallback((updater: (t: RuleTemplate) => RuleTemplate) => {
    setCurrentTemplate(prev => updater(prev))
  }, [])

  const handleRuleUpdate = useCallback((id: string, changes: Partial<RuleItem>) => {
    updateTemplate(t => {
      const update = (rules: RuleItem[]) => rules.map(r => (r.id === id ? { ...r, ...changes } : r))
      return { ...t, updatedAt: Date.now(), sections: { prepend: update(t.sections.prepend), append: update(t.sections.append), delete: update(t.sections.delete) } }
    })
  }, [updateTemplate])

  const handleRuleDelete = useCallback((id: string) => {
    snapshot()
    updateTemplate(t => {
      const remove = (rules: RuleItem[]) => rules.filter(r => r.id !== id)
      return { ...t, updatedAt: Date.now(), sections: { prepend: remove(t.sections.prepend), append: remove(t.sections.append), delete: remove(t.sections.delete) } }
    })
    addToast('已删除规则', 'info')
  }, [snapshot, updateTemplate, addToast])

  const handleRuleDuplicate = useCallback((id: string) => {
    updateTemplate(t => {
      const dup = (rules: RuleItem[]) => {
        const idx = rules.findIndex(r => r.id === id)
        if (idx === -1) return rules
        const clone = { ...rules[idx], id: nanoid(10) }
        const next = [...rules]; next.splice(idx + 1, 0, clone); return next
      }
      return { ...t, updatedAt: Date.now(), sections: { prepend: dup(t.sections.prepend), append: dup(t.sections.append), delete: dup(t.sections.delete) } }
    })
  }, [updateTemplate])

  const moveRule = useCallback((id: string, dir: -1 | 1) => {
    updateTemplate(t => {
      const moveInSection = (rules: RuleItem[]) => {
        const idx = rules.findIndex(r => r.id === id)
        if (idx === -1) return rules
        const target = idx + dir
        if (target < 0 || target >= rules.length) return rules
        const next = [...rules]; [next[idx], next[target]] = [next[target], next[idx]]; return next
      }
      return { ...t, updatedAt: Date.now(), sections: { prepend: moveInSection(t.sections.prepend), append: moveInSection(t.sections.append), delete: moveInSection(t.sections.delete) } }
    })
  }, [updateTemplate])

  const handleMoveUp = useCallback((id: string) => moveRule(id, -1), [moveRule])
  const handleMoveDown = useCallback((id: string) => moveRule(id, 1), [moveRule])

  const handleAddRule = useCallback((section: RuleSection) => {
    const newId = nanoid(10)
    const newRule: RuleItem = { id: newId, section, enabled: true, raw: '', type: 'DOMAIN-SUFFIX', value: '', policy: 'DIRECT', extra: [], comment: '' }
    updateTemplate(t => ({ ...t, updatedAt: Date.now(), sections: { ...t.sections, [section]: [...t.sections[section], newRule] } }))
    setFocusRuleId(newId)
    setTimeout(() => setFocusRuleId(null), 2000)
    addToast(`已在 ${section} 分区新增规则`, 'success')
  }, [updateTemplate, addToast])

  const handleBatchDelete = useCallback((ids: string[]) => {
    snapshot()
    const idSet = new Set(ids)
    updateTemplate(t => {
      const remove = (rules: RuleItem[]) => rules.filter(r => !idSet.has(r.id))
      return { ...t, updatedAt: Date.now(), sections: { prepend: remove(t.sections.prepend), append: remove(t.sections.append), delete: remove(t.sections.delete) } }
    })
    addToast(`已删除 ${ids.length} 条规则`, 'info')
  }, [snapshot, updateTemplate, addToast])

  const handleBatchUpdate = useCallback((ids: string[], changes: Partial<RuleItem>) => {
    snapshot()
    const idSet = new Set(ids)
    updateTemplate(t => {
      const update = (rules: RuleItem[]) => rules.map(r => (idSet.has(r.id) ? { ...r, ...changes } : r))
      return { ...t, updatedAt: Date.now(), sections: { prepend: update(t.sections.prepend), append: update(t.sections.append), delete: update(t.sections.delete) } }
    })
    addToast(`已更新 ${ids.length} 条规则`, 'success')
  }, [snapshot, updateTemplate, addToast])

  const handleImport = useCallback((yamlText: string) => {
    try {
      const template = parseYamlToTemplate(yamlText)
      snapshot()
      setCurrentTemplate(prev => ({ ...template, id: prev.id, name: prev.name, createdAt: prev.createdAt }))
      if (template.proxyGroups && template.proxyGroups.length > 0) {
        setProxyGroups(prev => Array.from(new Set([...prev, ...template.proxyGroups!])))
      }
      setImportOpen(false); setImportError(null)
      addToast(`成功导入 ${template.sections.prepend.length + template.sections.append.length + template.sections.delete.length} 条规则`, 'success')
    } catch (e) { setImportError(e instanceof Error ? e.message : '解析失败') }
  }, [snapshot, addToast])

  const handleReparse = useCallback((yamlText: string) => {
    try {
      const template = parseYamlToTemplate(yamlText)
      snapshot()
      setCurrentTemplate(prev => ({ ...template, id: prev.id, name: prev.name, createdAt: prev.createdAt }))
      if (template.proxyGroups && template.proxyGroups.length > 0) {
        setProxyGroups(prev => Array.from(new Set([...prev, ...template.proxyGroups!])))
      }
      addToast('重新解析成功', 'success')
    } catch (e) { addToast(e instanceof Error ? e.message : '解析失败', 'error') }
  }, [snapshot, addToast])

  const getYaml = useCallback((incDisabled?: boolean) => exportTemplateToYaml(currentTemplate, { includeDisabled: incDisabled ?? includeDisabled }), [currentTemplate, includeDisabled])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(getYaml())
    addToast('已复制到剪贴板', 'success')
  }, [getYaml, addToast])

  const handlePolicyReplace = useCallback((from: string, to: string) => {
    snapshot(); let count = 0
    updateTemplate(t => {
      const replace = (rules: RuleItem[]) => rules.map(r => { if (r.policy === from) { count++; return { ...r, policy: to } } return r })
      return { ...t, updatedAt: Date.now(), sections: { prepend: replace(t.sections.prepend), append: replace(t.sections.append), delete: replace(t.sections.delete) } }
    })
    setTimeout(() => addToast(`已替换 ${count} 条规则: ${from} → ${to}`, 'success'), 0)
  }, [snapshot, updateTemplate, addToast])

  const handleBatchReplaceAll = useCallback((to: string) => {
    setConfirmDialog({
      open: true, title: '批量替换', message: `确认将所有规则的策略替换为 "${to}"？`,
      onConfirm: () => {
        snapshot()
        updateTemplate(t => {
          const replace = (rules: RuleItem[]) => rules.map(r => ({ ...r, policy: to }))
          return { ...t, updatedAt: Date.now(), sections: { prepend: replace(t.sections.prepend), append: replace(t.sections.append), delete: replace(t.sections.delete) } }
        })
        addToast(`已将所有策略替换为 ${to}`, 'success')
      },
    })
  }, [snapshot, updateTemplate, addToast])

  const handleAddProxyGroup = useCallback((name: string) => {
    setProxyGroups(prev => prev.includes(name) ? prev : [...prev, name])
    addToast(`已添加策略组: ${name}`, "success")
  }, [addToast])

  const handleRemoveProxyGroup = useCallback((name: string) => {
    setProxyGroups(prev => prev.filter(g => g !== name))
    addToast(`已移除策略组: ${name}`, "info")
  }, [addToast])

  const handleSelectTemplate = useCallback((id: string) => { const t = templates.find(t => t.id === id); if (t) setCurrentTemplate(t) }, [templates])

  const handleCreateTemplate = useCallback(() => {
    const newT: RuleTemplate = { id: nanoid(10), name: '新模板', sections: { prepend: [], append: [], delete: [] }, createdAt: Date.now(), updatedAt: Date.now() }
    setTemplates(prev => [...prev, newT]); setCurrentTemplate(newT); addToast('已创建新模板', 'success')
  }, [addToast])

  const handleRenameTemplate = useCallback((id: string, name: string) => {
    setTemplates(prev => prev.map(t => (t.id === id ? { ...t, name } : t)))
    if (currentTemplate.id === id) setCurrentTemplate(prev => ({ ...prev, name }))
  }, [currentTemplate.id])

  const handleDuplicateTemplate = useCallback((id: string) => {
    const t = templates.find(t => t.id === id); if (!t) return
    const clone: RuleTemplate = { ...t, id: nanoid(10), name: t.name + ' (副本)', createdAt: Date.now(), updatedAt: Date.now(), sections: { prepend: t.sections.prepend.map(r => ({ ...r, id: nanoid(10) })), append: t.sections.append.map(r => ({ ...r, id: nanoid(10) })), delete: t.sections.delete.map(r => ({ ...r, id: nanoid(10) })) } }
    setTemplates(prev => [...prev, clone]); addToast('模板已复制', 'success')
  }, [templates, addToast])

  const handleDeleteTemplate = useCallback((id: string) => {
    if (templates.length <= 1) { addToast('至少保留一个模板', 'error'); return }
    setTemplates(prev => prev.filter(t => t.id !== id))
    if (currentTemplate.id === id) { const remaining = templates.filter(t => t.id !== id); setCurrentTemplate(remaining[0]) }
    addToast('模板已删除', 'info')
  }, [templates, currentTemplate.id, addToast])

  const handleSaveCurrentAsTemplate = useCallback(() => {
    const newT: RuleTemplate = { ...currentTemplate, id: nanoid(10), name: currentTemplate.name + ' (保存)', createdAt: Date.now(), updatedAt: Date.now() }
    setTemplates(prev => [...prev, newT]); addToast('已保存为新模板', 'success')
  }, [currentTemplate, addToast])

  const handleImportTemplate = useCallback((json: string) => {
    try {
      const data = JSON.parse(json)
      const t: RuleTemplate = { id: nanoid(10), name: data.name || '导入的模板', sections: data.sections || { prepend: [], append: [], delete: [] }, createdAt: Date.now(), updatedAt: Date.now() }
      setTemplates(prev => [...prev, t]); setCurrentTemplate(t); addToast('模板导入成功', 'success')
    } catch { addToast('模板 JSON 格式错误', 'error') }
  }, [addToast])

  const handleExportTemplate = useCallback((id: string) => {
    const t = templates.find(t => t.id === id); if (!t) return
    const blob = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${t.name}.json`; a.click(); URL.revokeObjectURL(url)
    addToast('模板已导出', 'success')
  }, [templates, addToast])

  const handleNewTemplate = useCallback(() => { handleCreateTemplate() }, [handleCreateTemplate])
  const handleSave = useCallback(() => {
    const savedTemplate: RuleTemplate = {
      ...currentTemplate,
      updatedAt: Date.now(),
    }

    const nextTemplates = upsertTemplateList(templates, savedTemplate)

    setCurrentTemplate(savedTemplate)
    setTemplates(nextTemplates)

    saveCurrentTemplate(savedTemplate)
    saveTemplates(nextTemplates)

    addToast('已保存到当前模板，刷新后仍会保留', 'success')
  }, [currentTemplate, templates, addToast])

  const handleClear = useCallback(() => {
    setConfirmDialog({
      open: true, title: '清空所有规则', message: '确认清空当前模板的所有规则？此操作可通过撤销恢复。',
      onConfirm: () => { snapshot(); updateTemplate(t => ({ ...t, updatedAt: Date.now(), sections: { prepend: [], append: [], delete: [] } })); addToast('已清空所有规则', 'info') },
    })
  }, [snapshot, updateTemplate, addToast])

  const handleUndo = useCallback(() => {
    const result = undo(historyRef.current)
    if (result.template) { historyRef.current = result.mgr; setCurrentTemplate(prev => ({ ...result.template!, name: prev.name })); setHistoryVersion(v => v + 1); addToast('已撤销', 'info') }
  }, [addToast])

  const handleRedo = useCallback(() => {
    const result = redo(historyRef.current)
    if (result.template) { historyRef.current = result.mgr; setCurrentTemplate(prev => ({ ...result.template!, name: prev.name })); setHistoryVersion(v => v + 1); addToast('已重做', 'info') }
  }, [addToast])

  const handleToggleTheme = useCallback(() => { setTheme(prev => (prev === 'dark' ? 'light' : 'dark')) }, [])

  const currentYaml = exportTemplateToYaml(currentTemplate, { includeDisabled: true })
  const canUndo = historyRef.current.undoStack.length > 0
  const canRedo = historyRef.current.redoStack.length > 0

  return (
    <div className="app">
      <TopBar
        templateName={currentTemplate.name} totalRules={allRules.length} enabledRules={enabledCount} disabledRules={disabledCount}
        canUndo={canUndo} canRedo={canRedo} theme={theme}
        onImport={() => { setImportOpen(true); setImportError(null) }} onExport={() => setExportOpen(true)}
        onCopy={handleCopy} onSave={handleSave} onClear={handleClear} onNewTemplate={handleNewTemplate}
        onUndo={handleUndo} onRedo={handleRedo} onToggleTheme={handleToggleTheme}
      />
      <div className="main-layout">
        <TemplateSidebar
          templates={templates} currentId={currentTemplate.id} onSelect={handleSelectTemplate} onCreate={handleCreateTemplate}
          onRename={handleRenameTemplate} onDuplicate={handleDuplicateTemplate} onDelete={handleDeleteTemplate}
          onSaveCurrent={handleSaveCurrentAsTemplate} onImportTemplate={handleImportTemplate} onExportTemplate={handleExportTemplate}
        />
        <div className="center-panel">
          <RuleEditor
            rules={allRules} yaml={currentYaml} parseError={null} focusRuleId={focusRuleId}
            onUpdate={handleRuleUpdate} onDelete={handleRuleDelete} onDuplicate={handleRuleDuplicate}
            onMoveUp={handleMoveUp} onMoveDown={handleMoveDown}
            onBatchDelete={handleBatchDelete} onBatchUpdate={handleBatchUpdate}
            onReparse={handleReparse} onAddRule={handleAddRule}
          />
          {duplicateCount > 0 && (<div className="duplicate-warning">发现 {duplicateCount} 组重复规则</div>)}
        </div>
        <RightPanel rules={allRules} policies={policies} issues={validationIssues} onReplace={handlePolicyReplace} onBatchReplaceAll={handleBatchReplaceAll} proxyGroups={proxyGroups} onAddProxyGroup={handleAddProxyGroup} onRemoveProxyGroup={handleRemoveProxyGroup} />
      </div>
      <ImportDialog open={importOpen} onImport={handleImport} onClose={() => setImportOpen(false)} error={importError} />
      <ExportDialog open={exportOpen} yaml={getYaml()} onClose={() => setExportOpen(false)} />
      <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message}
        onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, open: false })) }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
      <ToastContainer messages={messages} onRemove={removeToast} />
    </div>
  )
}
