import { Column } from '@/components/DataGrid/DataGrid'
import { ComboboxOption } from '@/components/Combobox/Combobox'

export interface ServerNode extends Record<string, unknown> {
  id: string
  name: string
  region: string
  status: 'healthy' | 'warning' | 'critical'
  cpu: number
  memory: string
  uptime: string
  p99Latency: number
}

export const sampleServers: ServerNode[] = Array.from({ length: 1500 }, (_, i) => {
  const regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1', 'sa-east-1']
  const statuses: ('healthy' | 'warning' | 'critical')[] = ['healthy', 'healthy', 'healthy', 'warning', 'critical']
  const status = statuses[i % statuses.length]
  const region = regions[i % regions.length]

  return {
    id: `node-${(i + 1).toString().padStart(4, '0')}`,
    name: `k8s-prod-${region.slice(0, 2)}-node-${(i + 1).toString().padStart(3, '0')}`,
    region,
    status,
    cpu: Math.floor(Math.random() * 85) + 10,
    memory: `${(Math.random() * 28 + 4).toFixed(1)} GB`,
    uptime: `${Math.floor(Math.random() * 120) + 1}d`,
    p99Latency: Math.floor(Math.random() * 40) + 4,
  }
})

export const serverColumns: Column<ServerNode>[] = [
  { id: 'name', header: 'Node Name', accessor: (r) => r.name, sortable: true, width: 260 },
  { id: 'region', header: 'Region', accessor: (r) => r.region, sortable: true, width: 140 },
  {
    id: 'status',
    header: 'Health',
    accessor: (r) => {
      const colors = {
        healthy: 'text-[var(--status-success)] bg-[var(--status-success)]/10 border-[var(--status-success)]/30',
        warning: 'text-[var(--status-warning)] bg-[var(--status-warning)]/10 border-[var(--status-warning)]/30',
        critical: 'text-[var(--status-error)] bg-[var(--status-error)]/10 border-[var(--status-error)]/30',
      }
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[r.status]}`}>
          {r.status.toUpperCase()}
        </span>
      )
    },
    sortable: true,
    width: 120,
  },
  { id: 'cpu', header: 'CPU Usage', accessor: (r) => `${r.cpu}%`, sortable: true, width: 120 },
  { id: 'memory', header: 'Memory Used', accessor: (r) => r.memory, sortable: true, width: 130 },
  { id: 'p99Latency', header: 'P99 Latency', accessor: (r) => `${r.p99Latency}ms`, sortable: true, width: 130 },
  { id: 'uptime', header: 'Uptime', accessor: (r) => r.uptime, sortable: true, width: 110 },
]

export const technologyOptions: ComboboxOption[] = [
  { value: 'react', label: 'React 19', description: 'Modern UI library with Concurrent Mode' },
  { value: 'typescript', label: 'TypeScript 5.8', description: 'Strict static type system for JS' },
  { value: 'tailwind', label: 'Tailwind CSS v4', description: 'Utility-first CSS engine' },
  { value: 'vitest', label: 'Vitest 3', description: 'Next-gen blazing fast unit testing' },
  { value: 'axecore', label: 'axe-core 4.13', description: 'Automated WCAG accessibility rules engine' },
  { value: 'tanstack', label: 'TanStack Virtual', description: 'Headless 60 FPS DOM windowing' },
  { value: 'storybook', label: 'Storybook 8', description: 'Isolated component development workbench' },
]
