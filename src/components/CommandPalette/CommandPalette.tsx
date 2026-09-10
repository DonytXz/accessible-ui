import React, { useState, useEffect, useId, useRef, useMemo } from 'react'
import { Search, Command, CornerDownLeft } from 'lucide-react'
import { Modal } from '@/components/Dialog/Modal'
import { cn } from '@/utils/cn'

export interface CommandItem {
  id: string
  label: string
  category: string
  shortcut?: string
  icon?: React.ReactNode
  onSelect: () => void
}

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  items: CommandItem[]
  placeholder?: string
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items,
  placeholder = 'Type a command or search...',
}) => {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listboxId = useId()
  const liveRegionId = useId()

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items
    const lower = query.toLowerCase()
    return items.filter(
      (item) => item.label.toLowerCase().includes(lower) || item.category.toLowerCase().includes(lower)
    )
  }, [items, query])

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [filteredItems])

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filteredItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredItems[activeIndex]
      if (selected) {
        selected.onSelect()
        onClose()
      }
    }
  }

  const activeItem = filteredItems[activeIndex]
  const activeOptionId = activeItem ? `command-option-${activeItem.id}` : undefined

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Command Palette"
      description="Quickly navigate or trigger actions"
      size="lg"
      className="p-0 overflow-hidden bg-[var(--bg-surface)] border-[var(--border-strong)]"
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
        <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base outline-none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--bg-surface-raised)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Screen reader live announcement */}
      <div id={liveRegionId} role="status" aria-live="polite" className="sr-only">
        {filteredItems.length === 0
          ? 'No commands found'
          : `${filteredItems.length} command${filteredItems.length === 1 ? '' : 's'} available.`}
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label="Available commands"
        className="max-h-80 overflow-y-auto p-2 divide-y divide-transparent"
      >
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            No results found for &ldquo;<span className="text-[var(--text-primary)]">{query}</span>&rdquo;
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, itemsInCategory]) => (
            <div key={category} role="group" aria-label={category} className="py-1.5">
              <div className="px-3 py-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {category}
              </div>
              <div className="mt-1 space-y-0.5">
                {itemsInCategory.map((item) => {
                  const globalIdx = filteredItems.indexOf(item)
                  const isSelected = globalIdx === activeIndex
                  const itemId = `command-option-${item.id}`

                  return (
                    <div
                      key={item.id}
                      id={itemId}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        item.onSelect()
                        onClose()
                      }}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors select-none',
                        isSelected
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-medium'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon && (
                          <span
                            className={cn(
                              'shrink-0',
                              isSelected ? 'text-[var(--accent-contrast)]' : 'text-[var(--text-muted)]'
                            )}
                          >
                            {item.icon}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut ? (
                        <kbd
                          className={cn(
                            'text-xs font-mono px-1.5 py-0.5 rounded border',
                            isSelected
                              ? 'border-black/20 bg-black/10 text-[var(--accent-contrast)]'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-muted)]'
                          )}
                        >
                          {item.shortcut}
                        </kbd>
                      ) : isSelected ? (
                        <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
