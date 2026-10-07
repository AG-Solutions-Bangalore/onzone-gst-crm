import { apiClient } from "@/lib/axios.ts"
import type {
  UpdateVendorGstDetailsPayload,
  UpdateVendorGstDetailsResponse,
  VendorGstSyncDetails,
  VendorPartyDetails,
  VendorSyncDetailsByIdResponse,
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

/**
 * `GET fetch-vendor-gst-sync-details-list` — GST profiles, one per GSTIN.
 * Accepts server-side pagination & search parameters.
 */
export async function fetchVendorGstSyncDetailsList(
  params?: PaginationParams,
): Promise<VendorGstSyncDetails[]> {
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

  const { data } = await apiClient.get<ListResponse<VendorGstSyncDetails>>(
    "/fetch-vendor-gst-sync-details-list",
    {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    },
  )
  return unwrapList(data)
}

type SyncByIdRaw = {
  data?: VendorGstSyncDetails
  gstdetails?: VendorPartyDetails[]
}

/**
 * `GET fetch-vendor-gst-sync-details-by-id/{id}` — one profile plus its
 * party/brand rows. Note: `{id}` is the *sync record* id, not the GSTIN.
 */
export async function fetchVendorGstSyncDetailsById(
  id: number | string,
): Promise<VendorSyncDetailsByIdResponse> {
  const { data } = await apiClient.get<VendorSyncDetailsByIdResponse | SyncByIdRaw>(
    `/fetch-vendor-gst-sync-details-by-id/${id}`,
  )
  return {
    data: (data as SyncByIdRaw).data as VendorGstSyncDetails,
    gstdetails: (data as SyncByIdRaw).gstdetails ?? [],
  }
}

/**
 * `POST updateVendorGSTDetails` — triggers a backend refresh of GST profiles
 * for one `vendor_gst_tag` (from `getVendorGSTTag`), up to `limit` records.
 * Verified live: `{code: 200, message: "GST verification completed."}`.
 * Call after upload, then refetch the vendor lists.
 */
export async function updateVendorGstDetails(
  payload: UpdateVendorGstDetailsPayload,
): Promise<UpdateVendorGstDetailsResponse> {
  const formData = new FormData()
  formData.append("vendor_gst_tag", payload.vendor_gst_tag)
  formData.append("limit", String(payload.limit ?? 20))
  const { data } = await apiClient.post<UpdateVendorGstDetailsResponse>(
    "/updateVendorGSTDetails",
    formData,
    { timeout: 180_000 },
  )
  return data
}
