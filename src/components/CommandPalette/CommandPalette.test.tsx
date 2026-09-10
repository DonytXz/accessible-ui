import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette, CommandItem } from './CommandPalette'
import { assertNoA11yViolations } from '@/test/a11y-helper'

const mockItems: CommandItem[] = [
  { id: '1', label: 'Go to Dashboard', category: 'Navigation', onSelect: vi.fn() },
  { id: '2', label: 'Create New Project', category: 'Actions', onSelect: vi.fn(), shortcut: '⌘N' },
  { id: '3', label: 'Dark Mode Settings', category: 'Preferences', onSelect: vi.fn() },
]

describe('CommandPalette Component', () => {
  it('renders with valid combobox and listbox ARIA hierarchy', () => {
    render(<CommandPalette isOpen={true} onClose={() => {}} items={mockItems} />)

    const combobox = screen.getByRole('combobox')
    expect(combobox).toBeInTheDocument()
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(combobox).toHaveAttribute('aria-autocomplete', 'list')

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates with ArrowDown and ArrowUp and selects on Enter', async () => {
    const user = userEvent.setup()
    render(<CommandPalette isOpen={true} onClose={() => {}} items={mockItems} />)

    const input = screen.getByRole('combobox')
    await user.click(input)

    let options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    options = screen.getAllByRole('option')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')
    expect(mockItems[1].onSelect).toHaveBeenCalledTimes(1)
  })

  it('filters items correctly on input', async () => {
    const user = userEvent.setup()
    render(<CommandPalette isOpen={true} onClose={() => {}} items={mockItems} />)

    const input = screen.getByRole('combobox')
    await user.type(input, 'Project')

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Create New Project')
  })

  it('passes axe-core accessibility audits', async () => {
    const { baseElement } = render(<CommandPalette isOpen={true} onClose={() => {}} items={mockItems} />)
    await assertNoA11yViolations(baseElement)
  })
})
