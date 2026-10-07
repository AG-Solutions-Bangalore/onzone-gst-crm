/** Vendor module contracts — shapes verified live against the admin API
 *  (login `gst user` / `5273`).
 *
 *  Endpoint map (GST.postman_collection.json):
 *  - `GET getVendorGSTTag` → tags for the sync dropdown
 *  - `GET fetch-vendor-gst-list` → registry (GSTIN + tag + fetch status)
 *  - `POST updateVendorGSTDetails {vendor_gst_tag, limit}` → trigger GST sync
 *  - `GET fetch-vendor-gst-sync-details-list` → GST profiles (1 per GSTIN)
 *  - `GET fetch-vendor-gst-sync-details-by-id/{id}` → profile + party rows
 *  - `GET fetch-vendor-gst-details-list` → party/brand sales rows (N per GSTIN)
 *  - `POST upload-vendor-gst-file` / `upload-vendor-gst-details-file` → imports
  *  - `DELETE delete-vendor-gst-details` → delete one party-details row by id
 */

/** `GET fetch-vendor-gst-list` item. */
export type VendorGst = {
  id: number
  vendor_gst: string
  vendor_gst_tag: string | null
  vendor_gst_status: string
}

/** `GET getVendorGSTTag` item — dropdown source for the sync trigger. */
export type VendorGstTag = {
  vendor_gst_tag: string
}

/**
 * `GET fetch-vendor-gst-details-list` item — party/brand sales rows.
 * NOTE: several rows share one `vendor_gst` (one per brand).
 */
export type VendorPartyDetails = {
  id: number
  vendor_gst: string
  party_name?: string | null
  brand?: string | null
  amount?: string | null
  gst_amount?: string | null
  address?: string | null
  town?: string | null
  district?: string | null
  belt?: string | null
  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
}

/**
 * `GET fetch-vendor-gst-sync-details-list` item — the GST profile.
 * This is what the dashboard / registry / details UI renders.
 */
export type VendorGstSyncDetails = {
  id: number
  vendor_gst: string
  address?: string | null
  email?: string | null
  mobile?: string | null
  nature_of_business?: string | null
  promoters?: string | null
  annual_turnover?: string | null
  annual_turnover_fy?: string | null
  percentage_in_cash_fy?: string | null
  percentage_in_cash?: string | null
  aadhaar_validation?: string | null
  aadhaar_validation_date?: string | null
  less_info?: boolean | null
  einvoice_status?: boolean | null
  client_id?: string | null
  pan_number?: string | null
  fy?: string | null
  business_name?: string | null
  legal_name?: string | null
  center_jurisdiction?: string | null
  state_jurisdiction?: string | null
  date_of_registration?: string | null
  constitution_of_business?: string | null
  taxpayer_type?: string | null
  gstin_status?: string | null
  date_of_cancellation?: string | null
  field_visit_conducted?: string | null
  nature_bus_activities?: string | null
  nature_of_core_business_activity_code?: string | null
  nature_of_core_business_activity_description?: string | null
  create_date?: string | null
  update_date?: string | null
  created_by?: string | null
  created_at?: string | null
  updated_by?: string | null
  updated_at?: string | null
}

/**
 * Back-compat alias — the UI historically called the GST profile
 * `VendorGstDetails`. New code should prefer `VendorGstSyncDetails`
 * (profile) vs `VendorPartyDetails` (party/brand rows).
 */
export type VendorGstDetails = VendorGstSyncDetails

/** `GET fetch-vendor-gst-sync-details-by-id/{id}` response. */
export type VendorSyncDetailsByIdResponse = {
  data: VendorGstSyncDetails
  gstdetails: VendorPartyDetails[]
}

/** `POST updateVendorGSTDetails` payload (form-data). */
export type UpdateVendorGstDetailsPayload = {
  vendor_gst_tag: string
  limit?: number
}

/** `POST updateVendorGSTDetails` response. */
export type UpdateVendorGstDetailsResponse = {
  code?: number
  message?: string
}

/** Profile row enriched with the fetch status from the registry list. */
export type VendorTableRow = VendorGstSyncDetails & {
  fetchStatus?: string
}
