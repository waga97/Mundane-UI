import type { DataTableState } from './types'

/** Build a query string from the current datatable state */
export function buildQueryString(state: DataTableState): string {
  const params: string[] = []

  params.push('page=' + encodeURIComponent(state.currentPage.toString()))
  params.push('pageSize=' + encodeURIComponent(state.pageSize.toString()))

  if (state.sortBy) {
    params.push('sortBy=' + encodeURIComponent(state.sortBy))
    params.push('sortOrder=' + encodeURIComponent(state.sortOrder))
  }

  if (state.globalSearch) {
    params.push('search=' + encodeURIComponent(state.globalSearch))
  }

  const filterKeys = Object.keys(state.columnFilters)
  for (const key of filterKeys) {
    const val = state.columnFilters[key]
    if (val) {
      params.push('filter[' + encodeURIComponent(key) + ']=' + encodeURIComponent(val))
    }
  }

  return '?' + params.join('&')
}
