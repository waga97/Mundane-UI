import type { Column, DataTableState, DataTableConfig, ClassOverrides, SearchConfig } from '../core/types'
import { escapeHtml } from '../core/utils'
import { renderCellValue, isSearchable, getColumnAlign } from './columns'

// ============================================================
// INLINE SVG ICONS
// ============================================================

const ICONS = {
  sortNone: '<svg class="mu-datatable__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 1.5L9 4.5"/><path d="M3 7.5L6 10.5L9 7.5"/></svg>',
  sortAsc: '<svg class="mu-datatable__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7.5L6 4.5L9 7.5"/></svg>',
  sortDesc: '<svg class="mu-datatable__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>',
  search: '<svg class="mu-datatable__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="5.5" r="4"/><path d="M8.5 8.5L13 13"/></svg>',
  chevronLeft: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L4 6L8 10"/></svg>',
  chevronRight: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2L8 6L4 10"/></svg>',
  loading: '<svg class="mu-datatable__spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8" opacity="0.25"/><path d="M10 2A8 8 0 0 1 18 10" stroke-linecap="round"/></svg>',
}

// ============================================================
// HELPER: class string builder
// ============================================================

function cls(base: string, override?: string): string {
  return override ? base + ' ' + override : base
}

// ============================================================
// RENDERER
// ============================================================

export interface RendererCallbacks {
  onSort: (columnKey: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onGlobalSearch: (value: string) => void
  onColumnFilter: (columnKey: string, value: string) => void
}

export class Renderer {
  private root: HTMLElement
  private config: DataTableConfig
  private classes: ClassOverrides
  private search: SearchConfig
  private callbacks: RendererCallbacks

  // Cached DOM refs for partial updates
  private container: HTMLElement | null = null
  private tbodyEl: HTMLElement | null = null
  private paginationEl: HTMLElement | null = null
  private infoEl: HTMLElement | null = null
  private loadingEl: HTMLElement | null = null
  private searchInputEl: HTMLInputElement | null = null
  private pageSizeSelectEl: HTMLSelectElement | null = null
  private columnFilterEls: Map<string, HTMLInputElement> = new Map()

  // Event listener cleanup
  private listeners: Array<{ el: EventTarget; type: string; handler: EventListener }> = []

  constructor(root: HTMLElement, config: DataTableConfig, callbacks: RendererCallbacks) {
    this.root = root
    this.config = config
    this.classes = config.classes || {}
    this.search = config.search || {}
    this.callbacks = callbacks
  }

  /** Full initial render */
  render(state: DataTableState, rows: Record<string, any>[]): void {
    this.cleanup()

    const container = document.createElement('div')
    container.className = cls('mu-datatable', this.classes.root)
    this.container = container

    // Toolbar
    const showGlobalSearch = this.search.enabled !== false && this.search.mode !== 'column'
    const showPageSize = this.config.showPageSize !== false

    if (showGlobalSearch || showPageSize) {
      container.appendChild(this.buildToolbar(state, showGlobalSearch, showPageSize))
    }

    // Table wrapper
    const tableWrapper = document.createElement('div')
    tableWrapper.className = 'mu-datatable__table-wrapper'
    tableWrapper.style.position = 'relative'

    const table = document.createElement('table')
    table.className = cls('mu-datatable__table', this.classes.table)

    // Header
    table.appendChild(this.buildHeader(state))

    // Body
    this.tbodyEl = this.buildBody(state, rows)
    table.appendChild(this.tbodyEl)

    tableWrapper.appendChild(table)

    // Loading overlay
    this.loadingEl = document.createElement('div')
    this.loadingEl.className = cls('mu-datatable__loading', this.classes.loading)
    this.loadingEl.innerHTML = ICONS.loading + '<span>' + escapeHtml(this.config.loadingText ?? 'Loading...') + '</span>'
    this.loadingEl.style.display = 'none'
    tableWrapper.appendChild(this.loadingEl)

    container.appendChild(tableWrapper)

    // Footer (info + pagination)
    const footer = document.createElement('div')
    footer.className = 'mu-datatable__footer'

    if (this.config.showInfo !== false) {
      this.infoEl = this.buildInfo(state)
      footer.appendChild(this.infoEl)
    }

    this.paginationEl = this.buildPagination(state)
    footer.appendChild(this.paginationEl)

    container.appendChild(footer)

    // Mount
    this.root.innerHTML = ''
    this.root.appendChild(container)
  }

