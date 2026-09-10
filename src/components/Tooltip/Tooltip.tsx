import React, { useState, useRef, useId, cloneElement, isValidElement } from 'react'
import { cn } from '@/utils/cn'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>
  placement?: TooltipPlacement
  delay?: number
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      e.stopPropagation()
      hide()
    }
  }

  const placementClasses: Record<TooltipPlacement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  if (!isValidElement(children)) {
    return null
  }

  const trigger = cloneElement(children, {
    'aria-describedby': isVisible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show()
      children.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide()
      children.props.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show()
      children.props.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide()
      children.props.onBlur?.(e)
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      handleKeyDown(e)
      children.props.onKeyDown?.(e)
    },
  })

  return (
    <div className="relative inline-block">
      {trigger}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface-active)] border border-[var(--border-strong)] shadow-lg whitespace-nowrap pointer-events-none transition-all',
            placementClasses[placement],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
