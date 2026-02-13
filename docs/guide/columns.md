---
description: Column types in mundane-ui — string, number, date, and custom. Each one sorts and filters differently.
---

# Column Types

Every column needs three things: `key` (which field in your data), `label` (what the header says), and `type` (how it behaves).

The type determines how sorting works, how filtering works, and how the value renders. Four types, four behaviors.

## String

The workhorse. Case-insensitive `localeCompare` sorting. Case-insensitive substring filtering.

```js
{ key: 'name', label: 'Name', type: 'string', sortable: true }
```

Nothing surprising here.

## Number

Right-aligned by default (because that's how numbers should look in a table). Sorts numerically, not alphabetically (so 9 comes before 10, unlike string sorting).

```js
{ key: 'price', label: 'Price', type: 'number', sortable: true }
```

Want commas? Turn on `thousandSeparator`:

```js
{ key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true }
// 150000 → "150,000"
```

Sorting still uses the raw number, not the formatted string. So it sorts correctly regardless of formatting.

## Date

Dates are tricky because everyone formats them differently. You tell the component how your data is formatted, and it handles parsing, sorting, and optionally re-formatting for display.

```js
{
  key: 'createdAt',
  label: 'Created',
  type: 'date',
  dateFormat: 'DD/MM/YYYY',       // how the raw value looks
  displayFormat: 'DD/MM/YYYY',    // how to show it (optional)
  sortable: true,
}
```

Supported tokens: `YYYY`, `MM`, `DD`, `HH`, `mm`, `ss` — with any delimiter between them.

No external date library. Zero-dependency means zero-dependency. The built-in parser handles it.

::: info Date sorting
Dates are parsed to `Date` objects and compared by timestamp. So `01/12/2024` correctly sorts after `15/03/2023`, even though "01" < "15" as strings.
:::

## Custom

This is the escape hatch. Render literally any HTML you want. Status badges with colored dots? Action buttons? Progress bars? Go wild.

```js
{
  key: 'status',
  label: 'Status',
  type: 'custom',
  sortable: true,
  searchable: true,
  comparator: (a, b) => String(a).localeCompare(String(b)),
  filterFn: (cellValue, filterValue) =>
    String(cellValue).toLowerCase().includes(filterValue.toLowerCase()),
  render: (row) => {
    const color = row.status === 'Active' ? '#16a34a' : '#dc2626'
    return `<span style="color:${color};font-weight:600">${row.status}</span>`
  },
}
```

Custom columns are **not searchable or sortable by default** — because we have no idea what you're rendering. If you want sorting, provide a `comparator`. If you want filtering, provide a `filterFn`.

::: warning XSS
The `render()` output is injected as raw HTML. All other column types are automatically escaped. If your custom column renders user input, **you** need to sanitize it.
:::

## Alignment

Numbers default to right-aligned. Everything else defaults to left. Override with `align`:

```js
{ key: 'id', label: 'ID', type: 'number', align: 'center' }
```

Options: `'left'`, `'center'`, `'right'`.

## Width

Lock a column to a specific width:

```js
{ key: 'id', label: 'ID', type: 'number', width: '60px' }
{ key: 'description', label: 'Desc', type: 'string', width: '40%' }
```

Any CSS width value works.

## Searchable

By default: `string`, `number`, and `date` are searchable. `custom` is not.

Override it:

```js
// Don't include ID in search results
{ key: 'id', label: 'ID', type: 'number', searchable: false }

// Make a custom column searchable (requires filterFn)
{ key: 'status', label: 'Status', type: 'custom', searchable: true, filterFn: ... }
```

## Try it

A product table with all four column types in action — string names, number prices, date releases, and custom status badges:

<DemoWindow>
  <ColumnTypesDemo />
  <template #code>

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'frontend',
  data: products,
  pageSize: 5,
  search: { enabled: true, placeholder: 'Search products...' },
  columns: [
    { key: 'name', label: 'Product', type: 'string', sortable: true },
    { key: 'price', label: 'Price ($)', type: 'number', sortable: true, thousandSeparator: true },
    { key: 'stock', label: 'Stock', type: 'number', sortable: true, thousandSeparator: true },
    { key: 'released', label: 'Released', type: 'date', dateFormat: 'DD/MM/YYYY', sortable: true },
    {
      key: 'status',
      label: 'Status',
      type: 'custom',
      sortable: true,
      searchable: true,
      comparator: (a, b) => String(a).localeCompare(String(b)),
      filterFn: (val, filter) => String(val).toLowerCase().includes(filter.toLowerCase()),
      render: (row) => {
        const colors = { 'In Stock': '#16a34a', 'Out of Stock': '#dc2626', 'Low Stock': '#d97706' }
        return `<span style="color:${colors[row.status]}">${row.status}</span>`
      },
    },
  ],
})
```

  </template>
</DemoWindow>