  /** Update just the body rows, pagination, and info — avoids rebuilding headers */
  updateBody(state: DataTableState, rows: Record<string, any>[]): void {
    if (!this.container) {
      this.render(state, rows)
      return
    }

    // Replace tbody
    if (this.tbodyEl) {
      const newTbody = this.buildBody(state, rows)
      this.tbodyEl.replaceWith(newTbody)
      this.tbodyEl = newTbody
    }

    // Replace pagination
    if (this.paginationEl) {
      const newPagination = this.buildPagination(state)
      this.paginationEl.replaceWith(newPagination)
      this.paginationEl = newPagination
    }

    // Replace info
    if (this.infoEl) {
      const newInfo = this.buildInfo(state)
      this.infoEl.replaceWith(newInfo)
      this.infoEl = newInfo
    }
  }

  /** Full re-render (when columns change etc.) */
  fullRerender(state: DataTableState, rows: Record<string, any>[]): void {
    this.render(state, rows)
  }

  /** Update sort indicators on headers without full re-render */
  updateSortIndicators(state: DataTableState): void {
    if (!this.container) return

    const headers = this.container.querySelectorAll('.mu-datatable__header-cell')
    headers.forEach(th => {
      const key = (th as HTMLElement).dataset.columnKey
      if (!key) return

      th.classList.remove('mu-datatable__header-cell--sorted-asc', 'mu-datatable__header-cell--sorted-desc')
      if (this.classes.headerCellActive) {
        th.classList.remove(...this.classes.headerCellActive.split(' '))
      }

      const iconEl = th.querySelector('.mu-datatable__sort-icon-wrapper')
      if (!iconEl) return

      if (state.sortBy === key && state.sortOrder !== 'none') {
        if (state.sortOrder === 'asc') {
          th.classList.add('mu-datatable__header-cell--sorted-asc')
          iconEl.innerHTML = ICONS.sortAsc
        } else {
          th.classList.add('mu-datatable__header-cell--sorted-desc')
          iconEl.innerHTML = ICONS.sortDesc
        }
        if (this.classes.headerCellActive) {
          th.classList.add(...this.classes.headerCellActive.split(' '))
        }
      } else {
        if (th.classList.contains('mu-datatable__header-cell--sortable')) {
          iconEl.innerHTML = ICONS.sortNone
        }
      }
    })
  }

  /** Show/hide loading overlay */
  setLoading(loading: boolean): void {
    if (this.loadingEl) {
      this.loadingEl.style.display = loading ? '' : 'none'
    }
  }

  /** Update config reference (for setColumns etc.) */
  updateConfig(config: DataTableConfig): void {
    this.config = config
    this.classes = config.classes || {}
    this.search = config.search || {}
  }

  /** Sync search input value with state (for programmatic setSearch) */
  syncSearchInput(value: string): void {
    if (this.searchInputEl && this.searchInputEl.value !== value) {
      this.searchInputEl.value = value
    }
  }

  /** Sync column filter input values with state */
  syncColumnFilter(key: string, value: string): void {
    const input = this.columnFilterEls.get(key)
    if (input && input.value !== value) {
      input.value = value
    }
  }

  /** Remove all DOM and event listeners */
  destroy(): void {
    this.cleanup()
    this.root.innerHTML = ''
  }

  // ============================================================
  // PRIVATE BUILDERS
  // ============================================================

  private buildToolbar(state: DataTableState, showSearch: boolean, showPageSize: boolean): HTMLElement {
    const toolbar = document.createElement('div')
    toolbar.className = cls('mu-datatable__toolbar', this.classes.toolbar)

    if (showSearch) {
      const searchWrap = document.createElement('div')
      searchWrap.className = 'mu-datatable__search'
      searchWrap.innerHTML = ICONS.search

      const input = document.createElement('input')
      input.type = 'text'
      input.className = cls('mu-datatable__search-input', this.classes.searchInput)
      input.placeholder = this.search.placeholder ?? 'Search...'
      input.value = state.globalSearch
      this.addListener(input, 'input', () => {
        this.callbacks.onGlobalSearch(input.value)
      })

      searchWrap.appendChild(input)
      toolbar.appendChild(searchWrap)
      this.searchInputEl = input
    }

    if (showPageSize) {
      const sizeWrap = document.createElement('div')
      sizeWrap.className = 'mu-datatable__page-size'

      const label = document.createElement('label')
      label.textContent = 'Show '
      label.className = 'mu-datatable__page-size-label'

      const select = document.createElement('select')
      select.className = cls('mu-datatable__page-size-select', this.classes.pageSizeSelect)
      const options = this.config.pageSizeOptions ?? [10, 25, 50, 100]
      for (const opt of options) {
        const option = document.createElement('option')
        option.value = opt.toString()
        option.textContent = opt.toString()
        if (opt === state.pageSize) option.selected = true
        select.appendChild(option)
      }

      this.addListener(select, 'change', () => {
        this.callbacks.onPageSizeChange(parseInt(select.value, 10))
      })

      label.appendChild(select)
      const entriesSpan = document.createElement('span')
      entriesSpan.textContent = ' entries'
      label.appendChild(entriesSpan)
      sizeWrap.appendChild(label)
      toolbar.appendChild(sizeWrap)
      this.pageSizeSelectEl = select
    }

    return toolbar
  }

