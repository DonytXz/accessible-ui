import React, { useState, useEffect } from 'react'
import {
  Layers,
  Table,
  Terminal,
  ListFilter,
  Calendar,
  BellRing,
  FolderKanban,
  HelpCircle,
  ToggleLeft,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Command,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/Dialog/Modal'
import { Drawer } from '@/components/Dialog/Drawer'
import { CommandPalette, CommandItem } from '@/components/CommandPalette/CommandPalette'
import { DataGrid } from '@/components/DataGrid/DataGrid'
import { Combobox } from '@/components/Combobox/Combobox'
import { DateRangePicker, DateRange } from '@/components/Calendar/DateRangePicker'
import { useToast } from '@/components/Toast/ToastProvider'
import { Tabs } from '@/components/Tabs/Tabs'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { Popover } from '@/components/Tooltip/Popover'
import { FormField, Input } from '@/components/Form/FormField'
import { Switch } from '@/components/Form/Switch'
import { sampleServers, serverColumns, technologyOptions, ServerNode } from './mockData'

type ComponentKey =
  | 'datagrid'
  | 'dialog'
  | 'command'
  | 'combobox'
  | 'calendar'
  | 'toast'
  | 'tabs'
  | 'tooltip'
  | 'form'

interface ComponentMetadata {
  id: ComponentKey
  title: string
  category: string
  icon: React.ReactNode
  description: string
  wcagCriteria: string[]
  keyboardShortcuts: { key: string; action: string }[]
  codeSnippet: string
}

export const WorkbenchApp: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('datagrid')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isCmdKOpen, setIsCmdKOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'a11y' | 'code'>('preview')
  const [copied, setCopied] = useState(false)

  // Interactive component states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedTech, setSelectedTech] = useState<string[]>(['react', 'typescript'])
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2026, 8, 1),
    end: new Date(2026, 8, 15),
  })
  const [switchState, setSwitchState] = useState(true)
  const [formEmail, setFormEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [selectedServer, setSelectedServer] = useState<ServerNode | null>(null)

  const { toast } = useToast()

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Global Cmd+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCmdKOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Code copied to clipboard', variant: 'info', duration: 2500 })
  }

  const catalog: Record<ComponentKey, ComponentMetadata> = {
    datagrid: {
      id: 'datagrid',
      title: 'Virtualized Data Grid',
      category: 'Data Display',
      icon: <Table className="w-4 h-4" />,
      description:
        'WAI-ARIA APG Grid pattern with 60 FPS TanStack Virtual windowing for 50,000+ records, multi-column sorting, and 2D keyboard navigation.',
      wcagCriteria: [
        'WCAG 2.1.1 Keyboard (Full 2D Grid navigation via Arrow keys, Home, End, PageUp, PageDown)',
        'WCAG 4.1.2 Name, Role, Value (role="grid", role="row", role="columnheader", role="gridcell")',
        'WCAG 1.3.1 Info and Relationships (aria-rowcount, aria-colcount, aria-sort="ascending|descending")',
      ],
      keyboardShortcuts: [
        { key: 'Arrow Keys', action: 'Move active cell focus horizontally and vertically' },
        { key: 'Home / End', action: 'Jump to first or last cell in row' },
        { key: 'Ctrl + Home / End', action: 'Jump to first or last cell in entire grid' },
        { key: 'PageUp / PageDown', action: 'Scroll by 10 rows' },
        { key: 'Enter / Space', action: 'Sort column header or select focused row' },
      ],
      codeSnippet: `import { DataGrid, Column } from 'accessible-ui'

const columns: Column<ServerNode>[] = [
  { id: 'name', header: 'Node Name', accessor: (r) => r.name, sortable: true },
  { id: 'status', header: 'Health', accessor: (r) => r.status, sortable: true },
  { id: 'p99Latency', header: 'Latency', accessor: (r) => \`\${r.p99Latency}ms\`, sortable: true },
]

export function NodeDashboard({ servers }: { servers: ServerNode[] }) {
  return (
    <DataGrid
      data={servers}
      columns={columns}
      height={480}
      ariaLabel="Kubernetes Nodes Cluster"
      onRowClick={(node) => console.log('Selected node:', node)}
    />
  )
}`,
    },
    dialog: {
      id: 'dialog',
      title: 'Modal Dialog & Side Drawer',
      category: 'Overlays',
      icon: <Layers className="w-4 h-4" />,
      description:
        'WAI-ARIA APG Dialog (Modal) pattern with active focus trapping, escape dismissal, scroll lock compensation, and restore focus on close.',
      wcagCriteria: [
        'WCAG 2.1.2 No Keyboard Trap (Strict cyclical focus looping with Shift+Tab and Tab)',
        'WCAG 2.4.3 Focus Order (Focuses first interactive child on open, restores previous trigger focus on close)',
        'WCAG 4.1.2 Name, Role, Value (role="dialog", aria-modal="true", aria-labelledby, aria-describedby)',
      ],
      keyboardShortcuts: [
        { key: 'Tab / Shift+Tab', action: 'Traverse interactive controls confined within modal' },
        { key: 'Escape', action: 'Close dialog and restore focus to trigger button' },
      ],
      codeSnippet: `import { useState } from 'react'
import { Modal, Drawer } from 'accessible-ui'

export function AccountSettings() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Profile</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="User Profile Settings"
        description="Manage security preferences and tokens"
      >
        <form>
          <input type="text" placeholder="Full name" />
          <button type="submit">Save Changes</button>
        </form>
      </Modal>
    </>
  )
}`,
    },
    command: {
      id: 'command',
      title: 'Global Command Palette (Cmd+K)',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4" />,
      description:
        'APG 1.2 Combobox with active descendant keyboard traversal, categorical filtering, and dynamic live region announcement.',
      wcagCriteria: [
        'WCAG 4.1.3 Status Messages (aria-live="polite" announces dynamic result counts to screen readers)',
        'WCAG 4.1.2 Name, Role, Value (role="combobox", aria-expanded="true", aria-activedescendant, role="listbox")',
        'WCAG 2.1.1 Keyboard (ArrowDown/ArrowUp navigation, Enter to execute action, Escape to dismiss)',
      ],
      keyboardShortcuts: [
        { key: '⌘ + K / Ctrl + K', action: 'Global shortcut to toggle command palette from anywhere' },
        { key: 'ArrowDown / ArrowUp', action: 'Navigate filtered command options' },
        { key: 'Enter', action: 'Execute selected command action' },
        { key: 'Escape', action: 'Dismiss palette' },
      ],
      codeSnippet: `import { CommandPalette, CommandItem } from 'accessible-ui'

const actions: CommandItem[] = [
  { id: '1', label: 'Deploy to Staging', category: 'DevOps', onSelect: () => deploy() },
  { id: '2', label: 'Toggle High Contrast', category: 'Preferences', onSelect: () => toggle() },
]

export function App() {
  const [isOpen, setIsOpen] = useState(false)
  return <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} items={actions} />
}`,
    },
    combobox: {
      id: 'combobox',
      title: 'Multi-Select Combobox',
      category: 'Form Controls',
      icon: <ListFilter className="w-4 h-4" />,
      description:
        'APG Combobox multi-select with removable token badges, backspace tag deletion, and full keyboard navigation.',
      wcagCriteria: [
        'WCAG 4.1.2 Name, Role, Value (role="combobox", role="listbox", aria-multiselectable="true")',
        'WCAG 2.1.1 Keyboard (Backspace tag deletion, Arrow keys list navigation, Enter selection)',
        'WCAG 1.3.1 Info and Relationships (Accessible remove button labels on each token badge)',
      ],
      keyboardShortcuts: [
        { key: 'ArrowDown / ArrowUp', action: 'Traverse selectable list options' },
        { key: 'Enter', action: 'Toggle option selection state' },
        { key: 'Backspace', action: 'Remove previous tag when search input is empty' },
        { key: 'Escape', action: 'Close suggestions dropdown' },
      ],
      codeSnippet: `import { useState } from 'react'
import { Combobox } from 'accessible-ui'

export function TechSelector() {
  const [selected, setSelected] = useState(['react', 'typescript'])

  return (
    <Combobox
      options={options}
      value={selected}
      onChange={setSelected}
      label="Tech Stack Dependencies"
      placeholder="Search and select technologies..."
    />
  )
}`,
    },
    calendar: {
      id: 'calendar',
      title: 'Date-Range Calendar & Picker',
      category: 'Data Entry',
      icon: <Calendar className="w-4 h-4" />,
      description:
        'WAI-ARIA APG Calendar Grid pattern with complete 2D keyboard navigation, month paging, and date range boundary calculations without heavy libraries.',
      wcagCriteria: [
        'WCAG 2.1.1 Keyboard (Arrow keys day/week navigation, PageUp/PageDown month navigation)',
        'WCAG 4.1.2 Name, Role, Value (role="grid", role="gridcell", aria-selected="true" for range)',
        'WCAG 1.3.1 Info and Relationships (Localized full date announcements via aria-label)',
      ],
      keyboardShortcuts: [
        { key: 'ArrowLeft / ArrowRight', action: 'Move focus by ±1 day' },
        { key: 'ArrowUp / ArrowDown', action: 'Move focus by ±1 week' },
        { key: 'PageUp / PageDown', action: 'Jump by ±1 month' },
        { key: 'Home / End', action: 'Move to beginning or end of current week' },
        { key: 'Enter / Space', action: 'Select boundary dates for range' },
      ],
      codeSnippet: `import { useState } from 'react'
import { DateRangePicker, DateRange } from 'accessible-ui'

export function Booking() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null })
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      label="Billing Period"
    />
  )
}`,
    },
    toast: {
      id: 'toast',
      title: 'Live Region Toast System',
      category: 'Feedback',
      icon: <BellRing className="w-4 h-4" />,
      description:
        'Screen-reader polite and assertive live regions with focus pause, gesture dismiss, and zero focus hijacking.',
      wcagCriteria: [
        'WCAG 4.1.3 Status Messages (role="status" with aria-live="polite", role="alert" with aria-live="assertive")',
        'WCAG 2.2.1 Timing Adjustable (Auto-dismiss timer pauses automatically when mouse is hovered or tab is focused)',
        'WCAG 2.1.1 Keyboard (Accessible dismiss buttons with clear aria-label)',
      ],
      keyboardShortcuts: [
        { key: 'Tab', action: 'Focusing on toast action pauses the countdown timer' },
        { key: 'Enter / Space', action: 'Activate toast action or dismiss notification' },
      ],
      codeSnippet: `import { useToast } from 'accessible-ui'

export function DeployButton() {
  const { toast } = useToast()

  const handleDeploy = () => {
    toast({
      title: 'Production Build Deployed',
      description: 'Commit 4f29a0 successfully running on edge workers.',
      variant: 'success',
      duration: 5000,
    })
  }

  return <button onClick={handleDeploy}>Deploy App</button>
}`,
    },
    tabs: {
      id: 'tabs',
      title: 'Accessible Keyboard Tabs',
      category: 'Navigation',
      icon: <FolderKanban className="w-4 h-4" />,
      description:
        'WAI-ARIA APG Tabs pattern with automatic/manual keyboard orientation switching and connected tabpanel associations.',
      wcagCriteria: [
        'WCAG 4.1.2 Name, Role, Value (role="tablist", role="tab", aria-selected, aria-controls, role="tabpanel")',
        'WCAG 2.1.1 Keyboard (ArrowRight/ArrowLeft cycling, Home/End jumping)',
        'WCAG 2.4.3 Focus Order (Only active tab is in primary tab sequence via tabIndex="0")',
      ],
      keyboardShortcuts: [
        { key: 'ArrowLeft / ArrowRight', action: 'Cycle between adjacent tabs (with wrapping)' },
        { key: 'Home / End', action: 'Jump directly to first or last available tab' },
      ],
      codeSnippet: `import { Tabs, TabItem } from 'accessible-ui'

const items: TabItem[] = [
  { id: 'metrics', label: 'Telemetry', content: <MetricsView /> },
  { id: 'logs', label: 'Audit Logs', content: <LogsView />, badge: 3 },
  { id: 'settings', label: 'Security', content: <SettingsView /> },
]

export function Dashboard() {
  return <Tabs items={items} ariaLabel="Cluster Navigation" />
}`,
    },
    tooltip: {
      id: 'tooltip',
      title: 'Anchored Tooltip & Popover',
      category: 'Overlays',
      icon: <HelpCircle className="w-4 h-4" />,
      description:
        'Hover and keyboard focus tooltips linked via aria-describedby with escape dismissal and collision detection.',
      wcagCriteria: [
        'WCAG 1.4.13 Content on Hover or Focus (Dismissible via Escape, Hoverable without closing, Persistent until blur)',
        'WCAG 1.3.1 Info and Relationships (Connected via dynamic aria-describedby reference)',
      ],
      keyboardShortcuts: [
        { key: 'Tab', action: 'Focusing trigger element displays tooltip' },
        { key: 'Escape', action: 'Dismiss tooltip without losing focus on trigger element' },
      ],
      codeSnippet: `import { Tooltip, Popover } from 'accessible-ui'

export function HelpButton() {
  return (
    <Tooltip content="Calculated 99th percentile response time" placement="top">
      <button>P99 Latency</button>
    </Tooltip>
  )
}`,
    },
    form: {
      id: 'form',
      title: 'Accessible Form Controls',
      category: 'Data Entry',
      icon: <ToggleLeft className="w-4 h-4" />,
      description:
        'Accessible form fields with error messaging associations (aria-invalid, aria-errormessage) and WAI-ARIA APG Switch pattern.',
      wcagCriteria: [
        'WCAG 3.3.1 Error Identification & 3.3.2 Labels or Instructions (aria-errormessage, aria-invalid)',
        'WCAG 4.1.2 Name, Role, Value (role="switch", aria-checked="true|false", space/enter toggle)',
        'WCAG 2.4.7 Focus Visible (High contrast dual-ring focus outline)',
      ],
      keyboardShortcuts: [
        { key: 'Space / Enter', action: 'Toggle switch state' },
        { key: 'Tab', action: 'Traverse form field inputs' },
      ],
      codeSnippet: `import { FormField, Input, Switch } from 'accessible-ui'

export function SecurityForm() {
  return (
    <div className="space-y-4">
      <FormField label="Work Email" error={error}>
        {(props) => <Input {...props} type="email" placeholder="alex@company.com" />}
      </FormField>
      <Switch
        label="Two-Factor Authentication"
        description="Enforce WebAuthn passkey verification on session refresh."
        checked={twoFactor}
        onChange={setTwoFactor}
      />
    </div>
  )
}`,
    },
  }

  const currentMeta = catalog[activeComponent]

  // Command palette items
  const commandItems: CommandItem[] = [
    {
      id: 'switch-grid',
      label: 'Switch to Virtualized Data Grid',
      category: 'Navigation',
      icon: <Table className="w-4 h-4" />,
      onSelect: () => setActiveComponent('datagrid'),
    },
    {
      id: 'switch-dialog',
      label: 'Switch to Modal & Drawer',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4" />,
      onSelect: () => setActiveComponent('dialog'),
    },
    {
      id: 'switch-combobox',
      label: 'Switch to Multi-Select Combobox',
      category: 'Navigation',
      icon: <ListFilter className="w-4 h-4" />,
      onSelect: () => setActiveComponent('combobox'),
    },
    {
      id: 'switch-calendar',
      label: 'Switch to Date-Range Calendar',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4" />,
      onSelect: () => setActiveComponent('calendar'),
    },
    {
      id: 'switch-toast',
      label: 'Switch to Toast Notification System',
      category: 'Navigation',
      icon: <BellRing className="w-4 h-4" />,
      onSelect: () => setActiveComponent('toast'),
    },
    {
      id: 'toggle-theme',
      label: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Appearance',
      shortcut: 'Theme',
      onSelect: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    },
    {
      id: 'run-toast-success',
      label: 'Simulate Success Notification',
      category: 'Actions',
      onSelect: () => toast({ title: 'Operation Finished', description: 'Changes persisted to storage.', variant: 'success' }),
    },
    {
      id: 'run-toast-error',
      label: 'Simulate Error Notification',
      category: 'Actions',
      onSelect: () => toast({ title: 'Connection Refused', description: 'Network endpoint unreachable.', variant: 'error' }),
    },
  ]

  const triggerValidation = () => {
    if (!formEmail.includes('@')) {
      setFormError('Please enter a valid work email address (e.g. name@domain.com).')
      toast({ title: 'Validation Warning', description: 'Invalid email format.', variant: 'warning' })
    } else {
      setFormError('')
      toast({ title: 'Form Validated', description: 'Email address confirmed.', variant: 'success' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Accessible UI</h1>
            <p className="text-xs text-[var(--text-muted)]">Enterprise Design System & A11y Workbench</p>
          </div>
          <span className="ml-3 hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>WCAG 2.1 AA Compliant</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Cmd+K Search Button */}
          <button
            type="button"
            onClick={() => setIsCmdKOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-raised)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors focus-visible:outline-none"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Command Palette</span>
            <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--bg-surface-active)] border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Component Navigation */}
        <aside className="w-64 border-r border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 flex flex-col gap-1 overflow-y-auto shrink-0">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Component Catalog
          </div>
          {Object.values(catalog).map((item) => {
            const isActive = item.id === activeComponent
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveComponent(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[var(--accent-contrast)]' : 'text-[var(--text-muted)]'}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>
                {isActive && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            )
          })}

          <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] px-2">
            <div className="p-3 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Zero VPS Architecture</span>
              </div>
              Runs 100% in-browser with automated axe-core accessibility unit tests.
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-app)] p-6 lg:p-8">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            {/* Header info for selected component */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-strong)]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-1">
                  <span>{currentMeta.category}</span>
                  <span>•</span>
                  <span>WAI-ARIA APG</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{currentMeta.title}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">{currentMeta.description}</p>
              </div>

              {/* Sub-panel Selector */}
              <div className="flex rounded-xl bg-[var(--bg-surface)] p-1 border border-[var(--border-subtle)] self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'preview'
                      ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Interactive Playground
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('a11y')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'a11y'
                      ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  A11y Audit & Keyboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'code'
                      ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Code Snippet
                </button>
              </div>
            </div>

            {/* Tab: Interactive Preview */}
            {activeTab === 'preview' && (
              <div className="p-6 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-lg min-h-[420px] flex flex-col justify-center">
                {activeComponent === 'datagrid' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-[var(--text-secondary)]">
                        Rendering <span className="font-semibold text-[var(--text-primary)]">1,500</span> virtualized
                        nodes at 60 FPS. Click headers to sort, use Arrow keys to navigate cells.
                      </div>
                      {selectedServer && (
                        <div className="text-xs font-mono text-[var(--accent-primary)] bg-[var(--bg-surface-raised)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                          Selected: {selectedServer.name} ({selectedServer.uptime} uptime)
                        </div>
                      )}
                    </div>
                    <DataGrid
                      data={sampleServers}
                      columns={serverColumns}
                      height={380}
                      ariaLabel="Production Cluster Nodes"
                      onRowClick={(server) => {
                        setSelectedServer(server)
                        toast({
                          title: `Inspecting ${server.name}`,
                          description: `P99 Latency: ${server.p99Latency}ms in ${server.region}`,
                          variant: 'info',
                          duration: 3000,
                        })
                      }}
                    />
                  </div>
                )}

                {activeComponent === 'dialog' && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                      Trigger modal or side drawer to inspect focus trapping, background scroll locking, and Escape key
                      dismissal.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-semibold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none"
                      >
                        Launch Accessible Modal
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="px-5 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--bg-surface-active)] transition-colors focus-visible:outline-none"
                      >
                        Open Navigation Drawer
                      </button>
                    </div>

                    <Modal
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      title="Database Cluster Maintenance"
                      description="Schedule failover switch for primary postgres shard"
                    >
                      <div className="space-y-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                          Initiating a manual failover will promote replica node <code>db-replica-02</code>. The cluster
                          will experience approximately 120ms of read-only state.
                        </p>
                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-raised)]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsModalOpen(false)
                              toast({ title: 'Maintenance Initiated', variant: 'success' })
                            }}
                            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-semibold"
                          >
                            Confirm Shard Promotion
                          </button>
                        </div>
                      </div>
                    </Modal>

                    <Drawer
                      isOpen={isDrawerOpen}
                      onClose={() => setIsDrawerOpen(false)}
                      title="Workspace Navigation"
                      description="Direct access to core infrastructure"
                    >
                      <div className="space-y-2">
                        {['Service Telemetry', 'API Gateway Policies', 'Audit Logs', 'Billing & Quotas'].map((item) => (
                          <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={(e) => {
                              e.preventDefault()
                              setIsDrawerOpen(false)
                              toast({ title: `Navigated to ${item}`, variant: 'info' })
                            }}
                            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    </Drawer>
                  </div>
                )}

                {activeComponent === 'command' && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                      Press <kbd className="font-mono px-2 py-1 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">⌘K</kbd> or click the button below to launch the command palette.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCmdKOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      Open Command Palette
                    </button>
                  </div>
                )}

                {activeComponent === 'combobox' && (
                  <div className="max-w-lg mx-auto w-full py-8 space-y-4">
                    <Combobox
                      options={technologyOptions}
                      value={selectedTech}
                      onChange={setSelectedTech}
                      label="Engineering Technologies"
                      hint="Select frameworks and tooling for stack evaluation"
                      placeholder="Search technologies..."
                    />
                    <div className="text-xs text-[var(--text-muted)]">
                      Active tags: <span className="text-[var(--text-primary)] font-mono">{selectedTech.join(', ')}</span>
                    </div>
                  </div>
                )}

                {activeComponent === 'calendar' && (
                  <div className="max-w-md mx-auto w-full py-6 space-y-4">
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      label="Telemetry Time Window"
                    />
                    <div className="text-xs text-[var(--text-muted)] text-center">
                      Use Arrow keys, Home, End, PageUp, and PageDown inside calendar grid for keyboard selection.
                    </div>
                  </div>
                )}

                {activeComponent === 'toast' && (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                      Trigger accessible screen-reader polite and assertive notifications with auto-pause countdowns.
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: 'Deployment Verified',
                            description: 'All edge nodes serving version 2.4.0.',
                            variant: 'success',
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-[var(--status-success)]/40 bg-[var(--status-success)]/10 text-[var(--status-success)] text-xs font-semibold hover:bg-[var(--status-success)]/20"
                      >
                        Success (Polite)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: 'Network Timeout',
                            description: 'Ingress controller 504 Gateway Timeout.',
                            variant: 'error',
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-[var(--status-error)]/40 bg-[var(--status-error)]/10 text-[var(--status-error)] text-xs font-semibold hover:bg-[var(--status-error)]/20"
                      >
                        Alert (Assertive)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: 'Memory Utilization Warning',
                            description: 'Pod node-04 reached 88% threshold.',
                            variant: 'warning',
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-[var(--status-warning)]/40 bg-[var(--status-warning)]/10 text-[var(--status-warning)] text-xs font-semibold hover:bg-[var(--status-warning)]/20"
                      >
                        Warning (Polite)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: 'Cluster Autoscaled',
                            description: 'Added 2 worker nodes to pool.',
                            variant: 'info',
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-[var(--status-info)]/40 bg-[var(--status-info)]/10 text-[var(--status-info)] text-xs font-semibold hover:bg-[var(--status-info)]/20"
                      >
                        Info (Polite)
                      </button>
                    </div>
                  </div>
                )}

                {activeComponent === 'tabs' && (
                  <div className="w-full max-w-2xl mx-auto py-6">
                    <Tabs
                      ariaLabel="Server Metrics Views"
                      items={[
                        {
                          id: 'overview',
                          label: 'Overview',
                          content: (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Cluster Overview</h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                48 nodes online across 5 global regions with 99.99% availability over the last 90 days.
                              </p>
                            </div>
                          ),
                        },
                        {
                          id: 'performance',
                          label: 'Performance',
                          badge: '99.4%',
                          content: (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Latency Distribution</h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                Average round-trip time: 14ms. P99 latency: 32ms. Zero dropped socket connections.
                              </p>
                            </div>
                          ),
                        },
                        {
                          id: 'audit',
                          label: 'Audit Log',
                          content: (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Security Events</h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                No unauthorized privilege escalations recorded. 1,420 token validations processed.
                              </p>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                )}

                {activeComponent === 'tooltip' && (
                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                      Hover or keyboard focus (<kbd className="font-mono px-1 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">Tab</kbd>) triggers the tooltip. Press <kbd className="font-mono px-1 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">Escape</kbd> to dismiss.
                    </p>
                    <div className="flex items-center gap-6">
                      <Tooltip content="Calculates 99th percentile across 10,000 samples" placement="top">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-raised)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-focus)] focus-visible:outline-none"
                        >
                          P99 Latency Info
                        </button>
                      </Tooltip>

                      <Popover
                        title="Database Sharding Config"
                        trigger={
                          <span className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-semibold">
                            Open Settings Popover
                          </span>
                        }
                      >
                        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                          Consistent hashing ring distributed over 256 virtual vnodes with virtual replica weighting.
                        </p>
                      </Popover>
                    </div>
                  </div>
                )}

                {activeComponent === 'form' && (
                  <div className="max-w-md mx-auto w-full py-6 space-y-6">
                    <FormField
                      label="Engineering Work Email"
                      error={formError}
                      hint="Required for two-factor recovery notifications."
                      required
                    >
                      {(props) => (
                        <div className="flex gap-2">
                          <Input
                            {...props}
                            type="email"
                            placeholder="staff-engineer@org.com"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={triggerValidation}
                            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-semibold shrink-0"
                          >
                            Validate
                          </button>
                        </div>
                      )}
                    </FormField>

                    <div className="pt-4 border-t border-[var(--border-subtle)]">
                      <Switch
                        label="Strict WebAuthn Verification"
                        description="Enforce hardware security key challenge on remote actions."
                        checked={switchState}
                        onChange={setSwitchState}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: A11y Audit & Keyboard Specs */}
            {activeTab === 'a11y' && (
              <div className="space-y-6">
                {/* WCAG Compliance Badges */}
                <div className="p-6 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--status-success)]" />
                    <span>WCAG 2.1 AA Compliance Specifications</span>
                  </h3>
                  <div className="space-y-2.5">
                    {currentMeta.wcagCriteria.map((criterion, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface-raised)]/50 border border-[var(--border-subtle)] text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[var(--status-success)] shrink-0 mt-0.5" />
                        <span className="text-[var(--text-primary)] leading-relaxed">{criterion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keyboard Shortcuts Matrix */}
                <div className="p-6 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Keyboard Interaction Matrix (WAI-ARIA APG)
                  </h3>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {currentMeta.keyboardShortcuts.map((shortcut, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <kbd className="font-mono px-2.5 py-1 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] font-semibold">
                          {shortcut.key}
                        </kbd>
                        <span className="text-[var(--text-secondary)]">{shortcut.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Code Snippet */}
            {activeTab === 'code' && (
              <div className="relative rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface-raised)] border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {currentMeta.id}.example.tsx
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(currentMeta.codeSnippet)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-surface-active)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--accent-contrast)] transition-colors focus-visible:outline-none"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <pre className="p-6 text-xs font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
                  <code>{currentMeta.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} items={commandItems} />
    </div>
  )
}
