import * as React from "react"
import toast from "react-hot-toast"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import {
  useUploadVendorGstDetailsFile,
  useUploadVendorGstFile,
} from "@/modules/vendor/hooks/use-vendors.ts"

const ACCEPTED = ".xlsx,.xls,.csv"

type UploadVendorGstButtonProps = {
  /** Target upload endpoint: 'gstin' (`upload-vendor-gst-file`) or 'details' (`upload-vendor-gst-details-file`). */
  target?: "gstin" | "details"
  label?: string
  variant?: "default" | "secondary" | "outline" | "ghost"
}

/**
 * Picks an xlsx file (`upload_files` key) and uploads it to either:
 * - `POST upload-vendor-gst-file` (bulk GSTIN import)
 * - `POST upload-vendor-gst-details-file` (bulk GST details import)
 */
export function UploadVendorGstButton({
  target = "gstin",
  label,
  variant = "secondary",
}: UploadVendorGstButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const uploadGstMutation = useUploadVendorGstFile()
  const uploadDetailsMutation = useUploadVendorGstDetailsFile()

  const isDetails = target === "details"
  const mutation = isDetails ? uploadDetailsMutation : uploadGstMutation
  const defaultLabel = isDetails ? "Upload details" : "Upload GSTINs"

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so the same file can be picked again.
    event.target.value = ""
    if (!file) return

    const id = toast.loading(`Uploading ${file.name}…`)
    mutation.mutate(file, {
      onSuccess: () => {
        toast.success(
          isDetails
            ? "Vendor GST details uploaded."
            : "Vendor GST file uploaded.",
          { id },
        )
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error), { id })
      },
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <Button
        variant={variant}
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Upload className="size-3" />
        )}
        {mutation.isPending ? "Uploading…" : (label ?? defaultLabel)}
      </Button>
    </>
  )
}

