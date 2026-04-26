import { Icon } from '../../components/ui/Icon'

export interface ToastItem {
  id: string
  message: string
  variant: 'success' | 'error'
  exiting: boolean
}

export function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const isSuccess = toast.variant === 'success'
  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: isSuccess ? '#15803D' : '#B91C1C',
        color: '#fff',
        borderRadius: 6,
        fontSize: 12.5, fontWeight: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,0.20)',
        minWidth: 280, maxWidth: 380,
        cursor: 'pointer',
        userSelect: 'none',
        animation: toast.exiting ? 'toastOut 0.35s ease forwards' : 'toastIn 0.25s ease',
        fontFamily: 'inherit',
      }}
    >
      <Icon name={isSuccess ? 'check' : 'alert'} size={14} style={{ flexShrink: 0 }} />
      <span>{toast.message}</span>
    </div>
  )
}
