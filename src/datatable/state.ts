import type { DataTableState, DataTableConfig, SortOrder } from '../core/types'

/** Create the initial state from config */
export function createState(config: DataTableConfig): DataTableState {
  const pageSize = config.pageSize ?? 10
  const totalRows = config.mode === 'backend' ? config.totalRows : config.data.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  return {
    currentPage: 1,
    pageSize,
    sortBy: null,
    sortOrder: 'none',
    globalSearch: '',
    columnFilters: {},
    totalRows,
    totalPages,
  }
}

/** Recalculate totalPages from totalRows and pageSize */
export function recalcPages(state: DataTableState): void {
  state.totalPages = Math.max(1, Math.ceil(state.totalRows / state.pageSize))
  // Clamp current page
  if (state.currentPage > state.totalPages) {
    state.currentPage = state.totalPages
  }
  if (state.currentPage < 1) {
    state.currentPage = 1
  }
}

/** Cycle sort order: none → asc → desc → none */
export function cycleSortOrder(current: SortOrder): SortOrder {
  switch (current) {
    case 'none': return 'asc'
    case 'asc': return 'desc'
    case 'desc': return 'none'
  }
}
