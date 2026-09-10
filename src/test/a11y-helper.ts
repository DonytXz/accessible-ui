import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Runs axe-core against a rendered container and asserts zero WCAG AA violations.
 * Component-level testing disables full-page landmark checks (like `region`, `landmark-one-main`)
 * since isolated component fragments are not whole documents.
 */
export async function assertNoA11yViolations(
  container: Element | HTMLElement,
  options?: axe.RunOptions
): Promise<axe.AxeResults> {
  const defaultOptions: axe.RunOptions = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
    rules: {
      // Disable page-level landmark requirements for isolated component tests
      region: { enabled: false },
      'landmark-one-main': { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
    ...options,
  }

  const results = await axe.run(container, defaultOptions)

  if (results.violations.length > 0) {
    const errorReport = results.violations
      .map((violation) => {
        const nodes = violation.nodes.map((n) => ` - ${n.target.join(' ')}: ${n.failureSummary}`).join('\n')
        return `[${violation.id}] (${violation.impact}): ${violation.help} (${violation.helpUrl})\n${nodes}`
      })
      .join('\n\n')

    expect.fail(`Expected no accessibility violations, but found ${results.violations.length}:\n\n${errorReport}`)
  }

  return results
}
