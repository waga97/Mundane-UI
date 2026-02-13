// ============================================================
// COLUMN TYPES
// ============================================================

export type ColumnType = 'string' | 'number' | 'date' | 'custom'

export type SortOrder = 'asc' | 'desc' | 'none'

export interface BaseColumn {
  /** Unique key matching the data field */
  key: string
  /** Display label in the header */
  label: string
  /** Whether this column is sortable. Default: false */
  sortable?: boolean
  /** Whether this column is searchable/filterable. Default: true for string/number/date, false for custom */
  searchable?: boolean
  /** Fixed width (e.g. '200px', '20%'). Default: auto */
  width?: string
  /** Text alignment. Default: 'left' for all types except 'number' which defaults to 'right' */
  align?: 'left' | 'center' | 'right'
}

export interface StringColumn extends BaseColumn {
  type: 'string'
}

export interface NumberColumn extends BaseColumn {
  type: 'number'
  /** Enable thousand separator formatting (e.g. 1,000,000). Default: false */
  thousandSeparator?: boolean
}

export interface DateColumn extends BaseColumn {
  type: 'date'
  /** Date format string. Supports: YYYY, MM, DD, HH, mm, ss separated by any delimiter.
   *  Examples: 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM-DD-YYYY HH:mm:ss'
   *  Used for parsing the raw data value into a Date for correct sorting/filtering. */
  dateFormat: string
  /** Optional: display format. If not provided, raw value is shown as-is. */
  displayFormat?: string
}

export interface CustomColumn extends BaseColumn {
  type: 'custom'
  /** Render function that returns an HTML string for the cell content.
   *  Receives the entire row data object. */
  render: (row: Record<string, any>, rowIndex: number) => string
  /** Optional: custom sort comparator. If not provided, column is not sortable even if sortable=true. */
  comparator?: (a: any, b: any) => number
  /** Optional: custom filter function. If not provided, column is not searchable. */
  filterFn?: (cellValue: any, filterValue: string, row: Record<string, any>) => boolean
}

export type Column = StringColumn | NumberColumn | DateColumn | CustomColumn


// ============================================================
// SEARCH / FILTER CONFIG
// ============================================================

export interface SearchConfig {
  /** Enable the global search input. Default: true */
  enabled?: boolean
  /** Search mode. Default: 'global' */
  mode?: 'global' | 'column' | 'both'
  /** Debounce delay in ms for search input. Default: 300 */
  debounce?: number
  /** Placeholder text for global search input. Default: 'Search...' */
  placeholder?: string
  /** For global mode: which column keys to search. Default: all searchable columns */
  searchableColumns?: string[]
}


// ============================================================
// CSS CLASS OVERRIDES (Tailwind-friendly)
// ============================================================

export interface ClassOverrides {
  /** Root container */
  root?: string
  /** Top toolbar (search, page size) */
  toolbar?: string
  /** Global search input */
  searchInput?: string
  /** Page size selector */
  pageSizeSelect?: string
  /** The <table> element */
  table?: string
  /** <thead> */
  header?: string
  /** Header row <tr> */
  headerRow?: string
  /** Header cell <th> */
  headerCell?: string
  /** Active sort header cell */
  headerCellActive?: string
  /** <tbody> */
  body?: string
  /** Body row <tr> */
  row?: string
  /** Alternating row (even) */
  rowEven?: string
  /** Hovered row */
  rowHover?: string
  /** Body cell <td> */
  cell?: string
  /** Pagination container */
  pagination?: string
  /** Pagination button */
  pageButton?: string
  /** Active page button */
  pageButtonActive?: string
  /** Loading overlay */
  loading?: string
  /** Empty state container */
  empty?: string
  /** Column filter input */
  columnFilter?: string
  /** Info text (e.g., "Showing 1-10 of 100") */
  info?: string
}


// ============================================================
// DATATABLE CONFIG
// ============================================================

export interface DataTableBaseConfig {
  /** CSS selector string or HTMLElement to mount the datatable into */
  el: string | HTMLElement
  /** Column definitions */
  columns: Column[]
  /** Rows per page. Default: 10 */
  pageSize?: number
  /** Available page size options. Default: [10, 25, 50, 100] */
  pageSizeOptions?: number[]
  /** Search/filter configuration */
  search?: SearchConfig
  /** CSS class overrides for Tailwind or custom styling */
  classes?: ClassOverrides
  /** Show "Showing X-Y of Z" info text. Default: true */
  showInfo?: boolean
  /** Show page size selector. Default: true */
  showPageSize?: boolean
  /** Text shown when there's no data. Default: 'No data available' */
  emptyText?: string
  /** Loading text. Default: 'Loading...' */
  loadingText?: string
}

export interface FrontendConfig extends DataTableBaseConfig {
  mode: 'frontend'
  /** The complete dataset. All sorting/filtering/pagination happens client-side. */
  data: Record<string, any>[]
}

export interface BackendConfig extends DataTableBaseConfig {
  mode: 'backend'
  /** Current page data from the server. */
  data: Record<string, any>[]
  /** Total number of rows on the server (for pagination calculation). */
  totalRows: number
  /** Callback fired when any state changes (page, sort, filter, pageSize).
   *  Receives the query string parameters to append to your API URL. */
  onStateChange: (queryString: string, state: DataTableState) => void
}

export type DataTableConfig = FrontendConfig | BackendConfig


// ============================================================
// INTERNAL STATE
// ============================================================

export interface DataTableState {
  currentPage: number
  pageSize: number
  sortBy: string | null
  sortOrder: SortOrder
  globalSearch: string
  columnFilters: Record<string, string>
  totalRows: number
  totalPages: number
}


// ============================================================
// PUBLIC API (methods on the DataTable instance)
// ============================================================

export interface DataTableAPI {
  /** Replace the dataset. In backend mode, also updates totalRows. Triggers re-render. */
  setData(data: Record<string, any>[], totalRows?: number): void
  /** Update a specific row by index. Triggers re-render. */
  updateRow(index: number, rowData: Record<string, any>): void
  /** Add a row to the end (or at a specific index). Triggers re-render. */
  addRow(rowData: Record<string, any>, index?: number): void
  /** Remove a row by index. Triggers re-render. */
  removeRow(index: number): void
  /** Change the page size. Triggers re-render. */
  setPageSize(size: number): void
  /** Go to a specific page. Triggers re-render. */
  goToPage(page: number): void
  /** Set the global search value programmatically. Triggers re-render. */
  setSearch(value: string): void
  /** Set a column filter value programmatically. Triggers re-render. */
  setColumnFilter(columnKey: string, value: string): void
  /** Clear all filters and search. Triggers re-render. */
  clearFilters(): void
  /** Show loading state (backend mode). */
  setLoading(loading: boolean): void
  /** Get the current state (page, sort, filters, etc.). */
  getState(): DataTableState
  /** Get the current query string parameters. */
  getQueryString(): string
  /** Update column definitions. Triggers re-render. */
  setColumns(columns: Column[]): void
  /** Destroy the datatable instance, remove all DOM and event listeners. */
  destroy(): void
  /** Re-render the entire table. Usually not needed — called internally. */
  refresh(): void
}
