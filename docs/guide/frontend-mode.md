---
description: Frontend mode — client-side sorting, filtering, and pagination. Give it all your data, it handles the rest.
---

# Frontend Mode

Give it all your data. It sorts, filters, and paginates in memory. Simple.

Use this when your dataset fits in the browser — a few hundred to a few thousand rows. If you're dealing with 50,000+ rows from a database, you probably want [Backend Mode](/guide/backend-mode) instead.

## The basics

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'frontend',
  data: myData,
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'age', label: 'Age', type: 'number', sortable: true },
  ],
})
```

That's a fully working table. Search, pagination, page size — all included by default.

## How the data pipeline works

Every time something changes, the data runs through this pipeline:

**filter &rarr; sort &rarr; paginate**

Always in that order. A few things to know:

- Changing a filter or search **resets to page 1** (you don't want to be on page 5 of a different result set)
- Changing sort **does not** reset page (you're looking at the same data, just reordered)
- Changing page size **resets to page 1**

## Search modes

You get three options. Pick the one that makes sense for your use case.

### Global search (the default)

One search input, searches across all searchable columns at once.

```js
search: {
  enabled: true,
  mode: 'global',
  debounce: 300,
  placeholder: 'Search...',
}
```

### Column filters

Individual inputs under each column header. Users filter one column at a time.

```js
search: {
  mode: 'column',
}
```

### Both at the same time

Global search bar on top + per-column filter inputs. For power users who want precise control.

```js
search: {
  mode: 'both',
}
```

::: tip Debounce
All search inputs are debounced (default 300ms). Nobody wants to fire a filter on every keystroke. You can change the delay with `search.debounce`.
:::

## Updating data on the fly

The table is alive. You can mutate data after creation and it re-renders automatically.

```js
// Nuke everything and start fresh
table.setData(newData)

// Add someone
table.addRow({ name: 'New Person', age: 28 })

// Add someone at a specific position
table.addRow({ name: 'First Person', age: 30 }, 0)

// Fix a typo in the first row
table.updateRow(0, { name: 'Fixed Name' })

// Remove the third row
table.removeRow(2)
```

Every one of these triggers a re-render. You don't need to call `.refresh()` — it's automatic.

## Try it

50 rows with both global search and column filters. Sort the columns, type in the search, change the page size — it all works client-side:

<DemoWindow>
  <FrontendDemo />
  <template #code>

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'frontend',
  data: generateData(50),
  pageSize: 5,
  pageSizeOptions: [5, 10, 25],
  search: {
    enabled: true,
    mode: 'both',       // global search + per-column filters
    debounce: 300,
    placeholder: 'Search employees...',
  },
  columns: [
    { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'email', label: 'Email', type: 'string', sortable: true },
    { key: 'department', label: 'Dept', type: 'string', sortable: true },
    { key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true },
    { key: 'joinDate', label: 'Joined', type: 'date', dateFormat: 'DD/MM/YYYY', sortable: true },
  ],
})
```

  </template>
</DemoWindow>
