import React, { useId } from 'react'
import { cn } from '@/utils/cn'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked: checkedProp,
  defaultChecked = false,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked)
  const isControlled = checkedProp !== undefined
  const isChecked = isControlled ? checkedProp : uncontrolledChecked

  const switchId = useId()
  const labelId = useId()
  const descId = useId()

  const toggle = () => {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) {
      setUncontrolledChecked(next)
    }
    onChange?.(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <div className={cn('flex items-start justify-between gap-4 text-left cursor-pointer select-none', className)}>
      <div className="flex flex-col" onClick={toggle}>
        <span id={labelId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
        {description && (
          <span id={descId} className="text-xs text-[var(--text-secondary)] mt-0.5">
            {description}
          </span>
        )}
      </div>

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]',
          isChecked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-surface-active)]',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            isChecked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
