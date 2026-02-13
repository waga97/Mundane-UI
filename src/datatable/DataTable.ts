import type {
  DataTableConfig,
  FrontendConfig,
  BackendConfig,
  DataTableState,
  DataTableAPI,
  Column,
} from '../core/types'
import { debounce } from '../core/utils'
import { buildQueryString } from '../core/qsp'
import { createState, recalcPages, cycleSortOrder } from './state'
import { processFrontendData } from './frontend'
import { emitStateChange } from './backend'
import { Renderer, RendererCallbacks } from './renderer'

export class DataTable implements DataTableAPI {
  private config: DataTableConfig
  private state: DataTableState
  private data: Record<string, any>[]
  private renderer: Renderer
  private rootEl: HTMLElement
  private destroyed = false

  // Debounced search handlers
  private debouncedGlobalSearch: ((value: string) => void) & { cancel(): void }
  private debouncedColumnFilters: Map<string, ((value: string) => void) & { cancel(): void }> = new Map()

  private constructor(config: DataTableConfig) {
    this.config = config
    this.data = config.data.slice() // shallow copy
    this.state = createState(config)

    // Resolve mount element
    const el = typeof config.el === 'string' ? document.querySelector(config.el) : config.el
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error('mundane-ui: Invalid mount element. Provide a valid CSS selector or HTMLElement.')
    }
    this.rootEl = el

    // Set up debounced search
    const searchDelay = config.search?.debounce ?? 300
    this.debouncedGlobalSearch = debounce((value: string) => {
      this.state.globalSearch = value
      this.state.currentPage = 1 // filter change resets page
      this.onStateChanged()
    }, searchDelay)

    // Create renderer with callbacks
    const callbacks: RendererCallbacks = {
      onSort: (key) => this.handleSort(key),
      onPageChange: (page) => this.handlePageChange(page),
      onPageSizeChange: (size) => this.handlePageSizeChange(size),
      onGlobalSearch: (value) => this.debouncedGlobalSearch(value),
      onColumnFilter: (key, value) => this.handleColumnFilter(key, value),
    }

    this.renderer = new Renderer(this.rootEl, config, callbacks)

