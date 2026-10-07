import type { useQueryClient } from "@tanstack/react-query"

/** Reference data — fresh for 2 min, cached for 10. */
export const REFERENCE_DEFAULTS = {
  staleTime: 2 * 60_000,
  gcTime: 10 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const

const LIST_KEYS = [
  "vendor-gst-list",
  "vendor-gst-details-list",
  "vendor-gst-sync-details-list",
] as const

type QueryClient = ReturnType<typeof useQueryClient>

/** Invalidate every vendor list after an upload / sync / delete. */
export function invalidateVendorLists(queryClient: QueryClient) {
  for (const key of LIST_KEYS) {
    void queryClient.invalidateQueries({ queryKey: [key] })
  }
}
