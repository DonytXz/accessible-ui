import React, { useId, useRef } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/utils/cn'

export type Theme = 'light' | 'dark'

export interface ThemeSwitchProps {
  theme: Theme
  onChange: (theme: Theme) => void
  variant?: 'segmented' | 'toggle'
  className?: string
  ariaLabel?: string
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  theme,
  onChange,
  variant = 'segmented',
  className,
  ariaLabel = 'Color theme',
}) => {
  const groupId = useId()
  const lightRef = useRef<HTMLButtonElement | null>(null)
  const darkRef = useRef<HTMLButtonElement | null>(null)

  const toggle = () => {
    onChange(theme === 'light' ? 'dark' : 'light')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange('dark')
      darkRef.current?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange('light')
      lightRef.current?.focus()
    }
  }

  if (variant === 'toggle') {
    const isDark = theme === 'dark'
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={ariaLabel || (isDark ? 'Switch to light theme' : 'Switch to dark theme')}
        onClick={toggle}
        className={cn(
          'relative inline-flex h-8 w-15 items-center rounded-full p-1 transition-colors border border-[var(--border-strong)] bg-[var(--bg-surface-raised)] cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
          className
        )}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={cn(
            'flex h-6 w-6 transform items-center justify-center rounded-full bg-[var(--bg-surface)] shadow-md transition-transform duration-200 border border-[var(--border-subtle)]',
            isDark ? 'translate-x-7 text-sky-400' : 'translate-x-0 text-amber-500'
          )}
        >
          {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </span>
      </button>
    )
  }

  // Segmented Radio Group
  return (
    <div
      role="radiogroup"
      id={groupId}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center rounded-xl p-1 bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-xs select-none',
        className
      )}
    >
      <button
        ref={lightRef}
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        tabIndex={theme === 'light' ? 0 : -1}
        onClick={() => onChange('light')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] cursor-pointer',
          theme === 'light'
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
        <span>Light</span>
      </button>

      <button
        ref={darkRef}
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        tabIndex={theme === 'dark' ? 0 : -1}
        onClick={() => onChange('dark')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] cursor-pointer',
          theme === 'dark'
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
      >
        <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
        <span>Dark</span>
      </button>
    </div>
  )
}
