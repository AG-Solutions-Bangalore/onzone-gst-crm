import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import {
  VENDOR_GST_DETAILS_TEMPLATE_URL,
  VENDOR_GST_TEMPLATE_URL,
} from "@/modules/vendor/api/vendor.api.ts"

type VendorGstTemplateButtonProps = {
  /** Target template: 'gstin' (`vendor_gst.xlsx`) or 'details' (`vendor_gst_details.xlsx`). */
  target?: "gstin" | "details"
  label?: string
}

/**
 * Downloads blank import templates:
 * - `vendor_gst.xlsx` (for bulk GSTINs)
 * - `vendor_gst_details.xlsx` (for bulk transactional brand details)
 */
export function VendorGstTemplateButton({
  target = "gstin",
  label,
}: VendorGstTemplateButtonProps) {
  const isDetails = target === "details"
  const url = isDetails
    ? VENDOR_GST_DETAILS_TEMPLATE_URL
    : VENDOR_GST_TEMPLATE_URL
  const filename = isDetails ? "vendor_gst_details.xlsx" : "vendor_gst.xlsx"
  const defaultLabel = isDetails ? "Details template" : "Template"

  return (
    <Button variant="secondary" size="sm" asChild>
      <a href={url} download={filename}>
        <FileDown className="size-3" />
        {label ?? defaultLabel}
      </a>
    </Button>
  )
}

