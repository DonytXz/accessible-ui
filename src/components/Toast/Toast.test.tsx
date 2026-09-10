import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastProvider'
import { assertNoA11yViolations } from '@/test/a11y-helper'

const TestTrigger = () => {
  const { toast } = useToast()
  return (
    <div>
      <button
        onClick={() => toast({ title: 'Deployment Succeeded', variant: 'success' })}
        type="button"
      >
        Trigger Success
      </button>
      <button
        onClick={() => toast({ title: 'Database Outage', variant: 'error' })}
        type="button"
      >
        Trigger Error
      </button>
    </div>
  )
}

describe('Toast Component & Provider', () => {
  it('renders polite live region for standard notifications', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    )

    await user.click(screen.getByText('Trigger Success'))

    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
    expect(statusElement).toHaveTextContent('Deployment Succeeded')
  })

  it('renders assertive alert for error notifications', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    )

    await user.click(screen.getByText('Trigger Error'))

    const alertElement = screen.getByRole('alert')
    expect(alertElement).toBeInTheDocument()
    expect(alertElement).toHaveAttribute('aria-live', 'assertive')
    expect(alertElement).toHaveTextContent('Database Outage')
  })

  it('dismisses notification when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    )

    await user.click(screen.getByText('Trigger Success'))
    expect(screen.getByText('Deployment Succeeded')).toBeInTheDocument()

    const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i })
    await user.click(dismissBtn)

    expect(screen.queryByText('Deployment Succeeded')).not.toBeInTheDocument()
  })

  it('passes axe-core accessibility audits', async () => {
    const user = userEvent.setup()
    const { baseElement } = render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>
    )

    await user.click(screen.getByText('Trigger Success'))
    await assertNoA11yViolations(baseElement)
  })
})
