import { useState } from 'react'
import { X, FileDown, Copy, Check } from 'lucide-react'

interface Props {
  open: boolean
  yaml: string
  onClose: () => void
}

export function ExportDialog({ open, yaml, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rules.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <span>
            <FileDown size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            导出 YAML
          </span>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="dialog-body">
          <pre className="yaml-preview">{yaml}</pre>
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={handleDownload}>
            <FileDown size={14} /> 下载 .yaml
          </button>
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制到剪贴板'}
          </button>
        </div>
      </div>
    </div>
  )
}
