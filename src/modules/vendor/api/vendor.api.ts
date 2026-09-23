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
