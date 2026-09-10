import React, { useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
    'aria-errormessage'?: string
    'aria-required'?: boolean
  }) => React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  children,
  className,
}) => {
  const inputId = useId()
  const errorId = useId()
  const hintId = useId()

  const describedByParts: string[] = []
  if (hint) describedByParts.push(hintId)
  if (error) describedByParts.push(errorId)
  const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined

  return (
    <div className={cn('w-full flex flex-col gap-1.5 text-left', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-[var(--status-error)]" aria-hidden="true">*</span>}
      </label>

      {children({
        id: inputId,
        'aria-describedby': ariaDescribedBy,
        'aria-invalid': Boolean(error),
        'aria-errormessage': error ? errorId : undefined,
        'aria-required': required ? true : undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--text-secondary)]">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-[var(--status-error)] flex items-center gap-1.5 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-11 px-3.5 rounded-xl border bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all',
          error
            ? 'border-[var(--status-error)] focus-visible:ring-2 focus-visible:ring-[var(--status-error)]'
            : 'border-[var(--border-strong)] hover:border-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
          'outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
