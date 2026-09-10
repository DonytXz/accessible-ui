import React, { useState, useRef, useId } from 'react'
import { cn } from '@/utils/cn'

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

export interface TabsProps {
  items: TabItem[]
  defaultTab?: string
  value?: string
  onChange?: (tabId: string) => void
  ariaLabel?: string
  orientation?: 'horizontal' | 'vertical'
  activationMode?: 'automatic' | 'manual'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  value: valueProp,
  onChange,
  ariaLabel = 'Content Tabs',
  orientation = 'horizontal',
  activationMode = 'automatic',
  className,
}) => {
  const [uncontrolledTab, setUncontrolledTab] = useState<string>(
    defaultTab || items[0]?.id || ''
  )
  const isControlled = valueProp !== undefined
  const activeTabId = isControlled ? valueProp : uncontrolledTab

  const tablistRef = useRef<HTMLDivElement | null>(null)
  const tabsPrefix = useId()

  const handleSelectTab = (id: string) => {
    if (!isControlled) {
      setUncontrolledTab(id)
    }
    onChange?.(id)
  }

  const enabledItems = items.filter((item) => !item.disabled)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = enabledItems.findIndex((item) => item.id === activeTabId)
    if (currentIndex === -1) return

    let nextIndex: number | null = null

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % enabledItems.length
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length
      }
    } else {
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % enabledItems.length
      } else if (e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length
      }
    }

    if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = enabledItems.length - 1
    }

    if (nextIndex !== null) {
      e.preventDefault()
      const nextItem = enabledItems[nextIndex]
      const tabButton = tablistRef.current?.querySelector<HTMLButtonElement>(
        `#${tabsPrefix}-tab-${nextItem.id}`
      )
      tabButton?.focus()

      if (activationMode === 'automatic') {
        handleSelectTab(nextItem.id)
      }
    }
  }

  const activeItem = items.find((item) => item.id === activeTabId) || items[0]

  return (
    <div
      className={cn(
        'w-full flex',
        orientation === 'vertical' ? 'flex-row gap-6' : 'flex-col gap-4',
        className
      )}
    >
      {/* Tablist Container */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex rounded-xl bg-[var(--bg-surface)] p-1 border border-[var(--border-subtle)]',
          orientation === 'vertical' ? 'flex-col w-64 self-start' : 'flex-row w-full max-w-xl'
        )}
      >
        {items.map((item) => {
          const isSelected = item.id === activeTabId
          const tabId = `${tabsPrefix}-tab-${item.id}`
          const panelId = `${tabsPrefix}-panel-${item.id}`

          return (
            <button
              key={item.id}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleSelectTab(item.id)}
              className={cn(
                'relative flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
                isSelected
                  ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]/40',
                item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
              )}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    isSelected
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-surface-active)] text-[var(--text-muted)]'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tabpanel Content */}
      {activeItem && (
        <div
          key={activeItem.id}
          id={`${tabsPrefix}-panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`${tabsPrefix}-tab-${activeItem.id}`}
          tabIndex={0}
          className="flex-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] p-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] animate-in fade-in duration-150"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  )
}
