import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchVendorGstSyncDetailsById,
  fetchVendorGstSyncDetailsList,
  updateVendorGstDetails,
  type PaginationParams,
} from "@/modules/vendor/api/vendor-sync.api.ts"
import { invalidateVendorLists, REFERENCE_DEFAULTS } from "@/modules/vendor/hooks/query-keys.ts"
import { useVendorGstList } from "@/modules/vendor/hooks/use-vendor-registry.ts"
import {
  DEFAULT_PAGE_SIZE,
  toPagedResult,
  type PagedResult,
} from "@/lib/pagination.ts"
import type {
  UpdateVendorGstDetailsPayload,
  VendorGstSyncDetails,
  VendorTableRow,
} from "@/modules/vendor/types/vendor.types.ts"

/** Fields searched by the registry search box. */
export const PROFILE_SEARCH_FIELDS: (keyof VendorGstSyncDetails)[] = [
  "vendor_gst",
  "business_name",
  "legal_name",
  "pan_number",
  "email",
  "mobile",
  "address",
]

/**
 * GST profiles — the source for dashboard / registry / details UI
 * (`GET fetch-vendor-gst-sync-details-list`). Accepts query params.
 */
export function useVendorGstSyncDetailsList(params?: PaginationParams) {
  return useQuery({
    queryKey: ["vendor-gst-sync-details-list", params],
    queryFn: () => fetchVendorGstSyncDetailsList(params),
    ...REFERENCE_DEFAULTS,
  })
}

/** Single GST profile looked up from the cached sync list. */
export function useVendorGstDetails(gstin: string | undefined) {
  const syncQuery = useVendorGstSyncDetailsList()
  const cleanGstin = gstin?.trim().toUpperCase()
  const vendor =
    syncQuery.data?.find(
      (v) => v.vendor_gst?.trim().toUpperCase() === cleanGstin,
    ) ?? null
  return { ...syncQuery, vendor }
}

/**
 * Full profile + party rows for one sync record
 * (`GET fetch-vendor-gst-sync-details-by-id/{id}`).
 */
export function useVendorGstSyncDetailsById(id: number | string | undefined) {
  return useQuery({
    queryKey: ["vendor-gst-sync-details", id],
    queryFn: () => fetchVendorGstSyncDetailsById(id as number | string),
    enabled: id !== undefined && id !== null && id !== "",
    ...REFERENCE_DEFAULTS,
  })
}

/**
 * `POST updateVendorGSTDetails {vendor_gst_tag, limit}` — backend refresh,
 * then invalidate lists.
 */
export function useUpdateVendorGstDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateVendorGstDetailsPayload) =>
      updateVendorGstDetails(payload),
    onSuccess: () => {
      invalidateVendorLists(queryClient)
    },
  })
}

export type ProfileStatusFilter = "all" | "active" | "attention"
export type ProfileTypeFilter = "all" | "Regular" | "Composition"

export type VendorProfilesViewParams = {
  search?: string
  status?: ProfileStatusFilter
  type?: ProfileTypeFilter
  /** 1-based page number. */
  page?: number
  perPage?: number
}

/**
 * Server-driven registry view: joins fetch status, applies status/type
 * filters + free-text search, then slices one page.
 *
 * Data still comes from the cached full lists (the backend ignores paging
 * params — see `src/lib/pagination.ts`), but this hook is the single seam:
 * the day the backend honours `?page=&per_page=&search=`, only this hook's
 * internals change — callers keep using `{rows, total, pageCount, counts}`.
 */
export function useVendorProfilesView(params: VendorProfilesViewParams = {}) {
  const {
    search = "",
    status = "all",
    type = "all",
    page = 1,
    perPage = DEFAULT_PAGE_SIZE,
  } = params

  const syncParams = React.useMemo<PaginationParams>(
    () => ({
      page,
      limit: perPage,
      search: search.trim() || undefined,
    }),
    [page, perPage, search],
  )

  const registryQuery = useVendorGstList()
  const syncQuery = useVendorGstSyncDetailsList(syncParams)

  const serverTotal = (
    syncQuery.data as unknown as { __serverTotal?: number }
  )?.__serverTotal

  const joined = React.useMemo<VendorTableRow[]>(() => {
    const fetchByGstin = new Map(
      (registryQuery.data ?? []).map((v) => [v.vendor_gst, v.vendor_gst_status]),
    )
    return (syncQuery.data ?? []).map((v) => ({
      ...v,
      fetchStatus: fetchByGstin.get(v.vendor_gst),
    }))
  }, [registryQuery.data, syncQuery.data])

  const filtered = React.useMemo(() => {
    if (serverTotal !== undefined) {
      return joined
    }
    const q = search.trim().toLowerCase()
    return joined.filter((r) => {
      if (status === "active" && r.gstin_status !== "Active") return false
      if (status === "attention" && r.gstin_status === "Active") return false
      if (type !== "all" && r.taxpayer_type !== type) return false
      if (!q) return true
      return PROFILE_SEARCH_FIELDS.some((f) =>
        String(r[f] ?? "").toLowerCase().includes(q),
      )
    })
  }, [joined, search, serverTotal, status, type])

  const counts = React.useMemo(() => {
    if (serverTotal !== undefined) {
      const active = joined.filter((r) => r.gstin_status === "Active").length
      return { all: serverTotal, active, attention: Math.max(0, serverTotal - active) }
    }
    const q = search.trim().toLowerCase()
    const searched = q
      ? joined.filter((r) =>
          PROFILE_SEARCH_FIELDS.some((f) =>
            String(r[f] ?? "").toLowerCase().includes(q),
          ),
        )
      : joined
    const active = searched.filter((r) => r.gstin_status === "Active").length
    return { all: searched.length, active, attention: searched.length - active }
  }, [joined, search, serverTotal])

  const paged: PagedResult<VendorTableRow> = React.useMemo(() => {
    const safePerPage = perPage > 0 ? perPage : DEFAULT_PAGE_SIZE
    if (serverTotal !== undefined) {
      const pageCount = Math.max(1, Math.ceil(serverTotal / safePerPage))
      return {
        rows: filtered,
        total: serverTotal,
        page,
        perPage: safePerPage,
        pageCount,
      }
    }
    // Fallback: client slice of filtered rows
    const pageCount = Math.max(1, Math.ceil(filtered.length / safePerPage))
    const safePage = Math.min(Math.max(page, 1), pageCount)
    const start = (safePage - 1) * safePerPage
    return toPagedResult({
      rows: filtered.slice(start, start + safePerPage),
      total: filtered.length,
      page: safePage,
      perPage: safePerPage,
    })
  }, [filtered, page, perPage, serverTotal])

  function refetch() {
    return Promise.all([registryQuery.refetch(), syncQuery.refetch()])
  }

  return {
    ...paged,
    /** All filtered rows (unpaged) — e.g. for Excel export. */
    all: filtered,
    counts,
    isLoading: registryQuery.isLoading || syncQuery.isLoading,
    isError: registryQuery.isError || syncQuery.isError,
    isFetching: registryQuery.isFetching || syncQuery.isFetching,
    refetch,
  }
}
