---
description: Install mundane-ui and create your first datatable in 30 seconds. Zero config, zero drama.
---

# Getting Started

You're 30 seconds away from a working datatable. No config files, no providers, no context wrappers.

## Install it

::: code-group

```bash [npm]
npm install mundane-ui
```

```bash [yarn]
yarn add mundane-ui
```

```bash [pnpm]
pnpm add mundane-ui
```

```bash [bun]
bun add mundane-ui
```

:::

## Import the CSS

One file. That's it. The `plain` theme gives you the intentionally-boring default look (black borders, black text, white background).

```js
import 'mundane-ui/css/plain.css'
```

Using a `<link>` tag? Sure:

```html
<link rel="stylesheet" href="node_modules/mundane-ui/dist/css/plain.css">
```

::: tip Why does it look so plain?
On purpose. When the default look is "nothing", overriding it to match your design takes minutes, not hours. See [Styling & Theming](/guide/styling) for the 4 ways to customize it.
:::

## Create a table

```html
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
    { name: 'Charlie', age: 35, email: 'charlie@example.com' },
  ],
  columns: [
    { key: 'name', label: 'Name', type: 'string', sortable: true },
    { key: 'age', label: 'Age', type: 'number', sortable: true },
    { key: 'email', label: 'Email', type: 'string', sortable: true },
  ],
})
```

Done. You have sorting, search, pagination, and page size control. No extra setup.

## Using it with frameworks

Since it's just a JS class that mounts to a DOM element, it works in any framework. Here's the pattern:

**React:**
```jsx
useEffect(() => {
  const table = DataTable.create({ el: ref.current, ... })
  return () => table.destroy()
}, [])
```

**Vue:**
```js
onMounted(() => {
  table = DataTable.create({ el: el.value, ... })
})
onUnmounted(() => table.destroy())
```

**Svelte:**
```js
onMount(() => {
  const table = DataTable.create({ el: container, ... })
  return () => table.destroy()
})
```

**Vanilla JS / HTMX / Alpine / whatever:** Just call `DataTable.create()`. You don't need a framework.

## Try it live

Here's a full table with 50 rows, search, column filters, sorting, and pagination. Go ahead, click stuff:

<DemoWindow>
  <FrontendDemo />
  <template #code>

```js
import { DataTable } from 'mundane-ui'
import 'mundane-ui/css/plain.css'

const table = DataTable.create({
  el: '#my-table',
  mode: 'frontend',
  data: employeeData, // 50 rows of generated data
  pageSize: 5,
  search: { enabled: true, mode: 'both', placeholder: 'Search employees...' },
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

## What's next?

- **[Frontend Mode](/guide/frontend-mode)** — how client-side sorting, filtering, and pagination work under the hood
- **[Backend Mode](/guide/backend-mode)** — let the server handle the data, the table just emits query strings
- **[Column Types](/guide/columns)** — strings, numbers, dates, and custom HTML columns
- **[Styling](/guide/styling)** — 4 layers of CSS customization, from quick theming to full Tailwind control
