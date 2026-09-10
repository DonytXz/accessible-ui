import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Combobox, ComboboxOption } from './Combobox'
import { assertNoA11yViolations } from '@/test/a11y-helper'

const mockOptions: ComboboxOption[] = [
  { value: 'react', label: 'React', description: 'UI Library' },
  { value: 'vue', label: 'Vue', description: 'Progressive Framework' },
  { value: 'angular', label: 'Angular', description: 'Platform' },
]

describe('Combobox Component', () => {
  it('renders with accessible combobox role and label', () => {
    render(<Combobox options={mockOptions} label="Frameworks" defaultValue={['react']} />)

    const combobox = screen.getByRole('combobox')
    expect(combobox).toBeInTheDocument()
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(combobox).toHaveAccessibleName('Frameworks')

    // Selected tag remove button has accessible label
    const removeBtn = screen.getByRole('button', { name: /remove react/i })
    expect(removeBtn).toBeInTheDocument()
  })

  it('opens listbox and selects multiple options with keyboard', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Combobox options={mockOptions} onChange={handleChange} label="Frameworks" />)

    const combobox = screen.getByRole('combobox')
    await user.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true')

    // Select first option with Enter
    await user.keyboard('{Enter}')
    expect(handleChange).toHaveBeenCalledWith(['react'])
  })

  it('removes selected tag when clicking remove button', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Combobox options={mockOptions} defaultValue={['react', 'vue']} onChange={handleChange} />)

    const removeBtn = screen.getByRole('button', { name: /remove react/i })
    await user.click(removeBtn)

    expect(handleChange).toHaveBeenCalledWith(['vue'])
  })

  it('passes axe-core accessibility audits', async () => {
    const { baseElement } = render(<Combobox options={mockOptions} label="Tech Stack" defaultValue={['react']} />)
    await assertNoA11yViolations(baseElement)
  })
})
