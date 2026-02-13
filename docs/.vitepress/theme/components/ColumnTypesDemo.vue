<template>
  <div ref="tableEl"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const tableEl = ref(null)
let table = null

onMounted(async () => {
  const { DataTable } = await import('mundane-ui')
  table = DataTable.create({
    el: tableEl.value,
    mode: 'frontend',
    data: [
      { name: 'Wireless Mouse', price: 29.99, stock: 1420, released: '15/03/2023', status: 'In Stock' },
      { name: 'Mechanical Keyboard', price: 149.5, stock: 340, released: '02/11/2022', status: 'In Stock' },
      { name: 'USB-C Hub', price: 45, stock: 0, released: '20/07/2024', status: 'Out of Stock' },
      { name: '4K Monitor', price: 599.99, stock: 85, released: '10/01/2024', status: 'In Stock' },
      { name: 'Webcam HD', price: 79.95, stock: 12, released: '05/06/2023', status: 'Low Stock' },
      { name: 'Desk Lamp', price: 34, stock: 900, released: '18/09/2021', status: 'In Stock' },
      { name: 'Laptop Stand', price: 55.5, stock: 0, released: '30/12/2023', status: 'Out of Stock' },
      { name: 'Noise-Cancel Headphones', price: 249, stock: 67, released: '14/02/2024', status: 'In Stock' },
    ],
    pageSize: 5,
    search: { enabled: true, mode: 'global', placeholder: 'Search products...' },
    columns: [
      { key: 'name', label: 'Product', type: 'string', sortable: true },
      { key: 'price', label: 'Price ($)', type: 'number', sortable: true, thousandSeparator: true },
      { key: 'stock', label: 'Stock', type: 'number', sortable: true, thousandSeparator: true },
      { key: 'released', label: 'Released', type: 'date', dateFormat: 'DD/MM/YYYY', displayFormat: 'DD/MM/YYYY', sortable: true },
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
          const c = colors[row.status] || '#000'
          return '<span style="display:inline-flex;align-items:center;gap:5px;"><span style="width:7px;height:7px;border-radius:50%;background:' + c + ';display:inline-block;"></span>' + row.status + '</span>'
        },
      },
    ],
  })
})

onUnmounted(() => {
  if (table) table.destroy()
})
</script>
