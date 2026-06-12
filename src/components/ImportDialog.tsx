import { useState } from 'react'
import { X, FileUp } from 'lucide-react'

interface Props {
  open: boolean
  onImport: (yamlText: string) => void
  onClose: () => void
  error: string | null
}

export function ImportDialog({ open, onImport, onClose, error }: Props) {
  const [text, setText] = useState('')

  if (!open) return null

  const handleImport = () => {
    if (text.trim()) {
      onImport(text.trim())
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <span>
            <FileUp size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            导入 YAML
          </span>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="dialog-body">
          <textarea
            className="yaml-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`粘贴 YAML 内容，例如：\n\nprepend:\n  - 'DOMAIN-SUFFIX,example.com,DIRECT'\nappend: []\ndelete: []`}
            rows={16}
          />
          {error && <div className="error-text">{error}</div>}
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleImport} disabled={!text.trim()}>
            解析导入
          </button>
        </div>
      </div>
    </div>
  )
}
