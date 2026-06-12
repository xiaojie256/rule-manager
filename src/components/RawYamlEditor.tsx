import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  yaml: string
  onReparse: (yamlText: string) => void
  error: string | null
}

export function RawYamlEditor({ yaml, onReparse, error }: Props) {
  const [text, setText] = useState(yaml)

  useEffect(() => {
    setText(yaml)
  }, [yaml])

  const handleReparse = () => {
    onReparse(text)
  }

  return (
    <div className="raw-editor">
      <div className="raw-editor-toolbar">
        <span className="raw-editor-label">YAML 原文编辑</span>
        <button className="btn btn-sm btn-primary" onClick={handleReparse}>
          <RefreshCw size={14} /> 重新解析
        </button>
      </div>
      {error && <div className="error-text">{error}</div>}
      <textarea
        className="raw-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        spellCheck={false}
      />
    </div>
  )
}
