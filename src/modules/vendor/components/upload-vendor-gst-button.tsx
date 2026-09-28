import * as React from "react"
import toast from "react-hot-toast"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import { useUploadVendorGstFile } from "@/modules/vendor/hooks/use-vendors.ts"

const ACCEPTED = ".xlsx,.xls,.csv"

/**
 * `POST upload-vendor-gst-file` — picks an xlsx file (`upload_files` key)
 * and uploads it for bulk GSTIN import.
 */
export function UploadVendorGstButton() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadVendorGstFile()

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so the same file can be picked again.
    event.target.value = ""
    if (!file) return
    const id = toast.loading(`Uploading ${file.name}…`)
    uploadMutation.mutate(file, {
      onSuccess: () => {
        toast.success("Vendor GST file uploaded.", { id })
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
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Upload className="size-3" />
        )}
        {uploadMutation.isPending ? "Uploading…" : "Upload"}
      </Button>
    </>
  )
}
