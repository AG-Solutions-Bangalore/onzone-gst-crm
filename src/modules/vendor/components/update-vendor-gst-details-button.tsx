import * as React from "react"
import toast from "react-hot-toast"
import { Loader2, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import {
  useUpdateVendorGstDetails,
  useVendorGstTags,
} from "@/modules/vendor/hooks/use-vendors.ts"

const DEFAULT_LIMIT = 20

/**
 * `POST updateVendorGSTDetails {vendor_gst_tag, limit}` — tag comes from
 * `GET getVendorGSTTag`, then the backend refreshes that batch from the
 * GST portal and the vendor lists are invalidated.
 */
export function UpdateVendorGstDetailsButton() {
  const tagsQuery = useVendorGstTags()
  const updateMutation = useUpdateVendorGstDetails()
  const [tag, setTag] = React.useState("")
  const [limit, setLimit] = React.useState(DEFAULT_LIMIT)

  const tags = React.useMemo(
    () => tagsQuery.data?.map((t) => t.vendor_gst_tag) ?? [],
    [tagsQuery.data],
  )

  const effectiveTag = tag || tags[0] || ""

  function handleClick() {
    if (!effectiveTag) {
      toast.error("Pick a vendor tag first.")
      return
    }
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT
    const id = toast.loading(`Syncing “${effectiveTag}” from GST portal…`)
    updateMutation.mutate(
      { vendor_gst_tag: effectiveTag, limit: safeLimit },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "GST details updated.", { id })
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error), { id })
        },
      },
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="sync-tag" className="sr-only">
        Vendor tag
      </label>
      <select
        id="sync-tag"
        value={effectiveTag}
        onChange={(e) => setTag(e.target.value)}
        disabled={tagsQuery.isLoading || updateMutation.isPending}
        className="border-outline-variant bg-card h-8 rounded-md border px-2 text-sm"
      >
        {tagsQuery.isLoading && <option value="">Loading tags…</option>}
        {!tagsQuery.isLoading && tags.length === 0 && (
          <option value="">No tags</option>
        )}
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <label htmlFor="sync-limit" className="sr-only">
        Batch limit
      </label>
      <Input
        id="sync-limit"
        type="number"
        min={1}
        max={500}
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        disabled={updateMutation.isPending}
        className="h-8 w-20"
        aria-label="Batch limit"
      />
      <Button
        variant="default"
        size="sm"
        onClick={handleClick}
        disabled={updateMutation.isPending || !tag}
        title={
          tagsQuery.isError ? "Could not load tags — retry via Refresh" : undefined
        }
      >
        {updateMutation.isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <RefreshCcw className="size-3" />
        )}
        {updateMutation.isPending ? "Syncing…" : "Sync GST details"}
      </Button>
    </div>
  )
}
