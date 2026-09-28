import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchVendorGstDetailsList,
  fetchVendorGstList,
  updateVendorGstDetails,
  uploadVendorGstFile,
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

/** `POST upload-vendor-gst-file` — invalidates vendor lists on success. */
export function useUploadVendorGstFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadVendorGstFile(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor-gst-list"] })
      void queryClient.invalidateQueries({
        queryKey: ["vendor-gst-details-list"],
      })
    },
  })
}

/** `GET updateVendorGSTDetails` — backend refresh, then invalidate lists. */
export function useUpdateVendorGstDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => updateVendorGstDetails(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor-gst-list"] })
      void queryClient.invalidateQueries({
        queryKey: ["vendor-gst-details-list"],
      })
    },
  })
}