  private buildHeader(state: DataTableState): HTMLElement {
    const thead = document.createElement('thead')
    thead.className = cls('mu-datatable__header', this.classes.header)

    // Main header row
    const tr = document.createElement('tr')
    tr.className = cls('mu-datatable__header-row', this.classes.headerRow)

    for (const col of this.config.columns) {
      const th = document.createElement('th')
      th.className = cls('mu-datatable__header-cell', this.classes.headerCell)
      th.dataset.columnKey = col.key
      if (col.width) th.style.width = col.width
      const align = getColumnAlign(col)
      if (align !== 'left') th.style.textAlign = align

      const labelSpan = document.createElement('span')
      labelSpan.className = 'mu-datatable__header-label'
      labelSpan.textContent = col.label

      th.appendChild(labelSpan)

      if (col.sortable) {
        th.classList.add('mu-datatable__header-cell--sortable')
        th.setAttribute('role', 'button')
        th.setAttribute('tabindex', '0')
        th.setAttribute('aria-label', 'Sort by ' + col.label)

        const iconWrap = document.createElement('span')
        iconWrap.className = 'mu-datatable__sort-icon-wrapper'

        if (state.sortBy === col.key && state.sortOrder !== 'none') {
          iconWrap.innerHTML = state.sortOrder === 'asc' ? ICONS.sortAsc : ICONS.sortDesc
          th.classList.add('mu-datatable__header-cell--sorted-' + state.sortOrder)
          if (this.classes.headerCellActive) {
            th.classList.add(...this.classes.headerCellActive.split(' '))
          }
        } else {
          iconWrap.innerHTML = ICONS.sortNone
        }

        th.appendChild(iconWrap)

        const key = col.key
        this.addListener(th, 'click', () => this.callbacks.onSort(key))
        this.addListener(th, 'keydown', (e) => {
          if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
            e.preventDefault()
            this.callbacks.onSort(key)
          }
        })
      }

      tr.appendChild(th)
    }

    thead.appendChild(tr)

    // Column filter row (if mode is 'column' or 'both')
    const searchMode = this.search.mode ?? 'global'
    if (searchMode === 'column' || searchMode === 'both') {
      const filterRow = document.createElement('tr')
      filterRow.className = 'mu-datatable__filter-row'

      for (const col of this.config.columns) {
        const td = document.createElement('td')
        td.className = 'mu-datatable__filter-cell'

        if (isSearchable(col)) {
          const input = document.createElement('input')
          input.type = 'text'
          input.className = cls('mu-datatable__column-filter', this.classes.columnFilter)
          input.placeholder = 'Filter...'
          input.value = state.columnFilters[col.key] || ''
          const key = col.key
          this.addListener(input, 'input', () => {
            this.callbacks.onColumnFilter(key, input.value)
          })
          td.appendChild(input)
          this.columnFilterEls.set(col.key, input)
        }

        filterRow.appendChild(td)
      }

      thead.appendChild(filterRow)
    }

    return thead
  }

