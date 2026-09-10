import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip } from './Tooltip'
import { Popover } from './Popover'
import { assertNoA11yViolations } from '@/test/a11y-helper'

describe('Tooltip Component', () => {
  it('displays tooltip role and updates aria-describedby on focus', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Helpful explanation" delay={0}>
        <button type="button">Action Trigger</button>
      </Tooltip>
    )

    const button = screen.getByRole('button', { name: 'Action Trigger' })
    expect(button).not.toHaveAttribute('aria-describedby')

    await user.hover(button)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('Helpful explanation')
    expect(button).toHaveAttribute('aria-describedby', tooltip.id)
  })

  it('passes axe-core accessibility audit', async () => {
    const user = userEvent.setup()
    const { baseElement } = render(
      <Tooltip content="Accessible tooltip description" delay={0}>
        <button type="button">Accessible Button</button>
      </Tooltip>
    )

    await user.hover(screen.getByRole('button'))
    await assertNoA11yViolations(baseElement)
  })
})

describe('Popover Component', () => {
  it('renders with dialog semantics and updates aria-expanded', async () => {
    const user = userEvent.setup()
    render(
      <Popover trigger={<span>Open Popover</span>} title="Settings Panel">
        <p>Popover internal content</p>
      </Popover>
    )

    const trigger = screen.getByRole('button', { name: /open popover/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const dialog = screen.getByRole('dialog', { name: 'Settings Panel' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Popover internal content')).toBeInTheDocument()
  })

  it('passes axe-core audit', async () => {
    const user = userEvent.setup()
    const { baseElement } = render(
      <Popover trigger={<span>Toggle Filter</span>} title="Filter Options">
        <label>
          <input type="checkbox" /> Include archived
        </label>
      </Popover>
    )

    await user.click(screen.getByRole('button'))
    await assertNoA11yViolations(baseElement)
  })
})
