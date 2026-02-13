<template>
  <div ref="tableEl" class="styled-table"></div>
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
      { name: 'Alice Smith', email: 'alice@company.io', role: 'Lead Engineer', mrr: 12400, status: 'Active' },
      { name: 'Bob Johnson', email: 'bob@company.io', role: 'Sr. Designer', mrr: 8200, status: 'Active' },
      { name: 'Charlie Brown', email: 'charlie@company.io', role: 'Eng. Manager', mrr: 15300, status: 'Churned' },
      { name: 'Diana Jones', email: 'diana@company.io', role: 'Staff Engineer', mrr: 9600, status: 'Active' },
      { name: 'Eve Garcia', email: 'eve@company.io', role: 'Product Designer', mrr: 6800, status: 'Trial' },
      { name: 'Frank Miller', email: 'frank@company.io', role: 'Backend Engineer', mrr: 11200, status: 'Active' },
      { name: 'Grace Lee', email: 'grace@company.io', role: 'Design Lead', mrr: 14100, status: 'Active' },
      { name: 'Hank Davis', email: 'hank@company.io', role: 'SRE', mrr: 7500, status: 'Trial' },
    ],
    pageSize: 5,
    pageSizeOptions: [5, 8],
    search: { enabled: true, mode: 'global', placeholder: 'Search customers...' },
    columns: [
      { key: 'name', label: 'Customer', type: 'string', sortable: true },
      { key: 'email', label: 'Email', type: 'string', sortable: true },
      { key: 'role', label: 'Role', type: 'string', sortable: true },
      { key: 'mrr', label: 'MRR', type: 'number', sortable: true, thousandSeparator: true },
      {
        key: 'status',
        label: 'Status',
        type: 'custom',
        sortable: true,
        searchable: true,
        comparator: (a, b) => String(a).localeCompare(String(b)),
        filterFn: (val, filter) => String(val).toLowerCase().includes(filter.toLowerCase()),
        render: (row) => {
          const styles = {
            'Active': 'background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;',
            'Trial': 'background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;',
            'Churned': 'background:#fef2f2;color:#991b1b;border:1px solid #fecaca;',
          }
          const dots = {
            'Active': '#10b981',
            'Trial': '#3b82f6',
            'Churned': '#ef4444',
          }
          return '<span style="display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:500;' + (styles[row.status] || '') + '"><span style="width:6px;height:6px;border-radius:50%;background:' + (dots[row.status] || '#999') + ';display:inline-block;"></span>' + row.status + '</span>'
        },
      },
    ],
  })
})

onUnmounted(() => {
  if (table) table.destroy()
})
</script>

<style scoped>
.styled-table {
  --mu-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --mu-font-size: 13.5px;
  --mu-font-size-sm: 12px;

  --mu-color-text: #111827;
  --mu-color-text-secondary: #6b7280;
  --mu-color-bg: #ffffff;
  --mu-color-bg-header: #f9fafb;
  --mu-color-bg-hover: #f9fafb;
  --mu-color-bg-even: #ffffff;
  --mu-color-border: #e5e7eb;
  --mu-color-accent: #ea580c;

  --mu-border-width: 1px;
  --mu-border-radius: 10px;
  --mu-shadow: none;
  --mu-transition: 150ms ease;
  --mu-input-height: 36px;

  --mu-spacing-xs: 6px;
  --mu-spacing-sm: 8px;
  --mu-spacing-md: 12px;
  --mu-spacing-lg: 16px;
  --mu-spacing-xl: 24px;
}

/* Table: contained card with border + subtle shadow */
.styled-table :deep(.mu-datatable__table) {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Header: light gray bg, uppercase tiny labels, bottom border */
.styled-table :deep(.mu-datatable__header) {
  background: #f9fafb;
}

.styled-table :deep(.mu-datatable__header-cell) {
  color: #6b7280;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.styled-table :deep(.mu-datatable__header-cell--sortable:hover) {
  background: #f3f4f6;
  color: #374151;
}

.styled-table :deep(.mu-datatable__header-cell--sorted-asc),
.styled-table :deep(.mu-datatable__header-cell--sorted-desc) {
  color: #ea580c;
  background: #fff7ed;
}

/* Cells: clean rows with subtle bottom border */
.styled-table :deep(.mu-datatable__cell) {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  font-size: 13.5px;
}

/* Last row no border */
.styled-table :deep(.mu-datatable__row:last-child .mu-datatable__cell) {
  border-bottom: none;
}

/* Hover: full row subtle highlight */
.styled-table :deep(.mu-datatable__row:hover) {
  background: #f9fafb;
}

.styled-table :deep(.mu-datatable__row--even) {
  background: #ffffff;
}

.styled-table :deep(.mu-datatable__row--even:hover) {
  background: #f9fafb;
}

/* Search: clean rounded input */
.styled-table :deep(.mu-datatable__search-input) {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  color: #374151;
  background: #ffffff;
  transition: all 150ms ease;
}

.styled-table :deep(.mu-datatable__search-input:focus) {
  border-color: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
  outline: none;
}

.styled-table :deep(.mu-datatable__search-input::placeholder) {
  color: #9ca3af;
}

/* Page size */
.styled-table :deep(.mu-datatable__page-size-select) {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
}

/* Pagination: small rounded buttons */
.styled-table :deep(.mu-datatable__page-btn) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  min-width: 34px;
  height: 34px;
  transition: all 150ms ease;
}

.styled-table :deep(.mu-datatable__page-btn:hover:not(.mu-datatable__page-btn--disabled):not(.mu-datatable__page-btn--active)) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.styled-table :deep(.mu-datatable__page-btn--active) {
  background: #ea580c;
  border-color: #ea580c;
  color: #ffffff;
  font-weight: 600;
}

.styled-table :deep(.mu-datatable__page-btn--disabled) {
  color: #d1d5db;
}

/* Footer info */
.styled-table :deep(.mu-datatable__info) {
  color: #9ca3af;
  font-size: 12px;
}

.styled-table :deep(.mu-datatable__page-size-label) {
  color: #9ca3af;
  font-size: 12px;
}
</style>
