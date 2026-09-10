import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'
import { Drawer } from './Drawer'
import { assertNoA11yViolations } from '@/test/a11y-helper'

describe('Modal Component', () => {
  it('renders with correct ARIA attributes when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" description="Modal description">
        <p>Modal content</p>
        <button type="button">Action</button>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Test Modal')
    expect(dialog).toHaveAccessibleDescription('Modal description')
  })

  it('triggers onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <button type="button">Inside</button>
      </Modal>
    )

    await user.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('triggers onClose when clicking the backdrop', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal isOpen={true} onClose={handleClose} title="Backdrop Test">
        <p>Inside</p>
      </Modal>
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    await user.click(backdrop)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('passes axe-core accessibility audits', async () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={() => {}} title="A11y Verified Dialog" description="Accessible text">
        <p>Sample accessible content inside modal.</p>
        <button type="button">Confirm</button>
      </Modal>
    )

    await assertNoA11yViolations(baseElement)
  })
})

describe('Drawer Component', () => {
  it('renders correctly and satisfies a11y standards', async () => {
    const { baseElement } = render(
      <Drawer isOpen={true} onClose={() => {}} title="Navigation Drawer" description="Drawer details">
        <nav aria-label="Drawer navigation">
          <ul>
            <li><a href="#link1">Link 1</a></li>
            <li><a href="#link2">Link 2</a></li>
          </ul>
        </nav>
      </Drawer>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await assertNoA11yViolations(baseElement)
  })
})
