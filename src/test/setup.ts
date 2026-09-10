import '@testing-library/jest-dom'

// Mock ResizeObserver for Virtualizer and DataGrid tests in jsdom
if (typeof window !== 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock
  
  // Mock scrollIntoView
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {})
}
