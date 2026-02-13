---
description: Backend mode — the table doesn't touch your data. It just tells you what the user wants, and you fetch it however you want.
---

# Backend Mode

Here's the deal: your database has 500,000 rows. You're not loading that into the browser.

In backend mode, the table **doesn't sort, filter, or paginate anything**. When the user clicks a column header or types in the search box, the table hands you a query string and says "go fetch." You call your API, get the results, feed them back. Done.

## The basics

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'backend',
  data: initialPageData,
  totalRows: 500,
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'email', label: 'Email', type: 'string', sortable: true },
  ],
  onStateChange: async (queryString, state) => {
    // queryString is ready to append to your API URL
    const res = await fetch('/api/users' + queryString)
    const { data, total } = await res.json()
    table.setData(data, total)
  },
})
```

Three things you need to provide that frontend mode doesn't require:
- `totalRows` — the total count (so pagination knows how many pages exist)
- `onStateChange` — the callback that fires when the user does anything
- A way to fetch data (that's your problem — fetch, axios, GraphQL, carrier pigeon, whatever)

## The flow

1. User does something (clicks sort, types in search, changes page)
2. Table fires `onStateChange(queryString, state)`
3. Table shows a loading overlay automatically
4. You fetch data from your API
5. You call `table.setData(newData, newTotalRows)`
6. Loading overlay disappears, table shows the new data

You don't manage the loading state. It's automatic.

## The query string

The `queryString` parameter is a ready-to-use URL query string:

```
?page=2&pageSize=10&sortBy=name&sortOrder=asc&search=john
```

Column filters use bracket notation:

```
?page=1&pageSize=10&filter[name]=john&filter[status]=active
```

Just append it to your API endpoint. No parsing needed on the frontend.

## The state object

If you need more control than a raw query string, the `state` parameter gives you everything as a typed object:

```js
onStateChange: (queryString, state) => {
  state.currentPage    // 2
  state.pageSize       // 10
  state.sortBy         // 'name'
  state.sortOrder      // 'asc'
  state.globalSearch   // 'john'
  state.columnFilters  // { status: 'active' }
  state.totalRows      // 500
  state.totalPages     // 50
}
```

Useful if your API uses a different parameter format than the default query string.

## Loading state

Automatic: shows when `onStateChange` fires, hides when `setData()` is called.

Manual override if you need it:

```js
table.setLoading(true)   // show
table.setLoading(false)  // hide
```

## Try it

This demo simulates a server with 400ms latency. Try sorting, searching, and paginating. Watch the query string update below the table in real-time:

<DemoWindow>
  <BackendDemo />
  <template #code>

```js
const table = DataTable.create({
  el: '#my-table',
  mode: 'backend',
  data: initialPageData,
  totalRows: 25,
  pageSize: 5,
  search: { enabled: true, debounce: 400, placeholder: 'Search (server)...' },
  columns: [
    { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'department', label: 'Department', type: 'string', sortable: true },
    { key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true },
  ],
  onStateChange: async (queryString, state) => {
    // queryString = "?page=2&pageSize=5&sortBy=name&sortOrder=asc"
    const res = await fetch('/api/users' + queryString)
    const { data, total } = await res.json()
    table.setData(data, total)
  },
})
```

  </template>
</DemoWindow>
