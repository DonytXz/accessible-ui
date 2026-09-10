import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker } from './DateRangePicker'
import { assertNoA11yViolations } from '@/test/a11y-helper'

describe('DateRangePicker Component', () => {
  it('renders trigger button with accessible label and popup attributes', () => {
    render(<DateRangePicker label="Booking Period" />)

    const trigger = screen.getByRole('button', { name: /booking period/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens calendar dialog on click and displays grid with accessible day labels', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker label="Travel Dates" />)

    const trigger = screen.getByRole('button', { name: /travel dates/i })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()

    const dayButtons = screen.getAllByRole('button', { name: /day/i })
    expect(dayButtons.length).toBeGreaterThan(20)
  })

  it('selects date range on user click', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<DateRangePicker label="Schedule" onChange={handleChange} />)

    const trigger = screen.getByRole('button', { name: /schedule/i })
    await user.click(trigger)

    const day15 = screen.getByRole('button', { name: /15/i })
    await user.click(day15)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.any(Date),
        end: null,
      })
    )
  })

  it('passes axe-core accessibility audits when opened', async () => {
    const user = userEvent.setup()
    const { baseElement } = render(<DateRangePicker label="Reservation" />)

    const trigger = screen.getByRole('button', { name: /reservation/i })
    await user.click(trigger)

    await assertNoA11yViolations(baseElement)
  })
})