  private buildBody(state: DataTableState, rows: Record<string, any>[]): HTMLElement {
    const tbody = document.createElement('tbody')
    tbody.className = cls('mu-datatable__body', this.classes.body)

    if (rows.length === 0) {
      const tr = document.createElement('tr')
      const td = document.createElement('td')
      td.className = cls('mu-datatable__empty', this.classes.empty)
      td.colSpan = this.config.columns.length
      td.textContent = this.config.emptyText ?? 'No data available'
      tr.appendChild(td)
      tbody.appendChild(tr)
      return tbody
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const tr = document.createElement('tr')
      let rowClass = 'mu-datatable__row'
      if (this.classes.row) rowClass += ' ' + this.classes.row

      if (i % 2 === 1) {
        rowClass += ' mu-datatable__row--even'
        if (this.classes.rowEven) rowClass += ' ' + this.classes.rowEven
      }
      tr.className = rowClass

      for (const col of this.config.columns) {
        const td = document.createElement('td')
        td.className = cls('mu-datatable__cell', this.classes.cell)
        const align = getColumnAlign(col)
        if (align !== 'left') td.style.textAlign = align
        td.innerHTML = renderCellValue(col, row, i)
        tr.appendChild(td)
      }

      tbody.appendChild(tr)
    }

    return tbody
  }

  private buildPagination(state: DataTableState): HTMLElement {
    const container = document.createElement('div')
    container.className = cls('mu-datatable__pagination', this.classes.pagination)

    if (state.totalPages <= 1) return container

    // Prev button
    const prevBtn = this.createPageButton(ICONS.chevronLeft, state.currentPage - 1, state.currentPage <= 1)
    prevBtn.setAttribute('aria-label', 'Previous page')
    container.appendChild(prevBtn)

    // Page numbers with ellipsis
    const pages = this.getPageNumbers(state.currentPage, state.totalPages)
    for (const p of pages) {
      if (p === -1) {
        const ellipsis = document.createElement('span')
        ellipsis.className = 'mu-datatable__page-ellipsis'
        ellipsis.textContent = '...'
        container.appendChild(ellipsis)
      } else {
        const btn = this.createPageButton(p.toString(), p, false)
        if (p === state.currentPage) {
          btn.classList.add('mu-datatable__page-btn--active')
          if (this.classes.pageButtonActive) {
            btn.classList.add(...this.classes.pageButtonActive.split(' '))
          }
          btn.setAttribute('aria-current', 'page')
        }
        container.appendChild(btn)
      }
    }

    // Next button
    const nextBtn = this.createPageButton(ICONS.chevronRight, state.currentPage + 1, state.currentPage >= state.totalPages)
    nextBtn.setAttribute('aria-label', 'Next page')
    container.appendChild(nextBtn)

    return container
  }

  private createPageButton(content: string, page: number, disabled: boolean): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = cls('mu-datatable__page-btn', this.classes.pageButton)
    btn.innerHTML = content

    if (disabled) {
      btn.classList.add('mu-datatable__page-btn--disabled')
      btn.disabled = true
    } else {
      this.addListener(btn, 'click', () => this.callbacks.onPageChange(page))
    }

    return btn
  }

  /** Generate page numbers with ellipsis. Returns -1 for ellipsis positions. */
  private getPageNumbers(current: number, total: number): number[] {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const pages: number[] = []
    const around = 1 // pages around current

    // Always show first page
    pages.push(1)

    const rangeStart = Math.max(2, current - around)
    const rangeEnd = Math.min(total - 1, current + around)

    if (rangeStart > 2) {
      pages.push(-1) // ellipsis
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (rangeEnd < total - 1) {
      pages.push(-1) // ellipsis
    }

    // Always show last page
    pages.push(total)

    return pages
  }

  private buildInfo(state: DataTableState): HTMLElement {
    const info = document.createElement('div')
    info.className = cls('mu-datatable__info', this.classes.info)

    if (state.totalRows === 0) {
      info.textContent = 'No entries'
    } else {
      const start = (state.currentPage - 1) * state.pageSize + 1
      const end = Math.min(state.currentPage * state.pageSize, state.totalRows)
      info.textContent = 'Showing ' + start + '-' + end + ' of ' + state.totalRows + ' entries'
    }

    return info
  }

  // ============================================================
  // EVENT LISTENER MANAGEMENT
  // ============================================================

  private addListener(el: EventTarget, type: string, handler: EventListener): void {
    el.addEventListener(type, handler)
    this.listeners.push({ el, type, handler })
  }

  private cleanup(): void {
    for (const { el, type, handler } of this.listeners) {
      el.removeEventListener(type, handler)
    }
    this.listeners = []
    this.columnFilterEls.clear()
    this.searchInputEl = null
    this.pageSizeSelectEl = null
    this.tbodyEl = null
    this.paginationEl = null
    this.infoEl = null
    this.loadingEl = null
  }
}
