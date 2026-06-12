import type { RuleTemplate } from '../types/rule'
import { saveHistory, loadHistory } from './storage'

export interface HistoryManager {
  undoStack: RuleTemplate[]
  redoStack: RuleTemplate[]
}

export function createHistoryManager(): HistoryManager {
  return {
    undoStack: loadHistory(),
    redoStack: [],
  }
}

export function pushHistory(
  mgr: HistoryManager,
  snapshot: RuleTemplate
): HistoryManager {
  const newStack = [...mgr.undoStack, snapshot].slice(-20)
  saveHistory(newStack)
  return { undoStack: newStack, redoStack: [] }
}

export function undo(mgr: HistoryManager): {
  template: RuleTemplate | null
  mgr: HistoryManager
} {
  if (mgr.undoStack.length === 0) return { template: null, mgr }
  const stack = [...mgr.undoStack]
  const template = stack.pop()!
  const newMgr = {
    undoStack: stack,
    redoStack: [...mgr.redoStack, template],
  }
  saveHistory(stack)
  return { template, mgr: newMgr }
}

export function redo(mgr: HistoryManager): {
  template: RuleTemplate | null
  mgr: HistoryManager
} {
  if (mgr.redoStack.length === 0) return { template: null, mgr }
  const stack = [...mgr.redoStack]
  const template = stack.pop()!
  const newMgr = {
    undoStack: [...mgr.undoStack, template],
    redoStack: stack,
  }
  saveHistory(newMgr.undoStack)
  return { template, mgr: newMgr }
}
