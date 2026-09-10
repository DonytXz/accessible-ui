import React, { useState, useRef, useId, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface DateRangePickerProps {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange) => void
  label?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isBetween(target: Date, start: Date, end: Date): boolean {
  return target.getTime() > start.getTime() && target.getTime() < end.getTime()
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value: valueProp,
  defaultValue = { start: null, end: null },
  onChange,
  label = 'Date Range',
  minDate,
  maxDate,
  className,
}) => {
  const [uncontrolledRange, setUncontrolledRange] = useState<DateRange>(defaultValue)
  const isControlled = valueProp !== undefined
  const range = isControlled ? valueProp : uncontrolledRange

  const [viewDate, setViewDate] = useState<Date>(() => range.start || new Date())
  const [focusedDate, setFocusedDate] = useState<Date>(() => range.start || new Date())
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const pickerId = useId()
  const gridId = useId()

  const setRange = (newRange: DateRange) => {
    if (!isControlled) {
      setUncontrolledRange(newRange)
    }
    onChange?.(newRange)
  }

  // Days of week header (Sun - Sat)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Calendar grid calculations
  const monthData = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const startingDayOfWeek = firstDayOfMonth.getDay()

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = []

    // Pad empty days at start
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    // Split into weeks (rows)
    const weeks: (Date | null)[][] = []
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7)
      while (week.length < 7) week.push(null)
      weeks.push(week)
    }

    return { year, month, weeks }
  }, [viewDate])

  const handleSelectDate = (date: Date) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: date, end: null })
    } else {
      if (date.getTime() < range.start.getTime()) {
        setRange({ start: date, end: range.start })
      } else {
        setRange({ start: range.start, end: date })
      }
    }
  }

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Keyboard navigation for WAI-ARIA APG Calendar Grid
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const next = new Date(focusedDate)

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        next.setDate(next.getDate() - 1)
        break
      case 'ArrowRight':
        e.preventDefault()
        next.setDate(next.getDate() + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        next.setDate(next.getDate() - 7)
        break
      case 'ArrowDown':
        e.preventDefault()
        next.setDate(next.getDate() + 7)
        break
      case 'PageUp':
        e.preventDefault()
        next.setMonth(next.getMonth() - 1)
        break
      case 'PageDown':
        e.preventDefault()
        next.setMonth(next.getMonth() + 1)
        break
      case 'Home':
        e.preventDefault()
        next.setDate(next.getDate() - next.getDay())
        break
      case 'End':
        e.preventDefault()
        next.setDate(next.getDate() + (6 - next.getDay()))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        handleSelectDate(focusedDate)
        return
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        return
      default:
        return
    }

    setFocusedDate(next)
    if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(next)
    }
  }

  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const formattedDisplay = useMemo(() => {
    if (range.start && range.end) {
      return `${dateFormatter.format(range.start)} - ${dateFormatter.format(range.end)}`
    }
    if (range.start) {
      return `${dateFormatter.format(range.start)} - Select end date`
    }
    return 'Select date range'
  }, [range, dateFormatter])

  return (
    <div ref={containerRef} className={cn('relative w-full text-left', className)}>
      <label id={`${pickerId}-label`} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        id={pickerId}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={`${pickerId}-label ${pickerId}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 text-sm text-[var(--text-primary)] hover:border-[var(--border-focus)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
      >
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>{formattedDisplay}</span>
        </div>
      </button>

      {/* Calendar Popup Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="absolute z-50 mt-2 p-4 w-80 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xl transition-all"
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {monthFormatter.format(viewDate)}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Table Grid */}
          <table
            id={gridId}
            role="grid"
            aria-label={monthFormatter.format(viewDate)}
            onKeyDown={handleGridKeyDown}
            tabIndex={0}
            className="w-full border-collapse outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] rounded-lg"
          >
            <thead>
              <tr role="row">
                {weekDays.map((d) => (
                  <th
                    key={d}
                    role="columnheader"
                    aria-label={d}
                    className="h-8 text-xs font-medium text-[var(--text-muted)] text-center"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthData.weeks.map((week, wIdx) => (
                <tr key={wIdx} role="row">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <td key={dIdx} role="gridcell" className="h-9 p-0" />
                    }

                    const isStart = range.start && isSameDay(day, range.start)
                    const isEnd = range.end && isSameDay(day, range.end)
                    const isInRange = range.start && range.end && isBetween(day, range.start, range.end)
                    const isFocused = isSameDay(day, focusedDate)

                    const isDisabled =
                      (minDate && day.getTime() < minDate.getTime()) ||
                      (maxDate && day.getTime() > maxDate.getTime())

                    return (
                      <td
                        key={dIdx}
                        role="gridcell"
                        aria-selected={Boolean(isStart || isEnd || isInRange)}
                        className="h-9 p-0 text-center"
                      >
                        <button
                          type="button"
                          tabIndex={isFocused ? 0 : -1}
                          disabled={Boolean(isDisabled)}
                          onClick={() => handleSelectDate(day)}
                          aria-label={day.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          className={cn(
                            'w-8 h-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all',
                            isStart || isEnd
                              ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-bold'
                              : isInRange
                              ? 'bg-[var(--bg-surface-active)] text-[var(--accent-primary)] rounded-none'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]',
                            isFocused && 'ring-2 ring-[var(--border-focus)] ring-offset-1 ring-offset-[var(--bg-surface)]',
                            isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                          )}
                        >
                          {day.getDate()}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
