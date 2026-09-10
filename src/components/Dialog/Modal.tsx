import React, { useId, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/core/focus/useFocusTrap'
import { cn } from '@/utils/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  initialFocusRef?: React.RefObject<HTMLElement | null>
  role?: 'dialog' | 'alertdialog'
  className?: string
  showCloseButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  initialFocusRef,
  role = 'dialog',
  className,
  showCloseButton = true,
}) => {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useFocusTrap(dialogRef, {
    enabled: isOpen,
    initialFocusRef,
    onEscape: onClose,
  })

  // Prevent body scroll while open
  useEffect(() => {
    if (!isOpen) return
    const originalStyle = window.getComputedStyle(document.body).overflow
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalStyle
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size]

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      data-testid="modal-backdrop"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] p-6 shadow-2xl transition-all outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
          sizeClasses,
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
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
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-4 text-[var(--text-primary)]">{children}</div>
      </div>
    </div>,
    document.body
  )
}
