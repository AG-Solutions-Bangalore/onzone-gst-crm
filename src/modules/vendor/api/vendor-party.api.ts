import { apiClient } from "@/lib/axios.ts"
import type { VendorPartyDetails } from "@/modules/vendor/types/vendor.types.ts"

type ListResponse<T> = { data?: T[] } | T[]

function unwrapList<T>(payload: ListResponse<T>): T[] {
  if (Array.isArray(payload)) return payload
  const list = payload?.data ?? []
  if (Array.isArray(list)) {
    if (typeof (payload as Record<string, unknown>)?.total === "number") {
      Object.defineProperty(list, "__serverTotal", {
        value: (payload as Record<string, unknown>).total,
        enumerable: false,
        configurable: true,
      })
    }
    return list
  }
  return []
}

export type PaginationParams = {
  page?: number
  limit?: number
  search?: string
}

/**
 * `GET fetch-vendor-gst-details-list` — party/brand sales rows
 * (several per GSTIN). Accepts server-side pagination & search parameters.
 */
export async function fetchVendorGstDetailsList(
  params?: PaginationParams,
): Promise<VendorPartyDetails[]> {
  const cleanParams: Record<string, unknown> = {}
  if (params?.page && params.page > 0) cleanParams.page = params.page
  if (params?.limit && params.limit > 0) {
    cleanParams.limit = params.limit
    cleanParams.per_page = params.limit
  }
  if (params?.search && params.search.trim()) {
    cleanParams.search = params.search.trim()
    cleanParams.q = params.search.trim()
  }

  const { data } = await apiClient.get<ListResponse<VendorPartyDetails>>(
    "/fetch-vendor-gst-details-list",
    {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    },
  )
  return unwrapList(data)
}

/** Blank party-details import template. */
export const VENDOR_GST_DETAILS_TEMPLATE_URL =
  "https://houseofonzone.com/admin/public/assets/import/vendor_gst_details.xlsx"

/** `POST upload-vendor-gst-details-file` — bulk import party/brand rows. */
export async function uploadVendorGstDetailsFile(
  file: File,
): Promise<unknown> {
  const formData = new FormData()
  formData.append("upload_files", file, file.name)
  const { data } = await apiClient.post(
    "/upload-vendor-gst-details-file",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    },
  )
  return data
}

/**
 * `DELETE delete-vendor-gst-details` — remove one party-details row.
 *
 * WARNING: currently broken server-side — the controller calls
 * `Model::delete()` statically, so every variant returns HTTP 500
 * (`Non-static method … Model::delete() cannot be called statically`,
 * GSTController.php:317). Kept here so the UI can adopt it the moment the
 * backend is fixed; callers should surface the error via
 * `getApiErrorMessage`. The `id` is sent both as a query param and in the
 * JSON body since the collection leaves the binding unspecified.
 */
export async function deleteVendorGstDetails(
  id?: number | string,
): Promise<unknown> {
  const { data } = await apiClient.delete("/delete-vendor-gst-details", {
    params: id !== undefined ? { id } : undefined,
    data: id !== undefined ? { id } : undefined,
  })
  return data
}
