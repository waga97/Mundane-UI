<template>
  <div>
    <div ref="tableEl"></div>
    <p class="qsp-label">Query String Parameters (emitted on every state change):</p>
    <div class="qsp-output">{{ qsp }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const tableEl = ref(null)
const qsp = ref('—')
let table = null

const names = ['Alice Smith', 'Bob Johnson', 'Charlie Williams', 'Diana Brown', 'Eve Jones', 'Frank Garcia', 'Grace Miller', 'Hank Davis', 'Ivy Rodriguez', 'Jack Martinez', 'Karen Wilson', 'Leo Anderson', 'Mia Thomas', 'Noah Taylor', 'Olivia Moore', 'Paul Jackson', 'Quinn Martin', 'Ruby Lee', 'Sam White', 'Tina Harris', 'Uma Clark', 'Vic Lewis', 'Wendy Hall', 'Xander Allen', 'Yara Young']
const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance']

function generateAll() {
  return names.map((name, i) => ({
    id: i + 1,
    name,
    department: departments[i % departments.length],
    salary: 50000 + (i * 4000),
  }))
}

const allData = generateAll()

function fakeServerFetch(state) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = allData.slice()

      if (state.globalSearch) {
        const s = state.globalSearch.toLowerCase()
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(s) ||
          r.department.toLowerCase().includes(s)
        )
      }

      if (state.sortBy && state.sortOrder !== 'none') {
        const dir = state.sortOrder === 'asc' ? 1 : -1
        filtered.sort((a, b) => {
          const va = a[state.sortBy]
          const vb = b[state.sortBy]
          if (typeof va === 'number') return dir * (va - vb)
          return dir * String(va).localeCompare(String(vb))
        })
      }

      const total = filtered.length
      const start = (state.currentPage - 1) * state.pageSize
      resolve({ data: filtered.slice(start, start + state.pageSize), totalRows: total })
    }, 400)
  })
}

onMounted(async () => {
  const { DataTable } = await import('mundane-ui')
  const initial = await fakeServerFetch({ currentPage: 1, pageSize: 5, sortBy: null, sortOrder: 'none', globalSearch: '', columnFilters: {} })

  table = DataTable.create({
    el: tableEl.value,
    mode: 'backend',
    data: initial.data,
    totalRows: initial.totalRows,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    search: { enabled: true, debounce: 400, placeholder: 'Search (server)...' },
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
      { key: 'name', label: 'Name', type: 'string', sortable: true },
      { key: 'department', label: 'Department', type: 'string', sortable: true },
      { key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true },
    ],
    onStateChange: (queryString, state) => {
      qsp.value = queryString
      fakeServerFetch(state).then(result => {
        table.setData(result.data, result.totalRows)
      })
    },
  })
})

onUnmounted(() => {
  if (table) table.destroy()
})
</script>
