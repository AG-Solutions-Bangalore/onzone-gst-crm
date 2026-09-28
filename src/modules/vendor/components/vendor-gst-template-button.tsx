import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { VENDOR_GST_TEMPLATE_URL } from "@/modules/vendor/api/vendor.api.ts"

/**
 * Downloads the blank `vendor_gst.xlsx` import template.
 * Plain anchor — the browser handles the file download.
 */
export function VendorGstTemplateButton() {
  return (
    <Button variant="secondary" size="sm" asChild>
      <a href={VENDOR_GST_TEMPLATE_URL} download="vendor_gst.xlsx">
        <FileDown className="size-3" />
        Template
      </a>
    </Button>
  )
}
