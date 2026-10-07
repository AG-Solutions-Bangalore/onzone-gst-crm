import * as React from "react"
import toast from "react-hot-toast"
import { Loader2, Trash2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

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
import { deleteVendorGstDetails } from "@/modules/vendor/api/vendor-party.api.ts"
import { invalidateVendorLists } from "@/modules/vendor/hooks/query-keys.ts"
import { useDeleteVendorGstDetails } from "@/modules/vendor/hooks/use-vendors.ts"

/**
 * `DELETE delete-vendor-gst-details` — no ID input, just confirmation:
 * 1. Row action: `id` given -> trash icon button, confirms that one record.
 * 2. Header action: `ids` given -> "Delete (N)" button, confirms the listed
 *    records once and deletes them one by one (the endpoint only supports
 *    one row per call), with a progress toast.
 */
export function DeleteVendorGstDetailsButton({
  id: initialId,
  ids,
  partyName,
  disabled,
}: {
  id?: number | string
  ids?: (number | string)[]
  partyName?: string | null
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [bulkDeleting, setBulkDeleting] = React.useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteVendorGstDetails()

  const isRowMode = initialId !== undefined
  const bulkIds = ids ?? []
  const pending = deleteMutation.isPending || bulkDeleting

  function handleRowConfirm(e: React.MouseEvent) {
    // Keep the dialog open until the request settles.
    e.preventDefault()
    if (initialId === undefined) return
    const toastId = toast.loading(`Deleting GST details #${initialId}…`)
    deleteMutation.mutate(initialId, {
      onSuccess: () => {
        toast.success(`GST details #${initialId} deleted.`, { id: toastId })
        setOpen(false)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error), { id: toastId })
        setOpen(false)
      },
    })
  }

  async function handleBulkConfirm(e: React.MouseEvent) {
    // Keep the dialog open until all requests settle.
    e.preventDefault()
    if (bulkIds.length === 0) return
    setBulkDeleting(true)
    const toastId = toast.loading(`Deleting 0 of ${bulkIds.length}…`)
    let done = 0
    let failed = 0
    for (const bulkId of bulkIds) {
      try {
        await deleteVendorGstDetails(bulkId)
        done += 1
      } catch {
        failed += 1
      }
      toast.loading(`Deleting ${done + failed} of ${bulkIds.length}…`, {
        id: toastId,
      })
    }
    invalidateVendorLists(queryClient)
    setBulkDeleting(false)
    setOpen(false)
    if (failed === 0) {
      toast.success(
        `Deleted ${done} record${done === 1 ? "" : "s"}.`,
        { id: toastId },
      )
    } else if (done === 0) {
      toast.error(`Delete failed for all ${bulkIds.length} records.`, {
        id: toastId,
      })
    } else {
      toast.error(`Deleted ${done}, failed ${failed}.`, { id: toastId })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {isRowMode ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 cursor-pointer"
            disabled={disabled || pending}
            title={`Delete details row #${initialId}`}
            onClick={(e) => {
              // Prevent table row click navigation
              e.stopPropagation()
            }}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="hover:text-destructive hover:border-destructive/40"
            disabled={disabled || pending || bulkIds.length === 0}
            title={
              bulkIds.length === 0
                ? "Nothing to delete"
                : `Delete ${bulkIds.length} records`
            }
          >
            {bulkDeleting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            {bulkDeleting
              ? "Deleting…"
              : `Delete${bulkIds.length > 0 ? ` (${bulkIds.length})` : ""}`}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-sm"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">
            {isRowMode
              ? partyName
                ? `Delete “${partyName}”?`
                : `Delete record #${initialId}?`
              : `Delete ${bulkIds.length} records?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRowMode ? (
              <>
                Record <span className="font-mono font-medium">#{initialId}</span> will
                be permanently removed from the server. This action cannot be
                undone.
              </>
            ) : (
              <>
                {bulkIds.length} line-item record
                {bulkIds.length === 1 ? "" : "s"} will be permanently removed
                from the server. This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={isRowMode ? handleRowConfirm : handleBulkConfirm}
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            {pending
              ? "Deleting…"
              : isRowMode
                ? "Delete"
                : `Delete ${bulkIds.length}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Alias for header/toolbar usage */
export const BulkDeleteVendorGstDetailsButton = DeleteVendorGstDetailsButton
