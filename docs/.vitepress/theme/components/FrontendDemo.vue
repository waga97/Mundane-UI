<template>
  <div ref="tableEl"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const tableEl = ref(null)
let table = null

const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
const departments = ['Engineering', 'Marketing', 'Sales', 'Design', 'HR', 'Finance', 'Support', 'Legal']

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad(n) { return n.toString().padStart(2, '0') }

function generateData(count) {
  return Array.from({ length: count }, (_, i) => {
    const first = randomItem(firstNames)
    const last = randomItem(lastNames)
    return {
      id: i + 1,
      name: first + ' ' + last,
      email: first.toLowerCase() + '.' + last.toLowerCase() + '@example.com',
      department: randomItem(departments),
      salary: randomInt(40000, 150000),
      joinDate: pad(randomInt(1, 28)) + '/' + pad(randomInt(1, 12)) + '/' + randomInt(2020, 2024),
    }
  })
}

onMounted(async () => {
  const { DataTable } = await import('mundane-ui')
  table = DataTable.create({
    el: tableEl.value,
    mode: 'frontend',
    data: generateData(50),
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    search: {
      enabled: true,
      mode: 'both',
      debounce: 300,
      placeholder: 'Search employees...',
    },
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
      { key: 'name', label: 'Name', type: 'string', sortable: true },
      { key: 'email', label: 'Email', type: 'string', sortable: true },
      { key: 'department', label: 'Dept', type: 'string', sortable: true },
      { key: 'salary', label: 'Salary', type: 'number', sortable: true, thousandSeparator: true },
      { key: 'joinDate', label: 'Joined', type: 'date', dateFormat: 'DD/MM/YYYY', displayFormat: 'DD/MM/YYYY', sortable: true },
    ],
  })
})

onUnmounted(() => {
  if (table) table.destroy()
})
</script>
