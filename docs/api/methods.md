---
description: "Every public method on the DataTable instance. Data manipulation, navigation, search, state inspection, and lifecycle — with copy-paste examples."
---

# Methods Reference

Every method lives on the instance returned by `DataTable.create()`.

```js
const table = DataTable.create({ ... })
// Now use table.whatever()
```

All data-modifying methods trigger an automatic re-render. You never need to manually refresh after calling them.

## Data Methods

### `setData(data, totalRows?)`

Replace the entire dataset. In backend mode, pass the new `totalRows` too.

```js
// Frontend mode — swap out all the data
table.setData(newData)

// Backend mode — update current page + total count
table.setData(pageData, 500)
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `Record<string, any>[]` | yes | The new rows |
| `totalRows` | `number` | backend only | Updated total row count |

---

### `addRow(rowData, index?)`

Add a row. Appends to the end by default, or insert at a specific position.

```js
// Append to the end
table.addRow({ name: 'New Person', age: 25 })

// Insert at the beginning
table.addRow({ name: 'First Person', age: 30 }, 0)

// Insert at position 5
table.addRow({ name: 'Middle Person', age: 28 }, 5)
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `rowData` | `Record<string, any>` | yes | The row to add |
| `index` | `number` | no | Position to insert at (0-based). Omit to append. |

---

### `updateRow(index, rowData)`

Update a row by index. Merges with existing data — you only need to pass the fields that changed.

```js
// Only update the name, keep everything else
table.updateRow(0, { name: 'Updated Name' })

// Update multiple fields
table.updateRow(3, { name: 'New Name', age: 31, email: 'new@example.com' })
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `index` | `number` | yes | Row index in the data array (0-based) |
| `rowData` | `Record<string, any>` | yes | Fields to merge into the existing row |

---

### `removeRow(index)`

Remove a row by its index in the data array.

```js
table.removeRow(2) // removes the third row
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `index` | `number` | yes | Row index to remove (0-based) |

## Navigation Methods

### `goToPage(page)`

Jump to a specific page. Pages are **1-based** (page 1 is the first page, not page 0).

```js
table.goToPage(1)   // first page
table.goToPage(3)   // third page
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | `number` | yes | Page number (1-based) |

---

### `setPageSize(size)`

Change how many rows are shown per page. Automatically resets to page 1.

```js
table.setPageSize(25)
table.setPageSize(100)
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `size` | `number` | yes | New number of rows per page |

## Search Methods

### `setSearch(value)`

Set the global search value programmatically. Resets to page 1.

```js
table.setSearch('john')     // search for "john"
table.setSearch('')         // clear the search
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | yes | The search query |

---

### `setColumnFilter(columnKey, value)`

Set a filter on a specific column. Resets to page 1.

```js
table.setColumnFilter('status', 'active')
table.setColumnFilter('department', 'engineering')
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `columnKey` | `string` | yes | The column's `key` value |
| `value` | `string` | yes | The filter value |

---

### `clearFilters()`

Nuke all search and filter values. Global search, column filters — all gone. Resets to page 1.

```js
table.clearFilters()
```

No parameters.

## State Methods

### `getState()`

Returns a snapshot of the current internal state. This is a copy — mutating it won't affect the table.

```js
const state = table.getState()

// Returns:
// {
//   currentPage: 2,
//   pageSize: 10,
//   sortBy: 'name',
//   sortOrder: 'asc',
//   globalSearch: '',
//   columnFilters: {},
//   totalRows: 50,
//   totalPages: 5,
// }
```

**Returns:** `DataTableState` (see [Types](/api/types#datatablestate))

---

### `getQueryString()`

Returns the current state as a URL query string. Useful if you need to sync state with the URL or make API calls outside of `onStateChange`.

```js
const qs = table.getQueryString()
// "?page=2&pageSize=10&sortBy=name&sortOrder=asc"

// Use it
const res = await fetch('/api/users' + qs)
```

**Returns:** `string`

## Display Methods

### `setLoading(loading)`

Manually show or hide the loading overlay. In backend mode, this is managed automatically (shows on `onStateChange`, hides on `setData`), but you can override it.

```js
table.setLoading(true)   // show loading overlay
table.setLoading(false)  // hide it
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `loading` | `boolean` | yes | `true` to show, `false` to hide |

---

### `setColumns(columns)`

Replace the column definitions entirely. Triggers a full re-render of the table including headers.

```js
table.setColumns([
  { key: 'name', label: 'Full Name', type: 'string', sortable: true },
  { key: 'email', label: 'Email Address', type: 'string' },
])
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `Column[]` | yes | New column definitions |

---

### `refresh()`

Force a full re-render. You almost never need this — every other method already triggers a re-render automatically. But if something weird happens, this is your escape hatch.

```js
table.refresh()
```

No parameters.

---

### `destroy()`

Removes all DOM elements and event listeners. Call this when unmounting.

```js
// React
useEffect(() => {
  const table = DataTable.create({ el: ref.current, ... })
  return () => table.destroy()
}, [])

// Vue
onUnmounted(() => table.destroy())

// Vanilla
table.destroy()
```

No parameters.

::: warning After destroy
The instance is dead after `destroy()`. Any method call will throw. Create a new instance if you need the table again.
:::
