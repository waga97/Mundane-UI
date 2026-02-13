// node_modules/mundane-ui/dist/index.esm.js
function escapeHtml(str) {
  const s = String(str !== null && str !== void 0 ? str : "");
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function debounce(fn, delay) {
  let timer = null;
  const debounced = function(...args) {
    if (timer)
      clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}
var DATE_TOKENS = {
  "YYYY": "(\\d{4})",
  "MM": "(\\d{2})",
  "DD": "(\\d{2})",
  "HH": "(\\d{2})",
  "mm": "(\\d{2})",
  "ss": "(\\d{2})"
};
function buildDateRegex(format) {
  const tokens = [];
  let pattern = format.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sortedTokenKeys = Object.keys(DATE_TOKENS).sort((a, b) => b.length - a.length);
  for (const token of sortedTokenKeys) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (pattern.includes(escaped)) {
      const idx = pattern.indexOf(escaped);
      if (idx !== -1) {
        tokens.push(token);
        pattern = pattern.substring(0, idx) + DATE_TOKENS[token] + pattern.substring(idx + escaped.length);
      }
    }
  }
  return { regex: new RegExp("^" + pattern + "$"), tokens };
}
var dateRegexCache = /* @__PURE__ */ new Map();
function getDateRegex(format) {
  let cached = dateRegexCache.get(format);
  if (!cached) {
    cached = buildDateRegex(format);
    dateRegexCache.set(format, cached);
  }
  return cached;
}
function parseDate(value, format) {
  if (!value || !format)
    return null;
  const { regex, tokens } = getDateRegex(format);
  const match = value.match(regex);
  if (!match)
    return null;
  const parts = { YYYY: 1970, MM: 1, DD: 1, HH: 0, mm: 0, ss: 0 };
  for (let i = 0; i < tokens.length; i++) {
    const num = parseInt(match[i + 1], 10);
    if (isNaN(num))
      return null;
    parts[tokens[i]] = num;
  }
  const date = new Date(parts.YYYY, parts.MM - 1, parts.DD, parts.HH, parts.mm, parts.ss);
  if (date.getFullYear() !== parts.YYYY || date.getMonth() !== parts.MM - 1 || date.getDate() !== parts.DD) {
    return null;
  }
  return date;
}
function formatDate(date, format) {
  const pad = (n) => n.toString().padStart(2, "0");
  return format.replace("YYYY", date.getFullYear().toString()).replace("MM", pad(date.getMonth() + 1)).replace("DD", pad(date.getDate())).replace("HH", pad(date.getHours())).replace("mm", pad(date.getMinutes())).replace("ss", pad(date.getSeconds()));
}
function buildQueryString(state) {
  const params = [];
  params.push("page=" + encodeURIComponent(state.currentPage.toString()));
  params.push("pageSize=" + encodeURIComponent(state.pageSize.toString()));
  if (state.sortBy) {
    params.push("sortBy=" + encodeURIComponent(state.sortBy));
    params.push("sortOrder=" + encodeURIComponent(state.sortOrder));
  }
  if (state.globalSearch) {
    params.push("search=" + encodeURIComponent(state.globalSearch));
  }
  const filterKeys = Object.keys(state.columnFilters);
  for (const key of filterKeys) {
    const val = state.columnFilters[key];
    if (val) {
      params.push("filter[" + encodeURIComponent(key) + "]=" + encodeURIComponent(val));
    }
  }
  return "?" + params.join("&");
}
function createState(config) {
  var _a;
  const pageSize = (_a = config.pageSize) !== null && _a !== void 0 ? _a : 10;
  const totalRows = config.mode === "backend" ? config.totalRows : config.data.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  return {
    currentPage: 1,
    pageSize,
    sortBy: null,
    sortOrder: "none",
    globalSearch: "",
    columnFilters: {},
    totalRows,
    totalPages
  };
}
function recalcPages(state) {
  state.totalPages = Math.max(1, Math.ceil(state.totalRows / state.pageSize));
  if (state.currentPage > state.totalPages) {
    state.currentPage = state.totalPages;
  }
  if (state.currentPage < 1) {
    state.currentPage = 1;
  }
}
function cycleSortOrder(current) {
  switch (current) {
    case "none":
      return "asc";
    case "asc":
      return "desc";
    case "desc":
      return "none";
  }
}
function getComparator(column) {
  if (!column.sortable)
    return null;
  switch (column.type) {
    case "string":
      return (a, b) => {
        var _a, _b;
        const va = String((_a = a[column.key]) !== null && _a !== void 0 ? _a : "");
        const vb = String((_b = b[column.key]) !== null && _b !== void 0 ? _b : "");
        return va.localeCompare(vb, void 0, { sensitivity: "base" });
      };
    case "number":
      return (a, b) => {
        const va = parseFloat(a[column.key]) || 0;
        const vb = parseFloat(b[column.key]) || 0;
        return va - vb;
      };
    case "date":
      return (a, b) => {
        var _a, _b;
        const da = parseDate(String((_a = a[column.key]) !== null && _a !== void 0 ? _a : ""), column.dateFormat);
        const db = parseDate(String((_b = b[column.key]) !== null && _b !== void 0 ? _b : ""), column.dateFormat);
        const ta = da ? da.getTime() : 0;
        const tb = db ? db.getTime() : 0;
        return ta - tb;
      };
    case "custom":
      return column.comparator ? (a, b) => column.comparator(a[column.key], b[column.key]) : null;
  }
}
function matchesFilter(column, row, filterValue) {
  var _a, _b, _c;
  const lowerFilter = filterValue.toLowerCase();
  switch (column.type) {
    case "string": {
      const val = String((_a = row[column.key]) !== null && _a !== void 0 ? _a : "").toLowerCase();
      return val.indexOf(lowerFilter) !== -1;
    }
    case "number": {
      const val = String((_b = row[column.key]) !== null && _b !== void 0 ? _b : "").toLowerCase();
      return val.indexOf(lowerFilter) !== -1;
    }
    case "date": {
      const raw = String((_c = row[column.key]) !== null && _c !== void 0 ? _c : "");
      const dateCol = column;
      if (dateCol.displayFormat) {
        const parsed = parseDate(raw, dateCol.dateFormat);
        if (parsed) {
          const display = formatDate(parsed, dateCol.displayFormat);
          return display.toLowerCase().indexOf(lowerFilter) !== -1;
        }
      }
      return raw.toLowerCase().indexOf(lowerFilter) !== -1;
    }
    case "custom":
      return column.filterFn ? column.filterFn(row[column.key], filterValue, row) : false;
  }
}
function isSearchable(column) {
  if (column.searchable !== void 0)
    return column.searchable;
  return column.type !== "custom";
}
function getColumnAlign(column) {
  if (column.align)
    return column.align;
  return column.type === "number" ? "right" : "left";
}
function formatThousands(value) {
  const num = Number(value);
  if (isNaN(num))
    return String(value !== null && value !== void 0 ? value : "");
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
function renderCellValue(column, row, rowIndex) {
  var _a;
  switch (column.type) {
    case "string":
      return escapeHtml(row[column.key]);
    case "number": {
      if (column.thousandSeparator) {
        return escapeHtml(formatThousands(row[column.key]));
      }
      return escapeHtml(row[column.key]);
    }
    case "date": {
      const raw = String((_a = row[column.key]) !== null && _a !== void 0 ? _a : "");
      if (column.displayFormat) {
        const parsed = parseDate(raw, column.dateFormat);
        if (parsed)
          return escapeHtml(formatDate(parsed, column.displayFormat));
      }
      return escapeHtml(raw);
    }
    case "custom":
      return column.render(row, rowIndex);
  }
}
function processFrontendData(allData, columns, state, searchableColumnKeys) {
  let filtered = allData;
  if (state.globalSearch) {
    const searchCols = columns.filter((col) => {
      if (searchableColumnKeys && searchableColumnKeys.length > 0) {
        return searchableColumnKeys.includes(col.key) && isSearchable(col);
      }
      return isSearchable(col);
    });
    filtered = filtered.filter((row) => searchCols.some((col) => matchesFilter(col, row, state.globalSearch)));
  }
  const filterKeys = Object.keys(state.columnFilters);
  for (const key of filterKeys) {
    const filterVal = state.columnFilters[key];
    if (!filterVal)
      continue;
    const col = columns.find((c) => c.key === key);
    if (!col || !isSearchable(col))
      continue;
    filtered = filtered.filter((row) => matchesFilter(col, row, filterVal));
  }
  const filteredTotal = filtered.length;
  if (state.sortBy && state.sortOrder !== "none") {
    const sortCol = columns.find((c) => c.key === state.sortBy);
    if (sortCol) {
      const comparator = getComparator(sortCol);
      if (comparator) {
        const direction = state.sortOrder === "asc" ? 1 : -1;
        filtered = filtered.slice().sort((a, b) => direction * comparator(a, b));
      }
    }
  }
  const start = (state.currentPage - 1) * state.pageSize;
  const pageRows = filtered.slice(start, start + state.pageSize);
  return { pageRows, filteredTotal };
}
function emitStateChange(config, state) {
  const qs = buildQueryString(state);
  config.onStateChange(qs, { ...state });
}
var ICONS = {
  sortNone: '<svg class="mu-datatable__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 1.5L9 4.5"/><path d="M3 7.5L6 10.5L9 7.5"/></svg>',
  sortAsc: '<svg class="mu-datatable__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7.5L6 4.5L9 7.5"/></svg>',
  sortDesc: '<svg class="mu-datatable__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>',
  search: '<svg class="mu-datatable__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="5.5" r="4"/><path d="M8.5 8.5L13 13"/></svg>',
  chevronLeft: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L4 6L8 10"/></svg>',
  chevronRight: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2L8 6L4 10"/></svg>',
  loading: '<svg class="mu-datatable__spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8" opacity="0.25"/><path d="M10 2A8 8 0 0 1 18 10" stroke-linecap="round"/></svg>'
};
function cls(base, override) {
  return override ? base + " " + override : base;
}
var Renderer = class {
  constructor(root, config, callbacks) {
    this.container = null;
    this.tbodyEl = null;
    this.paginationEl = null;
    this.infoEl = null;
    this.loadingEl = null;
    this.searchInputEl = null;
    this.pageSizeSelectEl = null;
    this.columnFilterEls = /* @__PURE__ */ new Map();
    this.listeners = [];
    this.root = root;
    this.config = config;
    this.classes = config.classes || {};
    this.search = config.search || {};
    this.callbacks = callbacks;
  }
  /** Full initial render */
  render(state, rows) {
    var _a;
    this.cleanup();
    const container = document.createElement("div");
    container.className = cls("mu-datatable", this.classes.root);
    this.container = container;
    const showGlobalSearch = this.search.enabled !== false && this.search.mode !== "column";
    const showPageSize = this.config.showPageSize !== false;
    if (showGlobalSearch || showPageSize) {
      container.appendChild(this.buildToolbar(state, showGlobalSearch, showPageSize));
    }
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "mu-datatable__table-wrapper";
    tableWrapper.style.position = "relative";
    const table = document.createElement("table");
    table.className = cls("mu-datatable__table", this.classes.table);
    table.appendChild(this.buildHeader(state));
    this.tbodyEl = this.buildBody(state, rows);
    table.appendChild(this.tbodyEl);
    tableWrapper.appendChild(table);
    this.loadingEl = document.createElement("div");
    this.loadingEl.className = cls("mu-datatable__loading", this.classes.loading);
    this.loadingEl.innerHTML = ICONS.loading + "<span>" + escapeHtml((_a = this.config.loadingText) !== null && _a !== void 0 ? _a : "Loading...") + "</span>";
    this.loadingEl.style.display = "none";
    tableWrapper.appendChild(this.loadingEl);
    container.appendChild(tableWrapper);
    const footer = document.createElement("div");
    footer.className = "mu-datatable__footer";
    if (this.config.showInfo !== false) {
      this.infoEl = this.buildInfo(state);
      footer.appendChild(this.infoEl);
    }
    this.paginationEl = this.buildPagination(state);
    footer.appendChild(this.paginationEl);
    container.appendChild(footer);
    this.root.innerHTML = "";
    this.root.appendChild(container);
  }
  /** Update just the body rows, pagination, and info — avoids rebuilding headers */
  updateBody(state, rows) {
    if (!this.container) {
      this.render(state, rows);
      return;
    }
    if (this.tbodyEl) {
      const newTbody = this.buildBody(state, rows);
      this.tbodyEl.replaceWith(newTbody);
      this.tbodyEl = newTbody;
    }
    if (this.paginationEl) {
      const newPagination = this.buildPagination(state);
      this.paginationEl.replaceWith(newPagination);
      this.paginationEl = newPagination;
    }
    if (this.infoEl) {
      const newInfo = this.buildInfo(state);
      this.infoEl.replaceWith(newInfo);
      this.infoEl = newInfo;
    }
  }
  /** Full re-render (when columns change etc.) */
  fullRerender(state, rows) {
    this.render(state, rows);
  }
  /** Update sort indicators on headers without full re-render */
  updateSortIndicators(state) {
    if (!this.container)
      return;
    const headers = this.container.querySelectorAll(".mu-datatable__header-cell");
    headers.forEach((th) => {
      const key = th.dataset.columnKey;
      if (!key)
        return;
      th.classList.remove("mu-datatable__header-cell--sorted-asc", "mu-datatable__header-cell--sorted-desc");
      if (this.classes.headerCellActive) {
        th.classList.remove(...this.classes.headerCellActive.split(" "));
      }
      const iconEl = th.querySelector(".mu-datatable__sort-icon-wrapper");
      if (!iconEl)
        return;
      if (state.sortBy === key && state.sortOrder !== "none") {
        if (state.sortOrder === "asc") {
          th.classList.add("mu-datatable__header-cell--sorted-asc");
          iconEl.innerHTML = ICONS.sortAsc;
        } else {
          th.classList.add("mu-datatable__header-cell--sorted-desc");
          iconEl.innerHTML = ICONS.sortDesc;
        }
        if (this.classes.headerCellActive) {
          th.classList.add(...this.classes.headerCellActive.split(" "));
        }
      } else {
        if (th.classList.contains("mu-datatable__header-cell--sortable")) {
          iconEl.innerHTML = ICONS.sortNone;
        }
      }
    });
  }
  /** Show/hide loading overlay */
  setLoading(loading) {
    if (this.loadingEl) {
      this.loadingEl.style.display = loading ? "" : "none";
    }
  }
  /** Update config reference (for setColumns etc.) */
  updateConfig(config) {
    this.config = config;
    this.classes = config.classes || {};
    this.search = config.search || {};
  }
  /** Sync search input value with state (for programmatic setSearch) */
  syncSearchInput(value) {
    if (this.searchInputEl && this.searchInputEl.value !== value) {
      this.searchInputEl.value = value;
    }
  }
  /** Sync column filter input values with state */
  syncColumnFilter(key, value) {
    const input = this.columnFilterEls.get(key);
    if (input && input.value !== value) {
      input.value = value;
    }
  }
  /** Remove all DOM and event listeners */
  destroy() {
    this.cleanup();
    this.root.innerHTML = "";
  }
  // ============================================================
  // PRIVATE BUILDERS
  // ============================================================
  buildToolbar(state, showSearch, showPageSize) {
    var _a, _b;
    const toolbar = document.createElement("div");
    toolbar.className = cls("mu-datatable__toolbar", this.classes.toolbar);
    if (showSearch) {
      const searchWrap = document.createElement("div");
      searchWrap.className = "mu-datatable__search";
      searchWrap.innerHTML = ICONS.search;
      const input = document.createElement("input");
      input.type = "text";
      input.className = cls("mu-datatable__search-input", this.classes.searchInput);
      input.placeholder = (_a = this.search.placeholder) !== null && _a !== void 0 ? _a : "Search...";
      input.value = state.globalSearch;
      this.addListener(input, "input", () => {
        this.callbacks.onGlobalSearch(input.value);
      });
      searchWrap.appendChild(input);
      toolbar.appendChild(searchWrap);
      this.searchInputEl = input;
    }
    if (showPageSize) {
      const sizeWrap = document.createElement("div");
      sizeWrap.className = "mu-datatable__page-size";
      const label = document.createElement("label");
      label.textContent = "Show ";
      label.className = "mu-datatable__page-size-label";
      const select = document.createElement("select");
      select.className = cls("mu-datatable__page-size-select", this.classes.pageSizeSelect);
      const options = (_b = this.config.pageSizeOptions) !== null && _b !== void 0 ? _b : [10, 25, 50, 100];
      for (const opt of options) {
        const option = document.createElement("option");
        option.value = opt.toString();
        option.textContent = opt.toString();
        if (opt === state.pageSize)
          option.selected = true;
        select.appendChild(option);
      }
      this.addListener(select, "change", () => {
        this.callbacks.onPageSizeChange(parseInt(select.value, 10));
      });
      label.appendChild(select);
      const entriesSpan = document.createElement("span");
      entriesSpan.textContent = " entries";
      label.appendChild(entriesSpan);
      sizeWrap.appendChild(label);
      toolbar.appendChild(sizeWrap);
      this.pageSizeSelectEl = select;
    }
    return toolbar;
  }
  buildHeader(state) {
    var _a;
    const thead = document.createElement("thead");
    thead.className = cls("mu-datatable__header", this.classes.header);
    const tr = document.createElement("tr");
    tr.className = cls("mu-datatable__header-row", this.classes.headerRow);
    for (const col of this.config.columns) {
      const th = document.createElement("th");
      th.className = cls("mu-datatable__header-cell", this.classes.headerCell);
      th.dataset.columnKey = col.key;
      if (col.width)
        th.style.width = col.width;
      const align = getColumnAlign(col);
      if (align !== "left")
        th.style.textAlign = align;
      const labelSpan = document.createElement("span");
      labelSpan.className = "mu-datatable__header-label";
      labelSpan.textContent = col.label;
      th.appendChild(labelSpan);
      if (col.sortable) {
        th.classList.add("mu-datatable__header-cell--sortable");
        th.setAttribute("role", "button");
        th.setAttribute("tabindex", "0");
        th.setAttribute("aria-label", "Sort by " + col.label);
        const iconWrap = document.createElement("span");
        iconWrap.className = "mu-datatable__sort-icon-wrapper";
        if (state.sortBy === col.key && state.sortOrder !== "none") {
          iconWrap.innerHTML = state.sortOrder === "asc" ? ICONS.sortAsc : ICONS.sortDesc;
          th.classList.add("mu-datatable__header-cell--sorted-" + state.sortOrder);
          if (this.classes.headerCellActive) {
            th.classList.add(...this.classes.headerCellActive.split(" "));
          }
        } else {
          iconWrap.innerHTML = ICONS.sortNone;
        }
        th.appendChild(iconWrap);
        const key = col.key;
        this.addListener(th, "click", () => this.callbacks.onSort(key));
        this.addListener(th, "keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.callbacks.onSort(key);
          }
        });
      }
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    const searchMode = (_a = this.search.mode) !== null && _a !== void 0 ? _a : "global";
    if (searchMode === "column" || searchMode === "both") {
      const filterRow = document.createElement("tr");
      filterRow.className = "mu-datatable__filter-row";
      for (const col of this.config.columns) {
        const td = document.createElement("td");
        td.className = "mu-datatable__filter-cell";
        if (isSearchable(col)) {
          const input = document.createElement("input");
          input.type = "text";
          input.className = cls("mu-datatable__column-filter", this.classes.columnFilter);
          input.placeholder = "Filter...";
          input.value = state.columnFilters[col.key] || "";
          const key = col.key;
          this.addListener(input, "input", () => {
            this.callbacks.onColumnFilter(key, input.value);
          });
          td.appendChild(input);
          this.columnFilterEls.set(col.key, input);
        }
        filterRow.appendChild(td);
      }
      thead.appendChild(filterRow);
    }
    return thead;
  }
  buildBody(state, rows) {
    var _a;
    const tbody = document.createElement("tbody");
    tbody.className = cls("mu-datatable__body", this.classes.body);
    if (rows.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.className = cls("mu-datatable__empty", this.classes.empty);
      td.colSpan = this.config.columns.length;
      td.textContent = (_a = this.config.emptyText) !== null && _a !== void 0 ? _a : "No data available";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return tbody;
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const tr = document.createElement("tr");
      let rowClass = "mu-datatable__row";
      if (this.classes.row)
        rowClass += " " + this.classes.row;
      if (i % 2 === 1) {
        rowClass += " mu-datatable__row--even";
        if (this.classes.rowEven)
          rowClass += " " + this.classes.rowEven;
      }
      tr.className = rowClass;
      for (const col of this.config.columns) {
        const td = document.createElement("td");
        td.className = cls("mu-datatable__cell", this.classes.cell);
        const align = getColumnAlign(col);
        if (align !== "left")
          td.style.textAlign = align;
        td.innerHTML = renderCellValue(col, row, i);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    return tbody;
  }
  buildPagination(state) {
    const container = document.createElement("div");
    container.className = cls("mu-datatable__pagination", this.classes.pagination);
    if (state.totalPages <= 1)
      return container;
    const prevBtn = this.createPageButton(ICONS.chevronLeft, state.currentPage - 1, state.currentPage <= 1);
    prevBtn.setAttribute("aria-label", "Previous page");
    container.appendChild(prevBtn);
    const pages = this.getPageNumbers(state.currentPage, state.totalPages);
    for (const p of pages) {
      if (p === -1) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "mu-datatable__page-ellipsis";
        ellipsis.textContent = "...";
        container.appendChild(ellipsis);
      } else {
        const btn = this.createPageButton(p.toString(), p, false);
        if (p === state.currentPage) {
          btn.classList.add("mu-datatable__page-btn--active");
          if (this.classes.pageButtonActive) {
            btn.classList.add(...this.classes.pageButtonActive.split(" "));
          }
          btn.setAttribute("aria-current", "page");
        }
        container.appendChild(btn);
      }
    }
    const nextBtn = this.createPageButton(ICONS.chevronRight, state.currentPage + 1, state.currentPage >= state.totalPages);
    nextBtn.setAttribute("aria-label", "Next page");
    container.appendChild(nextBtn);
    return container;
  }
  createPageButton(content, page, disabled) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = cls("mu-datatable__page-btn", this.classes.pageButton);
    btn.innerHTML = content;
    if (disabled) {
      btn.classList.add("mu-datatable__page-btn--disabled");
      btn.disabled = true;
    } else {
      this.addListener(btn, "click", () => this.callbacks.onPageChange(page));
    }
    return btn;
  }
  /** Generate page numbers with ellipsis. Returns -1 for ellipsis positions. */
  getPageNumbers(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [];
    const around = 1;
    pages.push(1);
    const rangeStart = Math.max(2, current - around);
    const rangeEnd = Math.min(total - 1, current + around);
    if (rangeStart > 2) {
      pages.push(-1);
    }
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    if (rangeEnd < total - 1) {
      pages.push(-1);
    }
    pages.push(total);
    return pages;
  }
  buildInfo(state) {
    const info = document.createElement("div");
    info.className = cls("mu-datatable__info", this.classes.info);
    if (state.totalRows === 0) {
      info.textContent = "No entries";
    } else {
      const start = (state.currentPage - 1) * state.pageSize + 1;
      const end = Math.min(state.currentPage * state.pageSize, state.totalRows);
      info.textContent = "Showing " + start + "-" + end + " of " + state.totalRows + " entries";
    }
    return info;
  }
  // ============================================================
  // EVENT LISTENER MANAGEMENT
  // ============================================================
  addListener(el, type, handler) {
    el.addEventListener(type, handler);
    this.listeners.push({ el, type, handler });
  }
  cleanup() {
    for (const { el, type, handler } of this.listeners) {
      el.removeEventListener(type, handler);
    }
    this.listeners = [];
    this.columnFilterEls.clear();
    this.searchInputEl = null;
    this.pageSizeSelectEl = null;
    this.tbodyEl = null;
    this.paginationEl = null;
    this.infoEl = null;
    this.loadingEl = null;
  }
};
var DataTable = class _DataTable {
  constructor(config) {
    var _a, _b;
    this.destroyed = false;
    this.debouncedColumnFilters = /* @__PURE__ */ new Map();
    this.config = config;
    this.data = config.data.slice();
    this.state = createState(config);
    const el = typeof config.el === "string" ? document.querySelector(config.el) : config.el;
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error("mundane-ui: Invalid mount element. Provide a valid CSS selector or HTMLElement.");
    }
    this.rootEl = el;
    const searchDelay = (_b = (_a = config.search) === null || _a === void 0 ? void 0 : _a.debounce) !== null && _b !== void 0 ? _b : 300;
    this.debouncedGlobalSearch = debounce((value) => {
      this.state.globalSearch = value;
      this.state.currentPage = 1;
      this.onStateChanged();
    }, searchDelay);
    const callbacks = {
      onSort: (key) => this.handleSort(key),
      onPageChange: (page) => this.handlePageChange(page),
      onPageSizeChange: (size) => this.handlePageSizeChange(size),
      onGlobalSearch: (value) => this.debouncedGlobalSearch(value),
      onColumnFilter: (key, value) => this.handleColumnFilter(key, value)
    };
    this.renderer = new Renderer(this.rootEl, config, callbacks);
    this.renderCurrentState();
  }
  /** Factory method — the public way to create a DataTable */
  static create(config) {
    if (!config.el)
      throw new Error('mundane-ui: "el" is required.');
    if (!config.columns || config.columns.length === 0)
      throw new Error('mundane-ui: "columns" is required and must not be empty.');
    if (config.mode === "backend" && config.totalRows === void 0) {
      throw new Error('mundane-ui: "totalRows" is required in backend mode.');
    }
    if (config.mode === "backend" && !config.onStateChange) {
      throw new Error('mundane-ui: "onStateChange" callback is required in backend mode.');
    }
    return new _DataTable(config);
  }
  // ============================================================
  // PUBLIC API
  // ============================================================
  setData(data, totalRows) {
    this.ensureNotDestroyed();
    this.data = data.slice();
    if (this.config.mode === "backend") {
      if (totalRows !== void 0) {
        this.state.totalRows = totalRows;
      }
      recalcPages(this.state);
      this.renderer.setLoading(false);
    } else {
      this.state.totalRows = data.length;
      recalcPages(this.state);
    }
    this.renderCurrentState();
  }
  updateRow(index, rowData) {
    this.ensureNotDestroyed();
    if (index < 0 || index >= this.data.length)
      return;
    this.data[index] = { ...this.data[index], ...rowData };
    if (this.config.mode === "frontend") {
      this.renderCurrentState();
    } else {
      this.renderCurrentState();
    }
  }
  addRow(rowData, index) {
    this.ensureNotDestroyed();
    if (index !== void 0 && index >= 0 && index <= this.data.length) {
      this.data.splice(index, 0, rowData);
    } else {
      this.data.push(rowData);
    }
    if (this.config.mode === "frontend") {
      this.state.totalRows = this.data.length;
      recalcPages(this.state);
    }
    this.renderCurrentState();
  }
  removeRow(index) {
    this.ensureNotDestroyed();
    if (index < 0 || index >= this.data.length)
      return;
    this.data.splice(index, 1);
    if (this.config.mode === "frontend") {
      this.state.totalRows = this.data.length;
      recalcPages(this.state);
    }
    this.renderCurrentState();
  }
  setPageSize(size) {
    this.ensureNotDestroyed();
    this.state.pageSize = size;
    this.state.currentPage = 1;
    recalcPages(this.state);
    this.onStateChanged();
  }
  goToPage(page) {
    this.ensureNotDestroyed();
    if (page < 1 || page > this.state.totalPages)
      return;
    this.state.currentPage = page;
    this.onStateChanged();
  }
  setSearch(value) {
    this.ensureNotDestroyed();
    this.debouncedGlobalSearch.cancel();
    this.state.globalSearch = value;
    this.state.currentPage = 1;
    this.renderer.syncSearchInput(value);
    this.onStateChanged();
  }
  setColumnFilter(columnKey, value) {
    this.ensureNotDestroyed();
    const debouncedFn = this.debouncedColumnFilters.get(columnKey);
    if (debouncedFn)
      debouncedFn.cancel();
    this.state.columnFilters[columnKey] = value;
    this.state.currentPage = 1;
    this.renderer.syncColumnFilter(columnKey, value);
    this.onStateChanged();
  }
  clearFilters() {
    this.ensureNotDestroyed();
    this.debouncedGlobalSearch.cancel();
    this.state.globalSearch = "";
    this.state.columnFilters = {};
    this.state.currentPage = 1;
    this.renderer.syncSearchInput("");
    this.onStateChanged();
  }
  setLoading(loading) {
    this.ensureNotDestroyed();
    this.renderer.setLoading(loading);
  }
  getState() {
    return { ...this.state };
  }
  getQueryString() {
    return buildQueryString(this.state);
  }
  setColumns(columns) {
    this.ensureNotDestroyed();
    this.config = { ...this.config, columns };
    this.renderer.updateConfig(this.config);
    this.renderer.fullRerender(this.state, this.getCurrentPageRows());
  }
  destroy() {
    if (this.destroyed)
      return;
    this.destroyed = true;
    this.debouncedGlobalSearch.cancel();
    for (const fn of this.debouncedColumnFilters.values()) {
      fn.cancel();
    }
    this.renderer.destroy();
  }
  refresh() {
    this.ensureNotDestroyed();
    this.renderer.fullRerender(this.state, this.getCurrentPageRows());
  }
  // ============================================================
  // INTERNAL
  // ============================================================
  handleSort(columnKey) {
    if (this.state.sortBy === columnKey) {
      this.state.sortOrder = cycleSortOrder(this.state.sortOrder);
      if (this.state.sortOrder === "none") {
        this.state.sortBy = null;
      }
    } else {
      this.state.sortBy = columnKey;
      this.state.sortOrder = "asc";
    }
    this.onStateChanged();
  }
  handlePageChange(page) {
    if (page < 1 || page > this.state.totalPages)
      return;
    this.state.currentPage = page;
    this.onStateChanged();
  }
  handlePageSizeChange(size) {
    this.state.pageSize = size;
    this.state.currentPage = 1;
    recalcPages(this.state);
    this.onStateChanged();
  }
  handleColumnFilter(columnKey, value) {
    var _a, _b;
    let debouncedFn = this.debouncedColumnFilters.get(columnKey);
    if (!debouncedFn) {
      const delay = (_b = (_a = this.config.search) === null || _a === void 0 ? void 0 : _a.debounce) !== null && _b !== void 0 ? _b : 300;
      debouncedFn = debounce((val) => {
        this.state.columnFilters[columnKey] = val;
        this.state.currentPage = 1;
        this.onStateChanged();
      }, delay);
      this.debouncedColumnFilters.set(columnKey, debouncedFn);
    }
    debouncedFn(value);
  }
  /** Called after any state change. Routes to frontend or backend logic. */
  onStateChanged() {
    if (this.config.mode === "backend") {
      this.renderer.setLoading(true);
      emitStateChange(this.config, this.state);
      this.renderer.updateBody(this.state, this.data);
      this.renderer.updateSortIndicators(this.state);
    } else {
      this.renderCurrentState();
    }
  }
  /** Compute visible rows and render */
  renderCurrentState() {
    const rows = this.getCurrentPageRows();
    this.renderer.updateBody(this.state, rows);
    this.renderer.updateSortIndicators(this.state);
  }
  /** Get the rows that should be displayed on the current page */
  getCurrentPageRows() {
    var _a;
    if (this.config.mode === "frontend") {
      const searchableColumns = (_a = this.config.search) === null || _a === void 0 ? void 0 : _a.searchableColumns;
      const result = processFrontendData(this.data, this.config.columns, this.state, searchableColumns);
      this.state.totalRows = result.filteredTotal;
      recalcPages(this.state);
      return result.pageRows;
    } else {
      return this.data;
    }
  }
  ensureNotDestroyed() {
    if (this.destroyed) {
      throw new Error("mundane-ui: This DataTable instance has been destroyed.");
    }
  }
};
export {
  DataTable
};
//# sourceMappingURL=mundane-ui.js.map
