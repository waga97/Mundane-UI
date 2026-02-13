<p align="center">
  <img src="mundane-logo.png" alt="Mundane UI" width="120" />
</p>

<h1 align="center">Mundane UI</h1>

<p align="center">
  <strong>The boring UI library.</strong><br>
  Framework-agnostic, zero-dependency, lightweight UI component library.<br>
  Written in TypeScript, works everywhere — React, Vue, Angular, Svelte, or plain HTML.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mundane-ui"><img src="https://img.shields.io/npm/v/mundane-ui?color=ea580c&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/mundane-ui"><img src="https://img.shields.io/npm/dm/mundane-ui?color=f97316" alt="npm downloads"></a>
  <a href="https://github.com/waga97/Mundane-UI/blob/main/LICENSE"><img src="https://img.shields.io/github/license/waga97/Mundane-UI?color=f48c06" alt="license"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies">
  <img src="https://img.shields.io/badge/gzipped-~9KB-blue" alt="bundle size">
</p>

<p align="center">
  <a href="https://mundane-ui.vercel.app">Documentation</a> ·
  <a href="https://mundane-ui.vercel.app/guide/getting-started">Getting Started</a> ·
  <a href="https://mundane-ui.vercel.app/guide/why">Why This Exists</a>
</p>

---

## Install

```bash
npm install mundane-ui
```

## Quick Start

```html
<link rel="stylesheet" href="mundane-ui/css/plain.css">
<div id="my-table"></div>
```

```js
import { DataTable } from 'mundane-ui'
import 'mundane-ui/css/plain.css'

const table = DataTable.create({
  el: '#my-table',
  mode: 'frontend',
  data: [
    { name: 'Alice', age: 30, email: 'alice@example.com' },
    { name: 'Bob', age: 25, email: 'bob@example.com' },
  ],
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'age', label: 'Age', type: 'number', sortable: true, thousandSeparator: true },
    { key: 'email', label: 'Email', type: 'string', sortable: true },
  ],
})
```

## Features

- **Zero dependencies** — pure vanilla TypeScript
- **Framework-agnostic** — plain JS class, mounts to any DOM element
- **Two modes** — frontend (client-side) and backend (server-side with QSP emission)
- **Sorting** — single-column, per-type comparators (string, number, date, custom)
- **Search** — global search, column filters, or both (debounced)
- **Pagination** — configurable page sizes, ellipsis for large page counts
- **Column alignment** — left/center/right per column (numbers default to right)
- **Number formatting** — optional thousand separator (e.g. `1,000,000`)
- **Date parsing** — built-in parser for common date formats (YYYY, MM, DD, HH, mm, ss)
- **Custom columns** — render any HTML with your own function
- **XSS safe** — all data values are HTML-escaped
- **CSS customizable** — CSS custom properties, class overrides, or Tailwind utility classes
- **Lightweight** — ~9KB gzipped

## Frontend Mode

All data is held in memory. Sorting, filtering, and pagination happen client-side.

```js
const table = DataTable.create({
  el: '#table',
  mode: 'frontend',
  data: myData,
  pageSize: 25,
  search: { enabled: true, mode: 'both', debounce: 300 },
  columns: [
    { key: 'id', label: 'ID', type: 'number', sortable: true, align: 'center' },
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true },
    { key: 'joinDate', label: 'Joined', type: 'date', dateFormat: 'DD/MM/YYYY', sortable: true },
    {
      key: 'actions', label: 'Actions', type: 'custom',
      render: (row) => `<button onclick="edit(${row.id})">Edit</button>`,
    },
  ],
})
```

## Backend Mode

The component does not sort/filter/paginate. It emits query string parameters on every state change, and you fetch the data however you want.

```js
const table = DataTable.create({
  el: '#table',
  mode: 'backend',
  data: initialPageData,
  totalRows: 500,
  columns: [ /* ... */ ],
  onStateChange: async (queryString, state) => {
    // queryString: "?page=2&pageSize=10&sortBy=name&sortOrder=asc&search=john"
    const res = await fetch('/api/users' + queryString)
    const { data, total } = await res.json()
    table.setData(data, total)
  },
})
```

## Column Types

| Type | Default Align | Sortable | Searchable | Options |
|------|--------------|----------|------------|---------|
| `string` | left | localeCompare | substring match | — |
| `number` | right | numeric | toString match | `thousandSeparator` |
| `date` | left | Date comparison | display string match | `dateFormat`, `displayFormat` |
| `custom` | left | via `comparator` | via `filterFn` | `render` |

## CSS Customization

**Layer 1 — Theme file:**
```js
import 'mundane-ui/css/plain.css'
```

**Layer 2 — CSS custom properties:**
```css
.mu-datatable {
  --mu-color-border: #e2e8f0;
  --mu-color-bg-header: #f8fafc;
  --mu-border-radius: 8px;
}
```

**Layer 3 — Direct class overrides:**
```css
.mu-datatable__header-cell {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Layer 4 — Tailwind via `classes` config:**
```js
DataTable.create({
  classes: {
    root: 'rounded-xl border border-gray-200 shadow-sm',
    headerCell: 'bg-gray-50 text-xs font-semibold uppercase',
    row: 'hover:bg-blue-50 transition-colors',
    pageButtonActive: 'bg-blue-600 text-white',
  },
  // ...
})
```

## Public API

| Method | Description |
|--------|-------------|
| `setData(data, totalRows?)` | Replace dataset, triggers re-render |
| `updateRow(index, rowData)` | Update a specific row |
| `addRow(rowData, index?)` | Add a row |
| `removeRow(index)` | Remove a row |
| `setPageSize(size)` | Change page size (resets to page 1) |
| `goToPage(page)` | Navigate to a page |
| `setSearch(value)` | Set global search programmatically |
| `setColumnFilter(key, value)` | Set a column filter |
| `clearFilters()` | Clear all filters and search |
| `setLoading(bool)` | Show/hide loading overlay |
| `getState()` | Get current state object |
| `getQueryString()` | Get current query string |
| `setColumns(columns)` | Update column definitions |
| `destroy()` | Remove DOM and event listeners |
| `refresh()` | Force full re-render |

## License

MIT
