import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField, Input } from './FormField'
import { Switch } from './Switch'
import { assertNoA11yViolations } from '@/test/a11y-helper'

describe('FormField & Input Component', () => {
  it('connects label to input and provides accessible name', () => {
    render(
      <FormField label="Email Address" hint="We will never share your email.">
        {(props) => <Input {...props} type="email" placeholder="you@company.com" />}
      </FormField>
    )

    const input = screen.getByRole('textbox', { name: /email address/i })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAccessibleDescription('We will never share your email.')
  })

  it('renders accessible error state with alert role and aria-errormessage', () => {
    render(
      <FormField label="API Key" error="API key is required.">
        {(props) => <Input {...props} error={props['aria-invalid']} />}
      </FormField>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('API key is required.')
    expect(input).toHaveAttribute('aria-errormessage', alert.id)
  })

  it('passes axe-core audit', async () => {
    const { baseElement } = render(
      <FormField label="Full Name" hint="First and last name">
        {(props) => <Input {...props} />}
      </FormField>
    )
    await assertNoA11yViolations(baseElement)
  })
})

describe('Switch Component', () => {
  it('renders switch role and toggles aria-checked on click', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Switch
        label="Two-Factor Authentication"
        description="Require SMS or authenticator code on login."
        defaultChecked={false}
        onChange={handleChange}
      />
    )

    const switchBtn = screen.getByRole('switch', { name: /two-factor authentication/i })
    expect(switchBtn).toBeInTheDocument()
    expect(switchBtn).toHaveAttribute('aria-checked', 'false')

    await user.click(switchBtn)
    expect(switchBtn).toHaveAttribute('aria-checked', 'true')
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('toggles using Space and Enter keys', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Switch label="Sound Effects" onChange={handleChange} />)

    const switchBtn = screen.getByRole('switch', { name: /sound effects/i })
    await user.click(switchBtn) // focus and toggle
    await user.keyboard(' ') // Space
    expect(switchBtn).toHaveAttribute('aria-checked', 'false')

    await user.keyboard('{Enter}') // Enter
    expect(switchBtn).toHaveAttribute('aria-checked', 'true')
  })

  it('passes axe-core audit', async () => {
    const { baseElement } = render(
      <Switch label="Push Notifications" description="Receive instant updates" />
    )
    await assertNoA11yViolations(baseElement)
  })
})
