import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataGrid, Column } from './DataGrid'
import { assertNoA11yViolations } from '@/test/a11y-helper'

interface TestRow extends Record<string, unknown> {
  id: string
  name: string
  role: string
  latency: number
}

const mockColumns: Column<TestRow>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
  { id: 'role', header: 'Role', accessor: (r) => r.role, sortable: true },
  { id: 'latency', header: 'Latency (ms)', accessor: (r) => `${r.latency}ms`, sortable: true },
]

const mockData: TestRow[] = [
  { id: '1', name: 'Alpha Node', role: 'Gateway', latency: 12 },
  { id: '2', name: 'Beta Worker', role: 'Compute', latency: 45 },
  { id: '3', name: 'Gamma Cache', role: 'Redis', latency: 3 },
]

describe('DataGrid Component', () => {
  it('renders with appropriate ARIA roles and counts', () => {
    render(<DataGrid data={mockData} columns={mockColumns} ariaLabel="Test Data Grid" />)

    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveAttribute('aria-label', 'Test Data Grid')
    expect(grid).toHaveAttribute('aria-rowcount', '4') // 1 header + 3 data
    expect(grid).toHaveAttribute('aria-colcount', '3')

    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(3)
    expect(headers[0]).toHaveAttribute('aria-sort', 'none')
  })

  it('updates aria-sort when column header is clicked', async () => {
    const user = userEvent.setup()
    render(<DataGrid data={mockData} columns={mockColumns} />)

    const nameHeader = screen.getByText('Name')
    await user.click(nameHeader)

    const headers = screen.getAllByRole('columnheader')
    expect(headers[0]).toHaveAttribute('aria-sort', 'ascending')

    await user.click(nameHeader)
    expect(headers[0]).toHaveAttribute('aria-sort', 'descending')
  })

  it('handles 2D keyboard navigation across cells', async () => {
    const user = userEvent.setup()
    render(<DataGrid data={mockData} columns={mockColumns} />)

    const grid = screen.getByRole('grid')
    await user.click(grid)

    // Navigate right
    await user.keyboard('{ArrowRight}')
    // Navigate down
    await user.keyboard('{ArrowDown}')

    expect(grid).toHaveFocus()
  })

  it('passes axe-core accessibility audits', async () => {
    const { baseElement } = render(<DataGrid data={mockData} columns={mockColumns} />)
    await assertNoA11yViolations(baseElement)
  })
})
