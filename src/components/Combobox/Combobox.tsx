import React, { useState, useRef, useId, useMemo, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (selectedValues: string[]) => void
  placeholder?: string
  label?: string
  hint?: string
  className?: string
  disabled?: boolean
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value: valueProp,
  defaultValue = [],
  onChange,
  placeholder = 'Select options...',
  label,
  hint,
  className,
  disabled = false,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue)
  const isControlled = valueProp !== undefined
  const selectedValues = isControlled ? valueProp : uncontrolledValue

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listboxRef = useRef<HTMLDivElement | null>(null)

  const comboboxId = useId()
  const listboxId = useId()
  const labelId = useId()
  const hintId = useId()
  const liveRegionId = useId()

  const setSelectedValues = (newVals: string[]) => {
    if (!isControlled) {
      setUncontrolledValue(newVals)
    }
    onChange?.(newVals)
  }

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    const lower = query.toLowerCase()
    return options.filter(
      (opt) => opt.label.toLowerCase().includes(lower) || opt.description?.toLowerCase().includes(lower)
    )
  }, [options, query])

  // Reset active index when query or filtered options change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optVal: string) => {
    if (selectedValues.includes(optVal)) {
      setSelectedValues(selectedValues.filter((v) => v !== optVal))
    } else {
      setSelectedValues([...selectedValues, optVal])
    }
    inputRef.current?.focus()
  }

  const removeValue = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValues(selectedValues.filter((v) => v !== valToRemove))
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else if (filteredOptions.length > 0) {
          setActiveIndex((prev) => (prev + 1) % filteredOptions.length)
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else if (filteredOptions.length > 0) {
          setActiveIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
        }
        break

      case 'Enter':
        e.preventDefault()
        if (isOpen && filteredOptions[activeIndex]) {
          toggleOption(filteredOptions[activeIndex].value)
        } else {
          setIsOpen(true)
        }
        break

      case 'Escape':
        if (isOpen) {
          e.preventDefault()
          setIsOpen(false)
        }
        break

      case 'Backspace':
        if (!query && selectedValues.length > 0) {
          // Remove last tag if input is empty
          setSelectedValues(selectedValues.slice(0, -1))
        }
        break
    }
  }

  const activeOption = filteredOptions[activeIndex]
  const activeOptionId = activeOption && isOpen ? `${comboboxId}-opt-${activeOption.value}` : undefined

  return (
    <div ref={containerRef} className={cn('relative w-full text-left', className)}>
      {label && (
        <label id={labelId} htmlFor={comboboxId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label}
        </label>
      )}

      {/* Screen Reader Live Announcement */}
      <div id={liveRegionId} role="status" aria-live="polite" className="sr-only">
        {isOpen ? `${filteredOptions.length} options available.` : ''}
      </div>

      {/* Combobox Wrapper Box */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true)
            inputRef.current?.focus()
          }
        }}
        className={cn(
          'min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1.5 flex flex-wrap items-center gap-1.5 transition-all cursor-text',
          isOpen ? 'ring-2 ring-[var(--border-focus)] border-[var(--border-focus)]' : 'hover:border-[var(--text-muted)]',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {/* Selected Tokens */}
        {selectedValues.map((val) => {
          const opt = options.find((o) => o.value === val)
          const labelText = opt ? opt.label : val
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium px-2.5 py-1"
            >
              <span>{labelText}</span>
              <button
                type="button"
                onClick={(e) => removeValue(val, e)}
                aria-label={`Remove ${labelText}`}
                className="hover:text-[var(--status-error)] transition-colors focus-visible:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )
        })}

        {/* Combobox Input */}
        <input
          ref={inputRef}
          id={comboboxId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={hint ? hintId : undefined}
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder={selectedValues.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none px-2 py-1"
          autoComplete="off"
        />

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) setIsOpen(!isOpen)
          }}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>
      </div>

      {hint && (
        <p id={hintId} className="mt-1 text-xs text-[var(--text-secondary)]">
          {hint}
        </p>
      )}

      {/* Popover Listbox */}
      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={label || 'Options'}
          aria-multiselectable="true"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1.5 shadow-xl transition-all"
        >
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-sm text-[var(--text-muted)]">No options found.</div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedValues.includes(opt.value)
              const isActive = idx === activeIndex
              const optionId = `${comboboxId}-opt-${opt.value}`

              return (
                <div
                  key={opt.value}
                  id={optionId}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(opt.value)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors select-none',
                    isActive ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                    isSelected && 'text-[var(--accent-primary)] font-medium'
                  )}
                >
                  <div className="flex flex-col">
                    <span className={cn(isSelected ? 'text-[var(--text-primary)] font-medium' : '')}>{opt.label}</span>
                    {opt.description && (
                      <span className="text-xs text-[var(--text-muted)] mt-0.5">{opt.description}</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
