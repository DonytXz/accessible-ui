import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: ToastItem[]
  toast: (options: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const Toast: React.FC<{
  item: ToastItem
  onDismiss: (id: string) => void
}> = ({ item, onDismiss }) => {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = React.useRef(item.duration || 5000)
  const startTimeRef = React.useRef<number>(Date.now())

  const isAssertive = item.variant === 'error'

  const startTimer = useCallback(() => {
    if (item.duration === 0) return // sticky toast
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      onDismiss(item.id)
    }, remainingRef.current)
  }, [item.duration, item.id, onDismiss])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      const elapsed = Date.now() - startTimeRef.current
      remainingRef.current = Math.max(0, remainingRef.current - elapsed)
    }
  }, [])

  React.useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  const handleMouseEnter = () => {
    pauseTimer()
  }

  const handleMouseLeave = () => {
    startTimer()
  }

  const handleFocus = () => {
    pauseTimer()
  }

  const handleBlur = () => {
    startTimer()
  }

  const iconMap: Record<ToastVariant, React.ReactNode> = {
    info: <Info className="w-5 h-5 text-[var(--status-info)] shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--status-warning)] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--status-error)] shrink-0" />,
  }

  return (
    <div
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        'w-full max-w-sm rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 shadow-xl flex items-start gap-3 transition-all',
        'animate-in fade-in slide-in-from-bottom-5 duration-200'
      )}
    >
      {iconMap[item.variant || 'info']}

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{item.description}</p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick()
              onDismiss(item.id)
            }}
            className="mt-2 text-xs font-semibold text-[var(--accent-primary)] hover:underline focus-visible:outline-none"
          >
            {item.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((options: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const newToast: ToastItem = { ...options, id }
    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast Region */}
      <section
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <Toast item={item} onDismiss={dismiss} />
          </div>
        ))}
      </section>
    </ToastContext.Provider>
  )
}
