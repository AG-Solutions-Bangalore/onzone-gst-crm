import toast from "react-hot-toast"
import { Loader2, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import { useUpdateVendorGstDetails } from "@/modules/vendor/hooks/use-vendors.ts"

/**
 * `GET updateVendorGSTDetails` — asks the backend to refresh GST profiles,
 * then invalidates the vendor lists so fresh data is refetched.
 */
export function UpdateVendorGstDetailsButton() {
  const updateMutation = useUpdateVendorGstDetails()

  function handleClick() {
    const id = toast.loading("Updating GST details from portal…")
    updateMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("GST details updated.", { id })
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error), { id })
      },
    })
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleClick}
      disabled={updateMutation.isPending}
    >
      {updateMutation.isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <RefreshCcw className="size-3" />
      )}
      {updateMutation.isPending ? "Updating…" : "Update GST details"}
    </Button>
  )
}
