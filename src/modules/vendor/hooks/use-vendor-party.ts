import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteVendorGstDetails,
  fetchVendorGstDetailsList,
  uploadVendorGstDetailsFile,
  type PaginationParams,
} from "@/modules/vendor/api/vendor-party.api.ts"
import { invalidateVendorLists, REFERENCE_DEFAULTS } from "@/modules/vendor/hooks/query-keys.ts"
import {
  applyLocalPaging,
  type PagedResult,
} from "@/lib/pagination.ts"
import type { VendorPartyDetails } from "@/modules/vendor/types/vendor.types.ts"

/** Fields searched by the line-items search box. */
export const PARTY_SEARCH_FIELDS: (keyof VendorPartyDetails)[] = [
  "vendor_gst",
  "party_name",
  "brand",
  "town",
  "district",
  "belt",
  "address",
]

/**
 * Party/brand sales rows — several per GSTIN
 * (`GET fetch-vendor-gst-details-list`). Accepts query params.
 */
export function useVendorGstDetailsList(params?: PaginationParams) {
  return useQuery({
    queryKey: ["vendor-gst-details-list", params],
    queryFn: () => fetchVendorGstDetailsList(params),
    ...REFERENCE_DEFAULTS,
  })
}

/** Party/brand rows for one GSTIN, looked up from the cached list. */
export function useVendorPartyRows(gstin: string | undefined) {
  const detailsQuery = useVendorGstDetailsList()
  const cleanGstin = gstin?.trim().toUpperCase()
  const rows =
    detailsQuery.data?.filter(
      (r) => r.vendor_gst?.trim().toUpperCase() === cleanGstin,
    ) ?? []
  return { ...detailsQuery, rows }
}

export type VendorPartyViewParams = {
  search?: string
  /** 1-based page number. */
  page?: number
  perPage?: number
}

/**
 * Server-driven line-items view: free-text search, then one page.
 * Same seam as `useVendorProfilesView` — see `src/lib/pagination.ts` for
 * the backend contract needed for true server-side paging.
 */
export function useVendorPartyView(params: VendorPartyViewParams = {}) {
  const { search = "", page = 1, perPage = 10 } = params

  const partyParams = React.useMemo<PaginationParams>(
    () => ({
      page,
      limit: perPage,
      search: search.trim() || undefined,
    }),
    [page, perPage, search],
  )

  const listQuery = useVendorGstDetailsList(partyParams)
  const serverTotal = (
    listQuery.data as unknown as { __serverTotal?: number }
  )?.__serverTotal

  const searched = React.useMemo(() => {
    if (serverTotal !== undefined) {
      return listQuery.data ?? []
    }
    const q = search.trim().toLowerCase()
    if (!q) return listQuery.data ?? []
    return (listQuery.data ?? []).filter((r) =>
      PARTY_SEARCH_FIELDS.some((f) =>
        String(r[f] ?? "").toLowerCase().includes(q),
      ),
    )
  }, [listQuery.data, search, serverTotal])

  const paged: PagedResult<VendorPartyDetails> = React.useMemo(() => {
    const safePerPage = perPage > 0 ? perPage : 10
    if (serverTotal !== undefined) {
      return {
        rows: searched,
        total: serverTotal,
        page,
        perPage: safePerPage,
        pageCount: Math.max(1, Math.ceil(serverTotal / safePerPage)),
      }
    }
    const sliced = applyLocalPaging(searched, { page, perPage: safePerPage }, [])
    return {
      rows: sliced.rows,
      total: sliced.total,
      page: sliced.page,
      perPage: sliced.perPage,
      pageCount: Math.max(1, Math.ceil(sliced.total / sliced.perPage)),
    }
  }, [searched, page, perPage, serverTotal])

  return {
    ...paged,
    /** All searched rows (unpaged) — e.g. for Excel export. */
    all: searched,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    isFetching: listQuery.isFetching,
    refetch: listQuery.refetch,
  }
}

/** `POST upload-vendor-gst-details-file` — party/brand import. */
export function useUploadVendorGstDetailsFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadVendorGstDetailsFile(file),
    onSuccess: () => {
      invalidateVendorLists(queryClient)
    },
  })
}

/**
 * `DELETE delete-vendor-gst-details` — delete one party-details row by `id`,
 * then invalidate the vendor lists so the table refreshes.
 */
export function useDeleteVendorGstDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id?: number | string) => deleteVendorGstDetails(id),
    onSuccess: () => {
      invalidateVendorLists(queryClient)
    },
  })
}
