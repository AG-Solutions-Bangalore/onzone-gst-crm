import { useQuery } from "@tanstack/react-query"
import {
  fetchVendorGstDetailsList,
  fetchVendorGstList,
} from "@/modules/vendor/api/vendor.api.ts"

/** Reference data — fresh for 2 min, cached for 10. */
const REFERENCE_DEFAULTS = {
  staleTime: 2 * 60_000,
  gcTime: 10 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const

export function useVendorGstList() {
  return useQuery({
    queryKey: ["vendor-gst-list"],
    queryFn: fetchVendorGstList,
    ...REFERENCE_DEFAULTS,
  })
}

export function useVendorGstDetailsList() {
  return useQuery({
    queryKey: ["vendor-gst-details-list"],
    queryFn: fetchVendorGstDetailsList,
    ...REFERENCE_DEFAULTS,
  })
}

/** Single vendor profile looked up from the cached details list. */
export function useVendorGstDetails(gstin: string | undefined) {
  const detailsQuery = useVendorGstDetailsList()
  const vendor = detailsQuery.data?.find((v) => v.vendor_gst === gstin) ?? null
  return { ...detailsQuery, vendor }
}
