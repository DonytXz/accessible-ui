import React, { useId, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/core/focus/useFocusTrap'
import { cn } from '@/utils/cn'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  position?: 'left' | 'right'
  className?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  className,
}) => {
  const titleId = useId()
  const descriptionId = useId()
  const drawerRef = useRef<HTMLDivElement | null>(null)

  useFocusTrap(drawerRef, {
    enabled: isOpen,
    onEscape: onClose,
  })

  // Prevent background scrolling
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  const positionClasses = position === 'right' ? 'right-0 border-l' : 'left-0 border-r'

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      data-testid="drawer-backdrop"
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'fixed top-0 bottom-0 w-full max-w-md bg-[var(--bg-surface)] border-[var(--border-strong)] p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-out outline-none',
          positionClasses,
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-[var(--text-secondary)] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto text-[var(--text-primary)]">{children}</div>
      </div>
    </div>,
    document.body
  )
}
