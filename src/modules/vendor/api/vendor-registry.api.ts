import { apiClient } from "@/lib/axios.ts"
import type {
  VendorGst,
  VendorGstTag,
} from "@/modules/vendor/types/vendor.types.ts"

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

/** `GET fetch-vendor-gst-list` — GSTIN registry + fetch status. Accepts query params. */
export async function fetchVendorGstList(
  params?: PaginationParams,
): Promise<VendorGst[]> {
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

  const { data } = await apiClient.get<ListResponse<VendorGst>>(
    "/fetch-vendor-gst-list",
    {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    },
  )
  return unwrapList(data)
}

/** `GET getVendorGSTTag` — tag dropdown source for the sync trigger. */
export async function fetchVendorGstTags(): Promise<VendorGstTag[]> {
  const { data } = await apiClient.get<ListResponse<VendorGstTag>>(
    "/getVendorGSTTag",
  )
  return unwrapList(data)
}

/** Blank GSTIN import template — clicking downloads `vendor_gst.xlsx`. */
export const VENDOR_GST_TEMPLATE_URL =
  "https://houseofonzone.com/admin/public/assets/import/vendor_gst.xlsx"

/** `POST upload-vendor-gst-file` — bulk import GSTINs from an xlsx file. */
export async function uploadVendorGstFile(file: File): Promise<unknown> {
  const formData = new FormData()
  // Backend expects the file under the `upload_files` key.
  formData.append("upload_files", file, file.name)
  const { data } = await apiClient.post("/upload-vendor-gst-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  })
  return data
}
