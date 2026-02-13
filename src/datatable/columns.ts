import type { Column, DateColumn } from '../core/types'
import { parseDate, formatDate, escapeHtml } from '../core/utils'

/** Get the sortable comparator for a column */
export function getComparator(column: Column): ((a: Record<string, any>, b: Record<string, any>) => number) | null {
  if (!column.sortable) return null

  switch (column.type) {
    case 'string':
      return (a, b) => {
        const va = String(a[column.key] ?? '')
        const vb = String(b[column.key] ?? '')
        return va.localeCompare(vb, undefined, { sensitivity: 'base' })
      }

    case 'number':
      return (a, b) => {
        const va = parseFloat(a[column.key]) || 0
        const vb = parseFloat(b[column.key]) || 0
        return va - vb
      }

    case 'date':
      return (a, b) => {
        const da = parseDate(String(a[column.key] ?? ''), column.dateFormat)
        const db = parseDate(String(b[column.key] ?? ''), column.dateFormat)
        const ta = da ? da.getTime() : 0
        const tb = db ? db.getTime() : 0
        return ta - tb
      }

    case 'custom':
      return column.comparator
        ? (a, b) => column.comparator!(a[column.key], b[column.key])
        : null
  }
}

/** Check if a row's column value matches the search/filter string */
export function matchesFilter(column: Column, row: Record<string, any>, filterValue: string): boolean {
  const lowerFilter = filterValue.toLowerCase()

  switch (column.type) {
    case 'string': {
      const val = String(row[column.key] ?? '').toLowerCase()
      return val.indexOf(lowerFilter) !== -1
    }

    case 'number': {
      const val = String(row[column.key] ?? '').toLowerCase()
      return val.indexOf(lowerFilter) !== -1
    }

    case 'date': {
      // Match against the display value (either displayFormat or raw value)
      const raw = String(row[column.key] ?? '')
      const dateCol = column as DateColumn
      if (dateCol.displayFormat) {
        const parsed = parseDate(raw, dateCol.dateFormat)
        if (parsed) {
          const display = formatDate(parsed, dateCol.displayFormat)
          return display.toLowerCase().indexOf(lowerFilter) !== -1
        }
      }
      return raw.toLowerCase().indexOf(lowerFilter) !== -1
    }

    case 'custom':
      return column.filterFn
        ? column.filterFn(row[column.key], filterValue, row)
        : false
  }
}

/** Check if a column is searchable (respects defaults per type) */
export function isSearchable(column: Column): boolean {
  if (column.searchable !== undefined) return column.searchable
  // Default: true for string/number/date, false for custom
  return column.type !== 'custom'
}

/** Get the resolved text alignment for a column */
export function getColumnAlign(column: Column): 'left' | 'center' | 'right' {
  if (column.align) return column.align
  return column.type === 'number' ? 'right' : 'left'
}

/** Format a number with thousand separators */
function formatThousands(value: unknown): string {
  const num = Number(value)
  if (isNaN(num)) return String(value ?? '')
  // Use integer/decimal split to add commas to the integer part only
  const parts = num.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/** Render a cell value as an escaped string (or raw HTML for custom) */
export function renderCellValue(column: Column, row: Record<string, any>, rowIndex: number): string {
  switch (column.type) {
    case 'string':
      return escapeHtml(row[column.key])

    case 'number': {
      if (column.thousandSeparator) {
        return escapeHtml(formatThousands(row[column.key]))
      }
      return escapeHtml(row[column.key])
    }

    case 'date': {
      const raw = String(row[column.key] ?? '')
      if (column.displayFormat) {
        const parsed = parseDate(raw, column.dateFormat)
        if (parsed) return escapeHtml(formatDate(parsed, column.displayFormat))
      }
      return escapeHtml(raw)
    }

    case 'custom':
      // Custom render returns raw HTML — user's responsibility for XSS
      return column.render(row, rowIndex)
  }
}
