import * as React from "react"
import toast from "react-hot-toast"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import { useDeleteVendorGstDetails } from "@/modules/vendor/hooks/use-vendors.ts"

export interface DeleteVendorGstDetailsButtonProps {
  disabled?: boolean
}

/**
 * Single delete trigger for `DELETE /delete-vendor-gst-details` (from Postman collection).
 * In Postman, this endpoint takes no parameters and deletes/clears vendor GST details.
 * Prompts user for explicit permission via a Shadcn AlertDialog confirmation dialog.
 */
export function DeleteVendorGstDetailsButton({
  disabled = false,
}: DeleteVendorGstDetailsButtonProps) {
  const [open, setOpen] = React.useState(false)
  const deleteMutation = useDeleteVendorGstDetails()

  function handleConfirmDelete(e: React.MouseEvent) {
    e.preventDefault()

    const toastId = toast.loading("Executing delete request…")
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Vendor GST details deleted successfully.", { id: toastId })
        setOpen(false)
      },
      onError: (error) => {
        // Backend currently returns 500 (Laravel Model::delete bug in GSTController.php:317)
        toast.error(getApiErrorMessage(error), { id: toastId })
        setOpen(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive cursor-pointer"
          disabled={disabled || deleteMutation.isPending}
          title="Delete vendor GST details"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Delete Details
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md sm:rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <AlertDialogTitle>Delete Vendor GST Details?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
                Endpoint: <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">DELETE /delete-vendor-gst-details</code>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-2 text-sm text-foreground/80">
          <p>
            Are you sure you want to execute <strong className="text-foreground">DELETE /delete-vendor-gst-details</strong>?
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This API call will request the server to delete vendor GST details. This action cannot be undone.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteMutation.isPending}
            onClick={handleConfirmDelete}
            className="cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin mr-1" />
            ) : null}
            Yes, Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
