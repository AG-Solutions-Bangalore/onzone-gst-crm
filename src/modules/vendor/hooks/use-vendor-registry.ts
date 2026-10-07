import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchVendorGstList,
  fetchVendorGstTags,
  uploadVendorGstFile,
  type PaginationParams,
} from "@/modules/vendor/api/vendor-registry.api.ts"
import { invalidateVendorLists, REFERENCE_DEFAULTS } from "@/modules/vendor/hooks/query-keys.ts"
import {
  applyLocalPaging,
  DEFAULT_PAGE_SIZE,
  type PagedResult,
} from "@/lib/pagination.ts"
import type { VendorGst } from "@/modules/vendor/types/vendor.types.ts"

/** GSTIN registry (`GET fetch-vendor-gst-list`). */
export function useVendorGstList(params?: PaginationParams) {
  return useQuery({
    queryKey: ["vendor-gst-list", params],
    queryFn: () => fetchVendorGstList(params),
    ...REFERENCE_DEFAULTS,
  })
}

/** Tag dropdown source for the sync trigger (`GET getVendorGSTTag`). */
export function useVendorGstTags() {
  return useQuery({
    queryKey: ["vendor-gst-tags"],
    queryFn: fetchVendorGstTags,
    ...REFERENCE_DEFAULTS,
  })
}

/** `POST upload-vendor-gst-file` — invalidates vendor lists on success. */
export function useUploadVendorGstFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadVendorGstFile(file),
    onSuccess: () => {
      invalidateVendorLists(queryClient)
    },
  })
}

export type VendorGstRegistryViewParams = {
  search?: string
  status?: "all" | "Finished" | "Pending"
  page?: number
  perPage?: number
}

/**
 * Registry view for Vendor GST list: supports debounced search,
 * status filter ("all" | "Finished" | "Pending"), and pagination.
 */
export function useVendorGstRegistryView(params: VendorGstRegistryViewParams = {}) {
  const { search = "", status = "all", page = 1, perPage = DEFAULT_PAGE_SIZE } = params

  const queryParams = React.useMemo<PaginationParams>(
    () => ({
      page,
      limit: perPage,
      search: search.trim() || undefined,
    }),
    [page, perPage, search],
  )

  const listQuery = useVendorGstList(queryParams)
  const serverTotal = (
    listQuery.data as unknown as { __serverTotal?: number }
  )?.__serverTotal

  const filtered = React.useMemo(() => {
    if (serverTotal !== undefined) {
      return listQuery.data ?? []
    }
    const q = search.trim().toLowerCase()
    return (listQuery.data ?? []).filter((r) => {
      if (status !== "all" && r.vendor_gst_status !== status) return false
      if (!q) return true
      return (
        r.vendor_gst.toLowerCase().includes(q) ||
        (r.vendor_gst_tag ?? "").toLowerCase().includes(q)
      )
    })
  }, [listQuery.data, search, serverTotal, status])

  const counts = React.useMemo(() => {
    const allItems = listQuery.data ?? []
    const finished = allItems.filter((r) => r.vendor_gst_status === "Finished").length
    const pending = allItems.filter((r) => r.vendor_gst_status === "Pending").length
    return { all: allItems.length, finished, pending }
  }, [listQuery.data])

  const paged: PagedResult<VendorGst> = React.useMemo(() => {
    const safePerPage = perPage > 0 ? perPage : DEFAULT_PAGE_SIZE
    if (serverTotal !== undefined) {
      return {
        rows: filtered,
        total: serverTotal,
        page,
        perPage: safePerPage,
        pageCount: Math.max(1, Math.ceil(serverTotal / safePerPage)),
      }
    }
    const sliced = applyLocalPaging(filtered, { page, perPage: safePerPage }, [])
    return {
      rows: sliced.rows,
      total: sliced.total,
      page: sliced.page,
      perPage: sliced.perPage,
      pageCount: Math.max(1, Math.ceil(sliced.total / sliced.perPage)),
    }
  }, [filtered, page, perPage, serverTotal])

  return {
    ...paged,
    all: filtered,
    counts,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    isFetching: listQuery.isFetching,
    refetch: listQuery.refetch,
  }
}

