---
description: "Every TypeScript type exported by mundane-ui. Import them for type safety — or just use this page as a reference."
---

# Type Definitions

All types are exported from the package. Use them for type safety in TypeScript projects:

```ts
import type {
  DataTableConfig,
  FrontendConfig,
  BackendConfig,
  Column,
  StringColumn,
  NumberColumn,
  DateColumn,
  CustomColumn,
  SearchConfig,
  ClassOverrides,
  DataTableState,
  DataTableAPI,
  SortOrder,
  ColumnType,
} from 'mundane-ui'
```

## Primitive Types

### ColumnType

The four column types the table understands.

```ts
type ColumnType = 'string' | 'number' | 'date' | 'custom'
```

### SortOrder

Three-state sort cycle: `none` → `asc` → `desc` → `none`.

```ts
type SortOrder = 'asc' | 'desc' | 'none'
```

## Column Types

### BaseColumn

Shared properties across all column types.

```ts
interface BaseColumn {
  key: string                                    // data field key
  label: string                                  // header display text
  sortable?: boolean                             // default: false
  searchable?: boolean                           // default: true (false for custom)
  width?: string                                 // CSS value, e.g. '200px', '20%'
  align?: 'left' | 'center' | 'right'           // default: 'left' ('right' for number)
}
```

### StringColumn

Plain text. No extra options.

```ts
interface StringColumn extends BaseColumn {
  type: 'string'
}
```

### NumberColumn

Numeric data with optional formatting.

```ts
interface NumberColumn extends BaseColumn {
  type: 'number'
  thousandSeparator?: boolean                    // default: false — display as 1,000
}
```

### DateColumn

Dates with configurable parse and display formats.

```ts
interface DateColumn extends BaseColumn {
  type: 'date'
  dateFormat: string                             // parse format, e.g. 'YYYY-MM-DD'
  displayFormat?: string                         // display format, e.g. 'DD/MM/YYYY'
}
```

**Format tokens:** `YYYY` (4-digit year), `MM` (2-digit month), `DD` (2-digit day), `HH` (24-hour), `mm` (minutes), `ss` (seconds).

### CustomColumn

Full control over rendering, sorting, and filtering.

```ts
interface CustomColumn extends BaseColumn {
  type: 'custom'
  render: (row: Record<string, any>, rowIndex: number) => string
  comparator?: (a: any, b: any) => number
  filterFn?: (cellValue: any, filterValue: string, row: Record<string, any>) => boolean
}
```

### Column (union)

```ts
type Column = StringColumn | NumberColumn | DateColumn | CustomColumn
```

## Config Types

### DataTableConfig

The top-level config type — a discriminated union on `mode`.

```ts
type DataTableConfig = FrontendConfig | BackendConfig
```

### FrontendConfig

```ts
interface FrontendConfig {
  mode: 'frontend'
  el: string | HTMLElement
  data: Record<string, any>[]
  columns: Column[]
  pageSize?: number                              // default: 10
  pageSizeOptions?: number[]                     // default: [10, 25, 50, 100]
  search?: SearchConfig
  classes?: ClassOverrides
  showInfo?: boolean                             // default: true
  showPageSize?: boolean                         // default: true
  emptyText?: string                             // default: 'No data available'
  loadingText?: string                           // default: 'Loading...'
}
```

### BackendConfig

```ts
interface BackendConfig {
  mode: 'backend'
  el: string | HTMLElement
  data: Record<string, any>[]
  columns: Column[]
  totalRows: number
  onStateChange: (queryString: string, state: DataTableState) => void
  pageSize?: number                              // default: 10
  pageSizeOptions?: number[]                     // default: [10, 25, 50, 100]
  search?: SearchConfig
  classes?: ClassOverrides
  showInfo?: boolean                             // default: true
  showPageSize?: boolean                         // default: true
  emptyText?: string                             // default: 'No data available'
  loadingText?: string                           // default: 'Loading...'
}
```

### SearchConfig

```ts
interface SearchConfig {
  enabled?: boolean                              // default: true
  mode?: 'global' | 'column' | 'both'           // default: 'global'
  debounce?: number                              // default: 300 (ms)
  placeholder?: string                           // default: 'Search...'
  searchableColumns?: string[]                   // default: all searchable columns
}
```

## ClassOverrides {#classoverrides}

Pass CSS classes (Tailwind, custom, whatever) to any element. Every key maps to a specific DOM element.

```ts
interface ClassOverrides {
  root?: string              // .mu-datatable — outermost wrapper
  toolbar?: string           // .mu-datatable__toolbar — search + page size bar
  searchInput?: string       // .mu-datatable__search-input
  pageSizeSelect?: string    // .mu-datatable__page-size-select
  table?: string             // .mu-datatable__table — the <table>
  header?: string            // .mu-datatable__header — <thead>
  headerRow?: string         // .mu-datatable__header-row — <tr> in thead
  headerCell?: string        // .mu-datatable__header-cell — <th>
  headerCellActive?: string  // active sort column
  body?: string              // .mu-datatable__body — <tbody>
  row?: string               // .mu-datatable__row — <tr> in tbody
  rowEven?: string           // .mu-datatable__row--even
  rowHover?: string          // hovered row
  cell?: string              // .mu-datatable__cell — <td>
  pagination?: string        // .mu-datatable__pagination
  pageButton?: string        // .mu-datatable__page-btn
  pageButtonActive?: string  // .mu-datatable__page-btn--active
  loading?: string           // .mu-datatable__loading overlay
  empty?: string             // .mu-datatable__empty state
  columnFilter?: string      // .mu-datatable__column-filter inputs
  info?: string              // .mu-datatable__info — "Showing X-Y of Z"
}
```

## State Type

### DataTableState {#datatablestate}

The internal state of the table. Returned by `getState()` and passed as the second argument to `onStateChange`.

```ts
interface DataTableState {
  currentPage: number                            // 1-based
  pageSize: number
  sortBy: string | null                          // column key, or null if unsorted
  sortOrder: SortOrder                           // 'asc' | 'desc' | 'none'
  globalSearch: string
  columnFilters: Record<string, string>          // { columnKey: filterValue }
  totalRows: number
  totalPages: number                             // computed from totalRows / pageSize
}
```

## API Type

### DataTableAPI

The public interface of a DataTable instance. This is what `DataTable.create()` returns.

```ts
interface DataTableAPI {
  setData(data: Record<string, any>[], totalRows?: number): void
  addRow(row: Record<string, any>, index?: number): void
  updateRow(index: number, row: Record<string, any>): void
  removeRow(index: number): void
  goToPage(page: number): void
  setPageSize(size: number): void
  setSearch(value: string): void
  setColumnFilter(column: string, value: string): void
  clearFilters(): void
  setLoading(loading: boolean): void
  setColumns(columns: Column[]): void
  getState(): DataTableState
  getQueryString(): string
  refresh(): void
  destroy(): void
}
```
