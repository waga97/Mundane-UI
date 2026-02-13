---
description: "Full configuration reference for DataTable.create(). Every option, every type, every default value — with copy-paste examples."
---

# Configuration Reference

Everything you pass to `DataTable.create(config)`. This is the single source of truth.

## Quick Reference

```js
import { DataTable } from 'mundane-ui'

const table = DataTable.create({
  // Required
  el: '#my-table',           // where to mount
  mode: 'frontend',          // or 'backend'
  data: [...],               // your rows
  columns: [...],            // column definitions

  // Optional (these are the defaults)
  pageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  search: { enabled: true, mode: 'global', debounce: 300 },
  showInfo: true,
  showPageSize: true,
  emptyText: 'No data available',
  loadingText: 'Loading...',
  classes: {},
})
```

## Base Options

Shared by both `frontend` and `backend` modes.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | **required** | CSS selector or DOM element to mount into |
| `columns` | `Column[]` | **required** | Column definitions (see below) |
| `pageSize` | `number` | `10` | Rows per page |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Options in the page size dropdown |
| `search` | `SearchConfig` | see below | Search/filter configuration |
| `classes` | `ClassOverrides` | `{}` | CSS class overrides for any element |
| `showInfo` | `boolean` | `true` | Show "Showing X–Y of Z" info text |
| `showPageSize` | `boolean` | `true` | Show the page size dropdown |
| `emptyText` | `string` | `'No data available'` | Text shown when there are zero rows |
| `loadingText` | `string` | `'Loading...'` | Text in the loading overlay |

## Frontend Mode

Client-side sorting, filtering, and pagination. Give it all your data.

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'frontend',
  data: [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ],
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'age', label: 'Age', type: 'number', sortable: true },
  ],
})
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `mode` | `'frontend'` | yes | Enables client-side data processing |
| `data` | `Record<string, any>[]` | yes | The complete dataset — all rows |

## Backend Mode

The table doesn't touch your data. It emits query strings, you fetch.

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'backend',
  data: firstPageData,
  totalRows: 5000,
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true },
  ],
  onStateChange: async (queryString, state) => {
    const res = await fetch('/api/users' + queryString)
    const { data, total } = await res.json()
    table.setData(data, total)
  },
})
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `mode` | `'backend'` | yes | Enables server-side data processing |
| `data` | `Record<string, any>[]` | yes | Current page of data |
| `totalRows` | `number` | yes | Total count across all pages (for pagination math) |
| `onStateChange` | `(queryString: string, state: DataTableState) => void` | yes | Fires on every user interaction (sort, search, page change) |

The `queryString` looks like: `?page=2&pageSize=10&sortBy=name&sortOrder=asc&search=john`

Column filters use bracket notation: `?filter[name]=john&filter[status]=active`

## SearchConfig

Controls the search bar(s) above and within the table.

```js
search: {
  enabled: true,                    // show search UI (default: true)
  mode: 'global',                   // 'global' | 'column' | 'both'
  debounce: 300,                    // ms delay before filtering fires
  placeholder: 'Search...',         // placeholder text
  searchableColumns: ['name'],      // limit which columns are searched
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether to show search UI at all |
| `mode` | `'global' \| 'column' \| 'both'` | `'global'` | Search mode (see [Frontend Mode](/guide/frontend-mode#search-modes)) |
| `debounce` | `number` | `300` | Milliseconds to wait before applying the filter |
| `placeholder` | `string` | `'Search...'` | Placeholder text for the global search input |
| `searchableColumns` | `string[]` | all searchable columns | Limit global search to specific column keys |

## Column Definitions

Every column needs `key`, `label`, and `type`. Everything else is optional.

### Common Options (all types)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string` | **required** | The property name in your data objects |
| `label` | `string` | **required** | What shows in the column header |
| `type` | `'string' \| 'number' \| 'date' \| 'custom'` | **required** | Determines sorting, filtering, and rendering behavior |
| `sortable` | `boolean` | `false` | Can the user sort by this column? |
| `searchable` | `boolean` | `true` (`false` for custom) | Is this column included in search/filter? |
| `width` | `string` | `auto` | CSS width value (e.g. `'200px'`, `'20%'`) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` (`'right'` for number) | Text alignment for header and cells |

### String Column

The simplest type. No extra options.

```js
{ key: 'name', label: 'Name', type: 'string', sortable: true }
```

### Number Column

```js
{ key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true }
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `thousandSeparator` | `boolean` | `false` | Display with commas (e.g. `1000` → `1,000`) |

