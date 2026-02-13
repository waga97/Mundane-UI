/** Escape HTML special characters to prevent XSS */
export function escapeHtml(str: unknown): string {
  const s = String(str ?? '')
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Simple debounce */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  } as T & { cancel(): void }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  return debounced
}

/** Generate a short unique ID for DOM element identification */
let idCounter = 0
export function generateId(): string {
  return 'mu-' + (++idCounter) + '-' + Math.random().toString(36).substring(2, 7)
}

// ============================================================
// DATE PARSING
// ============================================================

interface DateParts {
  YYYY: number
  MM: number
  DD: number
  HH: number
  mm: number
  ss: number
}

const DATE_TOKENS: Record<string, string> = {
  'YYYY': '(\\d{4})',
  'MM': '(\\d{2})',
  'DD': '(\\d{2})',
  'HH': '(\\d{2})',
  'mm': '(\\d{2})',
  'ss': '(\\d{2})',
}

/** Build a regex and token order from a date format string */
function buildDateRegex(format: string): { regex: RegExp; tokens: string[] } {
  const tokens: string[] = []
  // Escape regex special chars in the format, then replace tokens
  let pattern = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Sort tokens by length descending so YYYY is matched before MM etc.
  const sortedTokenKeys = Object.keys(DATE_TOKENS).sort((a, b) => b.length - a.length)

  for (const token of sortedTokenKeys) {
    // Use a global replace to handle the escaped version too
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (pattern.includes(escaped)) {
      // Replace only the first occurrence for ordered capture
      const idx = pattern.indexOf(escaped)
      if (idx !== -1) {
        tokens.push(token)
        pattern = pattern.substring(0, idx) + DATE_TOKENS[token] + pattern.substring(idx + escaped.length)
      }
    }
  }

  return { regex: new RegExp('^' + pattern + '$'), tokens }
}

// Cache compiled date regexes
const dateRegexCache = new Map<string, { regex: RegExp; tokens: string[] }>()

function getDateRegex(format: string): { regex: RegExp; tokens: string[] } {
  let cached = dateRegexCache.get(format)
  if (!cached) {
    cached = buildDateRegex(format)
    dateRegexCache.set(format, cached)
  }
  return cached
}

/** Parse a date string using a format string. Returns null if invalid. */
export function parseDate(value: string, format: string): Date | null {
  if (!value || !format) return null

  const { regex, tokens } = getDateRegex(format)
  const match = value.match(regex)
  if (!match) return null

  const parts: DateParts = { YYYY: 1970, MM: 1, DD: 1, HH: 0, mm: 0, ss: 0 }

  for (let i = 0; i < tokens.length; i++) {
    const num = parseInt(match[i + 1], 10)
    if (isNaN(num)) return null
    parts[tokens[i] as keyof DateParts] = num
  }

  const date = new Date(parts.YYYY, parts.MM - 1, parts.DD, parts.HH, parts.mm, parts.ss)

  // Validate the date is real (e.g., Feb 30 would roll over)
  if (
    date.getFullYear() !== parts.YYYY ||
    date.getMonth() !== parts.MM - 1 ||
    date.getDate() !== parts.DD
  ) {
    return null
  }

  return date
}

/** Format a Date object using a format string */
export function formatDate(date: Date, format: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return format
    .replace('YYYY', date.getFullYear().toString())
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()))
}