    // Initial render
    this.renderCurrentState()
  }

  /** Factory method — the public way to create a DataTable */
  static create(config: DataTableConfig): DataTable {
    // Validate config
    if (!config.el) throw new Error('mundane-ui: "el" is required.')
    if (!config.columns || config.columns.length === 0) throw new Error('mundane-ui: "columns" is required and must not be empty.')
    if (config.mode === 'backend' && config.totalRows === undefined) {
      throw new Error('mundane-ui: "totalRows" is required in backend mode.')
    }
    if (config.mode === 'backend' && !config.onStateChange) {
      throw new Error('mundane-ui: "onStateChange" callback is required in backend mode.')
    }

    return new DataTable(config)
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  setData(data: Record<string, any>[], totalRows?: number): void {
    this.ensureNotDestroyed()
    this.data = data.slice()

    if (this.config.mode === 'backend') {
      if (totalRows !== undefined) {
        this.state.totalRows = totalRows
      }
      recalcPages(this.state)
      this.renderer.setLoading(false)
    } else {
      this.state.totalRows = data.length
      recalcPages(this.state)
    }

    this.renderCurrentState()
  }

  updateRow(index: number, rowData: Record<string, any>): void {
    this.ensureNotDestroyed()
    if (index < 0 || index >= this.data.length) return
    this.data[index] = { ...this.data[index], ...rowData }
    if (this.config.mode === 'frontend') {
      this.renderCurrentState()
    } else {
      this.renderCurrentState()
    }
  }

  addRow(rowData: Record<string, any>, index?: number): void {
    this.ensureNotDestroyed()
    if (index !== undefined && index >= 0 && index <= this.data.length) {
      this.data.splice(index, 0, rowData)
    } else {
      this.data.push(rowData)
    }

    if (this.config.mode === 'frontend') {
      this.state.totalRows = this.data.length
      recalcPages(this.state)
    }
    this.renderCurrentState()
  }

  removeRow(index: number): void {
    this.ensureNotDestroyed()
    if (index < 0 || index >= this.data.length) return
    this.data.splice(index, 1)

    if (this.config.mode === 'frontend') {
      this.state.totalRows = this.data.length
      recalcPages(this.state)
    }
    this.renderCurrentState()
  }

  setPageSize(size: number): void {
    this.ensureNotDestroyed()
    this.state.pageSize = size
    this.state.currentPage = 1
    recalcPages(this.state)
    this.onStateChanged()
  }

  goToPage(page: number): void {
    this.ensureNotDestroyed()
    if (page < 1 || page > this.state.totalPages) return
    this.state.currentPage = page
    this.onStateChanged()
  }

  setSearch(value: string): void {
    this.ensureNotDestroyed()
    this.debouncedGlobalSearch.cancel()
    this.state.globalSearch = value
    this.state.currentPage = 1
    this.renderer.syncSearchInput(value)
    this.onStateChanged()
  }

  setColumnFilter(columnKey: string, value: string): void {
    this.ensureNotDestroyed()
    const debouncedFn = this.debouncedColumnFilters.get(columnKey)
    if (debouncedFn) debouncedFn.cancel()

    this.state.columnFilters[columnKey] = value
    this.state.currentPage = 1
    this.renderer.syncColumnFilter(columnKey, value)
    this.onStateChanged()
  }

  clearFilters(): void {
    this.ensureNotDestroyed()
    this.debouncedGlobalSearch.cancel()
    this.state.globalSearch = ''
    this.state.columnFilters = {}
    this.state.currentPage = 1
    this.renderer.syncSearchInput('')
    this.onStateChanged()
  }

  setLoading(loading: boolean): void {
    this.ensureNotDestroyed()
    this.renderer.setLoading(loading)
  }

  getState(): DataTableState {
    return { ...this.state }
  }

  getQueryString(): string {
    return buildQueryString(this.state)
  }

  setColumns(columns: Column[]): void {
    this.ensureNotDestroyed()
    this.config = { ...this.config, columns }
    this.renderer.updateConfig(this.config)
    this.renderer.fullRerender(this.state, this.getCurrentPageRows())
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.debouncedGlobalSearch.cancel()
    for (const fn of this.debouncedColumnFilters.values()) {
      fn.cancel()
    }
    this.renderer.destroy()
  }

  refresh(): void {
    this.ensureNotDestroyed()
    this.renderer.fullRerender(this.state, this.getCurrentPageRows())
  }

  // ============================================================
  // INTERNAL
  // ============================================================

  private handleSort(columnKey: string): void {
    if (this.state.sortBy === columnKey) {
      this.state.sortOrder = cycleSortOrder(this.state.sortOrder)
      if (this.state.sortOrder === 'none') {
        this.state.sortBy = null
      }
    } else {
      this.state.sortBy = columnKey
      this.state.sortOrder = 'asc'
    }

    // Sort does NOT reset page
    this.onStateChanged()
  }

  private handlePageChange(page: number): void {
    if (page < 1 || page > this.state.totalPages) return
    this.state.currentPage = page
    this.onStateChanged()
  }

  private handlePageSizeChange(size: number): void {
    this.state.pageSize = size
    this.state.currentPage = 1
    recalcPages(this.state)
    this.onStateChanged()
  }

  private handleColumnFilter(columnKey: string, value: string): void {
    let debouncedFn = this.debouncedColumnFilters.get(columnKey)
    if (!debouncedFn) {
      const delay = this.config.search?.debounce ?? 300
      debouncedFn = debounce((val: string) => {
        this.state.columnFilters[columnKey] = val
        this.state.currentPage = 1
        this.onStateChanged()
      }, delay)
      this.debouncedColumnFilters.set(columnKey, debouncedFn)
    }
    debouncedFn(value)
  }

  /** Called after any state change. Routes to frontend or backend logic. */
  private onStateChanged(): void {
    if (this.config.mode === 'backend') {
      this.renderer.setLoading(true)
      emitStateChange(this.config as BackendConfig, this.state)
      // In backend mode, we still render the current data (or show loading)
      this.renderer.updateBody(this.state, this.data)
      this.renderer.updateSortIndicators(this.state)
    } else {
      this.renderCurrentState()
    }
  }

  /** Compute visible rows and render */
  private renderCurrentState(): void {
    const rows = this.getCurrentPageRows()
    this.renderer.updateBody(this.state, rows)
    this.renderer.updateSortIndicators(this.state)
  }

  /** Get the rows that should be displayed on the current page */
  private getCurrentPageRows(): Record<string, any>[] {
    if (this.config.mode === 'frontend') {
      const searchableColumns = this.config.search?.searchableColumns
      const result = processFrontendData(this.data, this.config.columns, this.state, searchableColumns)
      this.state.totalRows = result.filteredTotal
      recalcPages(this.state)
      return result.pageRows
    } else {
      // Backend mode: data is already the current page
      return this.data
    }
  }

  private ensureNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('mundane-ui: This DataTable instance has been destroyed.')
    }
  }
}
