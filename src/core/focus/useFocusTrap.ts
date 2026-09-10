import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(',')

interface UseFocusTrapOptions {
  enabled?: boolean
  initialFocusRef?: React.RefObject<HTMLElement | null>
  onEscape?: () => void
  restoreFocus?: boolean
}

export function useFocusTrap<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, initialFocusRef, onEscape, restoreFocus = true } = options
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Save element that had focus before trapping
    if (document.activeElement instanceof HTMLElement) {
      previousActiveElement.current = document.activeElement
    }

    const container = containerRef.current
    if (!container) return

    // Focus initial element or first focusable child
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else {
          container.focus()
        }
      }
    }, 10)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.stopPropagation()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)

      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement || document.activeElement === container) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      if (restoreFocus && previousActiveElement.current && document.body.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus()
      }
    }
  }, [enabled, containerRef, initialFocusRef, onEscape, restoreFocus])
}
