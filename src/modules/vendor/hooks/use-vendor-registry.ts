import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchVendorGstList,
  fetchVendorGstTags,
  uploadVendorGstFile,
} from "@/modules/vendor/api/vendor-registry.api.ts"
import { invalidateVendorLists, REFERENCE_DEFAULTS } from "@/modules/vendor/hooks/query-keys.ts"

/** GSTIN registry (`GET fetch-vendor-gst-list`). */
export function useVendorGstList() {
  return useQuery({
    queryKey: ["vendor-gst-list"],
    queryFn: () => fetchVendorGstList(),
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
