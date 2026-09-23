/** Vendor module contracts — shapes from the admin API. */

/** `GET fetch-vendor-gst-list` item. */
export type VendorGst = {
  id: number
  vendor_gst: string
  vendor_gst_status: string
}

/** `GET fetch-vendor-gst-details-list` item (GST profile). */
export type VendorGstDetails = {
  id: number
  vendor_gst: string
  business_name?: string | null
  legal_name?: string | null
  pan_number?: string | null
  address?: string | null
  email?: string | null
  mobile?: string | null
  promoters?: string | null
  nature_of_business?: string | null
  nature_bus_activities?: string | null
  nature_of_core_business_activity_description?: string | null
  constitution_of_business?: string | null
  taxpayer_type?: string | null
  gstin_status?: string | null
  date_of_registration?: string | null
  date_of_cancellation?: string | null
  annual_turnover?: string | null
  annual_turnover_fy?: string | null
  aadhaar_validation?: string | null
  einvoice_status?: boolean | null
  field_visit_conducted?: string | null
  center_jurisdiction?: string | null
  state_jurisdiction?: string | null
  create_date?: string | null
}

/** Details row enriched with the fetch status from the summary list. */
export type VendorTableRow = VendorGstDetails & {
  fetchStatus?: string
}
