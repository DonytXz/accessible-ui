import React, { useState, useRef, useId, useEffect } from 'react'
import { cn } from '@/utils/cn'

export interface PopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  title?: string
  className?: string
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  title,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const popoverId = useId()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className="inline-flex cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-lg"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-modal="false"
          aria-label={title || 'Popover dialog'}
          className={cn(
            'absolute z-50 mt-2 w-72 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 shadow-xl text-left',
            className
          )}
        >
          {title && (
            <h4 className="text-sm font-semibold text-[var(--text-primary)] pb-2 mb-2 border-b border-[var(--border-subtle)]">
              {title}
            </h4>
          )}
          <div className="text-sm text-[var(--text-secondary)]">{children}</div>
        </div>
      )}
    </div>
  )
}
