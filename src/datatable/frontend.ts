import type { Column, DataTableState } from '../core/types'
import { getComparator, matchesFilter, isSearchable } from './columns'

/** Pipeline: filter → sort → paginate. Returns the rows for the current page. */
export function processFrontendData(
  allData: Record<string, any>[],
  columns: Column[],
  state: DataTableState,
  searchableColumnKeys?: string[]
): { pageRows: Record<string, any>[]; filteredTotal: number } {
  let filtered = allData

  // -- Global search filter --
  if (state.globalSearch) {
    const searchCols = columns.filter(col => {
      if (searchableColumnKeys && searchableColumnKeys.length > 0) {
        return searchableColumnKeys.includes(col.key) && isSearchable(col)
      }
      return isSearchable(col)
    })

    filtered = filtered.filter(row =>
      searchCols.some(col => matchesFilter(col, row, state.globalSearch))
    )
  }

  // -- Column filters --
  const filterKeys = Object.keys(state.columnFilters)
  for (const key of filterKeys) {
    const filterVal = state.columnFilters[key]
    if (!filterVal) continue

    const col = columns.find(c => c.key === key)
    if (!col || !isSearchable(col)) continue

    filtered = filtered.filter(row => matchesFilter(col, row, filterVal))
  }

  const filteredTotal = filtered.length

  // -- Sort --
  if (state.sortBy && state.sortOrder !== 'none') {
    const sortCol = columns.find(c => c.key === state.sortBy)
    if (sortCol) {
      const comparator = getComparator(sortCol)
      if (comparator) {
        const direction = state.sortOrder === 'asc' ? 1 : -1
        filtered = filtered.slice().sort((a, b) => direction * comparator(a, b))
      }
    }
  }

  // -- Paginate --
  const start = (state.currentPage - 1) * state.pageSize
  const pageRows = filtered.slice(start, start + state.pageSize)

  return { pageRows, filteredTotal }
}
