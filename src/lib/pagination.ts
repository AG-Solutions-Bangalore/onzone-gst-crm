/**
 * Shared server-driven pagination + search primitives.
 *
 * BACKEND STATUS (verified live 2026-10-07): the admin API currently IGNORES
 * `page` / `per_page` / `search` on every list endpoint and always returns
 * the full list. So the `*Page()` fetchers below send the params (ready for
 * the day the backend honours them) and transparently apply the same
 * search/slice on the returned rows as a fallback. When the backend starts
 * returning a Laravel paginator (`{data, current_page, per_page, total,
 * last_page}`), the fallback is skipped automatically — no UI change needed.
 *
 * Backend contract needed for true server-side paging:
 *   GET <list>?page=1&per_page=20&search=rockstar
 *   → { data: [...], current_page, per_page, total, last_page }
 */

/** Params sent to the server on every paged list request. */
export type ListQueryParams = {
  /** 1-based page number. */
  page?: number
  /** Rows per page. */
  perPage?: number
  /** Free-text query (GSTIN, name, brand, town…). */
  search?: string
}

/** One page of rows, however it was produced. */
export type PagedResult<T> = {
  rows: T[]
  /** Total rows matching the query (all pages). */
  total: number
  /** Echo of the requested 1-based page. */
  page: number
  perPage: number
  pageCount: number
}

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
/** Search input debounce — avoids a request per keystroke. */
export const SEARCH_DEBOUNCE_MS = 400

/** Laravel paginator envelope. */
export type PaginatorPayload<T> = {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export function isPaginatorPayload<T>(value: unknown): value is PaginatorPayload<T> {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.data) &&
    typeof v.total === "number" &&
    typeof v.current_page === "number"
  )
}

/** `?page=&per_page=&search=` — omitted when empty so old servers ignore it. */
export function toListQueryParams(params: ListQueryParams): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (params.page && params.page > 0) out.page = params.page
  if (params.perPage && params.perPage > 0) out.per_page = params.perPage
  const search = params.search?.trim()
  if (search) out.search = search
  return out
}

function getField(item: unknown, field: string): unknown {
  if (typeof item !== "object" || item === null) return undefined
  return (item as Record<string, unknown>)[field]
}

/** Case-insensitive substring match across the given fields. */
export function matchesSearch<T>(item: T, query: string, fields: (keyof T)[]): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return fields.some((f) => {
    const value = getField(item, f as string)
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(q)
  })
}

/**
 * Transparent fallback while the backend ignores paging params: filter by
 * `search` over `fields`, then slice the requested page. Pure — safe in
 * `useMemo`. Returns rows + total so callers can build a `PagedResult`.
 */
export function applyLocalPaging<T>(
  all: T[],
  params: ListQueryParams,
  fields: (keyof T)[],
): { rows: T[]; total: number; page: number; perPage: number } {
  const perPage = params.perPage && params.perPage > 0 ? params.perPage : DEFAULT_PAGE_SIZE
  const total = params.search?.trim()
    ? all.filter((item) => matchesSearch(item, params.search as string, fields))
    : all
  const pageCount = Math.max(1, Math.ceil(total.length / perPage))
  const page = Math.min(Math.max(params.page ?? 1, 1), pageCount)
  const start = (page - 1) * perPage
  return { rows: total.slice(start, start + perPage), total: total.length, page, perPage }
}

export function toPagedResult<T>(args: {
  rows: T[]
  total: number
  page: number
  perPage: number
}): PagedResult<T> {
  const perPage = args.perPage > 0 ? args.perPage : DEFAULT_PAGE_SIZE
  return {
    rows: args.rows,
    total: args.total,
    page: args.page,
    perPage,
    pageCount: Math.max(1, Math.ceil(args.total / perPage)),
  }
}

/** Inclusive 1-based range shown in the footer, e.g. "Showing 1–10 of 475". */
export function pageRange(page: number, perPage: number, total: number): [number, number] {
  if (total === 0) return [0, 0]
  const start = (page - 1) * perPage + 1
  return [start, Math.min(start + perPage - 1, total)]
}
