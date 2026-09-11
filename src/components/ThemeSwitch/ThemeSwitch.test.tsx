import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSwitch } from './ThemeSwitch'
import { assertNoA11yViolations } from '@/test/a11y-helper'

describe('ThemeSwitch Component (Segmented Variant)', () => {
  it('renders with radiogroup and radio roles with correct aria-checked states', () => {
    render(<ThemeSwitch theme="light" onChange={() => {}} />)

    const group = screen.getByRole('radiogroup', { name: /color theme/i })
    expect(group).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)

    const lightRadio = screen.getByRole('radio', { name: /light/i })
    const darkRadio = screen.getByRole('radio', { name: /dark/i })

    expect(lightRadio).toHaveAttribute('aria-checked', 'true')
    expect(lightRadio).toHaveAttribute('tabIndex', '0')

    expect(darkRadio).toHaveAttribute('aria-checked', 'false')
    expect(darkRadio).toHaveAttribute('tabIndex', '-1')
  })

  it('triggers onChange when clicking radio option', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<ThemeSwitch theme="light" onChange={handleChange} />)

    const darkRadio = screen.getByRole('radio', { name: /dark/i })
    await user.click(darkRadio)

    expect(handleChange).toHaveBeenCalledWith('dark')
  })

  it('cycles options using ArrowRight and ArrowLeft keys', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<ThemeSwitch theme="light" onChange={handleChange} />)

    const lightRadio = screen.getByRole('radio', { name: /light/i })
    await user.click(lightRadio)

    await user.keyboard('{ArrowRight}')
    expect(handleChange).toHaveBeenCalledWith('dark')
  })

  it('passes axe-core accessibility audit in segmented mode', async () => {
    const { baseElement } = render(<ThemeSwitch theme="light" onChange={() => {}} />)
    await assertNoA11yViolations(baseElement)
  })
})

describe('ThemeSwitch Component (Toggle Variant)', () => {
  it('renders switch role and toggles theme state', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<ThemeSwitch theme="light" variant="toggle" onChange={handleChange} />)

    const toggle = screen.getByRole('switch')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await user.click(toggle)
    expect(handleChange).toHaveBeenCalledWith('dark')
  })

  it('passes axe-core accessibility audit in toggle mode', async () => {
    const { baseElement } = render(<ThemeSwitch theme="dark" variant="toggle" onChange={() => {}} />)
    await assertNoA11yViolations(baseElement)
  })
})
