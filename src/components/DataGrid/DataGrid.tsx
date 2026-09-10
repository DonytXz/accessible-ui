import React, { useState, useRef, useId, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Column<T> {
  id: string
  header: string
  accessor: (row: T) => React.ReactNode
  width?: number
  sortable?: boolean
}

export interface DataGridProps<T> {
  data: T[]
  columns: Column<T>[]
  rowHeight?: number
  height?: number
  className?: string
  ariaLabel?: string
  onRowClick?: (row: T) => void
}

type SortDirection = 'asc' | 'desc' | null

export function DataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  rowHeight = 44,
  height = 400,
  className,
  ariaLabel = 'Data Grid',
  onRowClick,
}: DataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 })

  const parentRef = useRef<HTMLDivElement | null>(null)
  const gridId = useId()

  // Handle column sorting
  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(colId)
      setSortDirection('asc')
    }
  }

  // Sorted data memo
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data
    const col = columns.find((c) => c.id === sortColumn)
    if (!col) return data

    return [...data].sort((a, b) => {
      const aVal = col.accessor(a)
      const bVal = col.accessor(b)
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, columns, sortColumn, sortDirection])

  // Virtualizer for 60fps rendering of huge datasets
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  })

  // 2D Grid keyboard navigation adhering to WAI-ARIA APG Grid specification
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalRows = sortedData.length
      const totalCols = columns.length

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusedCell((prev) => ({ ...prev, col: Math.min(totalCols - 1, prev.col + 1) }))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedCell((prev) => ({ ...prev, col: Math.max(0, prev.col - 1) }))
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedCell((prev) => ({ ...prev, row: Math.min(totalRows - 1, prev.row + 1) }))
          rowVirtualizer.scrollToIndex(Math.min(totalRows - 1, focusedCell.row + 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedCell((prev) => ({ ...prev, row: Math.max(0, prev.row - 1) }))
          rowVirtualizer.scrollToIndex(Math.max(0, focusedCell.row - 1))
          break
        case 'Home':
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) {
            setFocusedCell({ row: 0, col: 0 })
            rowVirtualizer.scrollToIndex(0)
          } else {
            setFocusedCell((prev) => ({ ...prev, col: 0 }))
          }
          break
        case 'End':
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) {
            setFocusedCell({ row: totalRows - 1, col: totalCols - 1 })
            rowVirtualizer.scrollToIndex(totalRows - 1)
          } else {
            setFocusedCell((prev) => ({ ...prev, col: totalCols - 1 }))
          }
          break
        case 'PageDown':
          e.preventDefault()
          setFocusedCell((prev) => {
            const nextRow = Math.min(totalRows - 1, prev.row + 10)
            rowVirtualizer.scrollToIndex(nextRow)
            return { ...prev, row: nextRow }
          })
          break
        case 'PageUp':
          e.preventDefault()
          setFocusedCell((prev) => {
            const nextRow = Math.max(0, prev.row - 10)
            rowVirtualizer.scrollToIndex(nextRow)
            return { ...prev, row: nextRow }
          })
          break
        case 'Enter':
        case ' ':
          if (onRowClick && sortedData[focusedCell.row]) {
            e.preventDefault()
            onRowClick(sortedData[focusedCell.row])
          }
          break
      }
    },
    [sortedData, columns.length, focusedCell.row, rowVirtualizer, onRowClick]
  )

  return (
    <div
      className={cn(
        'w-full border border-[var(--border-strong)] rounded-xl overflow-hidden bg-[var(--bg-surface)] flex flex-col',
        className
      )}
    >
      <div
        ref={parentRef}
        id={gridId}
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={sortedData.length + 1}
        aria-colcount={columns.length}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        style={{ height: `${height}px` }}
      >
        {/* Sticky Header */}
        <div
          role="rowgroup"
          className="sticky top-0 z-10 bg-[var(--bg-surface-raised)] border-b border-[var(--border-strong)] shadow-xs"
        >
          <div role="row" aria-rowindex={1} className="flex w-full">
            {columns.map((col, cIdx) => {
              const isSortActive = sortColumn === col.id
              const sortState = isSortActive
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : sortDirection === 'desc'
                  ? 'descending'
                  : 'none'
                : col.sortable
                ? 'none'
                : undefined

              return (
                <div
                  key={col.id}
                  role="columnheader"
                  aria-colindex={cIdx + 1}
                  aria-sort={sortState}
                  style={{ width: col.width ? `${col.width}px` : `${100 / columns.length}%` }}
                  onClick={() => col.sortable && handleSort(col.id)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] select-none flex items-center justify-between gap-2',
                    col.sortable && 'cursor-pointer hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]'
                  )}
                >
                  <span className="truncate">{col.header}</span>
                  {col.sortable && (
                    <span className="shrink-0 text-[var(--text-muted)]">
                      {isSortActive && sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      ) : isSortActive && sortDirection === 'desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Virtualized Body */}
        <div
          role="rowgroup"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = sortedData[virtualRow.index]
            const rIdx = virtualRow.index
            const isRowFocused = focusedCell.row === rIdx

            return (
              <div
                key={virtualRow.index}
                role="row"
                aria-rowindex={rIdx + 2}
                onClick={() => {
                  setFocusedCell((prev) => ({ ...prev, row: rIdx }))
                  onRowClick?.(row)
                }}
                className={cn(
                  'flex w-full absolute top-0 left-0 border-b border-[var(--border-subtle)] transition-colors',
                  isRowFocused ? 'bg-[var(--bg-surface-active)]/50' : 'hover:bg-[var(--bg-surface-raised)]/40'
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((col, cIdx) => {
                  const isCellFocused = isRowFocused && focusedCell.col === cIdx

                  return (
                    <div
                      key={col.id}
                      role="gridcell"
                      aria-colindex={cIdx + 1}
                      tabIndex={isCellFocused ? 0 : -1}
                      style={{ width: col.width ? `${col.width}px` : `${100 / columns.length}%` }}
                      className={cn(
                        'px-4 flex items-center text-sm text-[var(--text-primary)] truncate transition-all',
                        isCellFocused && 'ring-2 ring-inset ring-[var(--accent-primary)] bg-[var(--bg-surface-active)]'
                      )}
                    >
                      {col.accessor(row)}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
