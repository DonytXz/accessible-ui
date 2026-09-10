import { useCallback, useEffect, useRef } from 'react'

type LivePoliteness = 'polite' | 'assertive'

let livePoliteRegion: HTMLElement | null = null
let liveAssertiveRegion: HTMLElement | null = null

function getOrCreateLiveRegion(politeness: LivePoliteness): HTMLElement {
  let element = politeness === 'polite' ? livePoliteRegion : liveAssertiveRegion

  if (!element || !document.body.contains(element)) {
    element = document.createElement('div')
    element.setAttribute('aria-live', politeness)
    element.setAttribute('aria-atomic', 'true')
    element.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
    
    // Visually hidden styles that screen readers can still read
    element.style.position = 'absolute'
    element.style.width = '1px'
    element.style.height = '1px'
    element.style.padding = '0'
    element.style.margin = '-1px'
    element.style.overflow = 'hidden'
    element.style.clip = 'rect(0, 0, 0, 0)'
    element.style.whiteSpace = 'nowrap'
    element.style.border = '0'

    document.body.appendChild(element)

    if (politeness === 'polite') {
      livePoliteRegion = element
    } else {
      liveAssertiveRegion = element
    }
  }

  return element
}

export function announceToScreenReader(message: string, politeness: LivePoliteness = 'polite') {
  if (typeof document === 'undefined') return
  const region = getOrCreateLiveRegion(politeness)
  // Clear first to ensure re-announcement of identical strings
  region.textContent = ''
  setTimeout(() => {
    region.textContent = message
  }, 50)
}

export function useAriaLive() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = useCallback((message: string, politeness: LivePoliteness = 'polite') => {
    announceToScreenReader(message, politeness)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { announce }
}
