import { apiClient } from "@/lib/axios.ts"
import type {
  VendorGst,
  VendorGstDetails,
} from "@/modules/vendor/types/vendor.types.ts"

type ListResponse<T> = { data?: T[] } | T[]

function unwrap<T>(payload: ListResponse<T>): T[] {
  if (Array.isArray(payload)) return payload
  return payload.data ?? []
}

/** `GET fetch-vendor-gst-list` — GSTINs + fetch status. */
export async function fetchVendorGstList(): Promise<VendorGst[]> {
  const { data } = await apiClient.get<ListResponse<VendorGst>>(
    "/fetch-vendor-gst-list",
  )
  return unwrap(data)
}

/** `GET fetch-vendor-gst-details-list` — full GST profiles. */
export async function fetchVendorGstDetailsList(): Promise<VendorGstDetails[]> {
  const { data } = await apiClient.get<ListResponse<VendorGstDetails>>(
    "/fetch-vendor-gst-details-list",
  )
  return unwrap(data)
}

/** Blank import template — clicking downloads `vendor_gst.xlsx`. */
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

/**
 * `GET updateVendorGSTDetails` — triggers a backend refresh of GST profiles
 * (fetches latest data from the GST portal). Call after upload, then refetch
 * the vendor lists.
 */
export async function updateVendorGstDetails(): Promise<unknown> {
  const { data } = await apiClient.get("/updateVendorGSTDetails", {
    timeout: 120_000,
  })
  return data
}
