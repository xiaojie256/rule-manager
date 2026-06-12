import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  text: string
  type?: 'success' | 'error' | 'info'
}

interface Props {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ messages, onRemove }: Props) {
  return (
    <div className="toast-container">
      {messages.map(m => (
        <ToastItem key={m.id} message={m} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({
  message,
  onRemove,
}: {
  message: ToastMessage
  onRemove: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(message.id), 300)
    }, 2500)
    return () => clearTimeout(timer)
  }, [message.id, onRemove])

  return (
    <div className={`toast toast-${message.type || 'info'} ${visible ? 'toast-visible' : ''}`}>
      {message.text}
    </div>
  )
}
