import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabItem } from './Tabs'
import { assertNoA11yViolations } from '@/test/a11y-helper'

const mockTabs: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p>Overview Content</p> },
  { id: 'analytics', label: 'Analytics', content: <p>Analytics Content</p> },
  { id: 'settings', label: 'Settings', content: <p>Settings Content</p>, disabled: true },
]

describe('Tabs Component', () => {
  it('renders with appropriate tablist, tab, and tabpanel ARIA semantics', () => {
    render(<Tabs items={mockTabs} ariaLabel="Dashboard Sections" />)

    const tablist = screen.getByRole('tablist', { name: 'Dashboard Sections' })
    expect(tablist).toBeInTheDocument()

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('tabIndex', '0')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('tabIndex', '-1')

    const panel = screen.getByRole('tabpanel')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent('Overview Content')
  })

  it('cycles active tab using ArrowRight and ArrowLeft keys', async () => {
    const user = userEvent.setup()
    render(<Tabs items={mockTabs} />)

    const firstTab = screen.getByRole('tab', { name: /overview/i })
    await user.click(firstTab)

    await user.keyboard('{ArrowRight}')
    const secondTab = screen.getByRole('tab', { name: /analytics/i })
    expect(secondTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Analytics Content')).toBeInTheDocument()

    // Left arrow moves back to first tab
    await user.keyboard('{ArrowLeft}')
    expect(firstTab).toHaveAttribute('aria-selected', 'true')
  })

  it('passes axe-core accessibility audits', async () => {
    const { baseElement } = render(<Tabs items={mockTabs} ariaLabel="System Controls" />)
    await assertNoA11yViolations(baseElement)
  })
})