### Date Column

```js
{ key: 'created', label: 'Created', type: 'date', dateFormat: 'YYYY-MM-DD', displayFormat: 'DD/MM/YYYY' }
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dateFormat` | `string` | **required** | How to parse the raw value. Tokens: `YYYY`, `MM`, `DD`, `HH`, `mm`, `ss` |
| `displayFormat` | `string` | raw value | How to display the parsed date. Same tokens. |

### Custom Column

Full control. You return the HTML.

```js
{
  key: 'actions',
  label: 'Actions',
  type: 'custom',
  render: (row, index) => `<button onclick="edit(${index})">Edit</button>`,
  comparator: (a, b) => a.priority - b.priority,
  filterFn: (value, filter, row) => row.status.includes(filter),
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `render` | `(row: Record<string, any>, rowIndex: number) => string` | **required** | Returns an HTML string for the cell |
| `comparator` | `(a: any, b: any) => number` | none | Custom sort function (return negative, zero, or positive) |
| `filterFn` | `(cellValue: any, filterValue: string, row: Record<string, any>) => boolean` | none | Custom filter function |

::: warning XSS
The `render` function outputs raw HTML. If you're rendering user-generated content, sanitize it yourself. The table won't escape custom column output — that's your responsibility.
:::

## ClassOverrides

Pass CSS classes (including Tailwind utilities) to any element in the table. This is how you style without fighting the library.

```js
classes: {
  table: 'w-full',
  headerCell: 'bg-gray-100 font-bold uppercase text-xs',
  row: 'border-b border-gray-200',
  rowEven: 'bg-gray-50',
  cell: 'px-4 py-2',
  pageButton: 'px-3 py-1 rounded',
  pageButtonActive: 'bg-blue-500 text-white',
}
```

Every key maps to a BEM class in the DOM:

| Key | BEM Class | Element |
|-----|-----------|---------|
| `root` | `.mu-datatable` | Outermost wrapper |
| `toolbar` | `.mu-datatable__toolbar` | Search + page size bar |
| `searchInput` | `.mu-datatable__search-input` | Global search input |
| `pageSizeSelect` | `.mu-datatable__page-size-select` | Page size dropdown |
| `table` | `.mu-datatable__table` | The `<table>` element |
| `header` | `.mu-datatable__header` | `<thead>` |
| `headerRow` | `.mu-datatable__header-row` | `<tr>` in thead |
| `headerCell` | `.mu-datatable__header-cell` | `<th>` |
| `headerCellActive` | — | Active sort column header |
| `body` | `.mu-datatable__body` | `<tbody>` |
| `row` | `.mu-datatable__row` | `<tr>` in tbody |
| `rowEven` | `.mu-datatable__row--even` | Even-indexed rows |
| `rowHover` | — | Hovered row |
| `cell` | `.mu-datatable__cell` | `<td>` |
| `pagination` | `.mu-datatable__pagination` | Pagination container |
| `pageButton` | `.mu-datatable__page-btn` | Each page button |
| `pageButtonActive` | `.mu-datatable__page-btn--active` | Current page button |
| `loading` | `.mu-datatable__loading` | Loading overlay |
| `empty` | `.mu-datatable__empty` | Empty state message |
| `columnFilter` | `.mu-datatable__column-filter` | Per-column filter inputs |
| `info` | `.mu-datatable__info` | "Showing X–Y of Z" text |
