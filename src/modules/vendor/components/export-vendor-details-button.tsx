import * as React from "react"
import toast from "react-hot-toast"
import { FileDown, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button.tsx"
import type { VendorGstDetails } from "@/modules/vendor/types/vendor.types.ts"

function text(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

/** Downloads one vendor's full GST profile as an `.xlsx` file. */
export function ExportVendorDetailsButton({
  vendor,
}: {
  vendor: VendorGstDetails
}) {
  const [exporting, setExporting] = React.useState(false)

  function handleExport() {
    setExporting(true)
    try {
      const rows: [string, string][] = [
        ["Field", "Value"],
        ["GSTIN", text(vendor.vendor_gst)],
        ["Business name", text(vendor.business_name)],
        ["Legal name", text(vendor.legal_name)],
        ["PAN", text(vendor.pan_number)],
        ["Taxpayer type", text(vendor.taxpayer_type)],
        ["Constitution", text(vendor.constitution_of_business)],
        ["GSTIN status", text(vendor.gstin_status)],
        ["Date of registration", text(vendor.date_of_registration)],
        ["Date of cancellation", text(vendor.date_of_cancellation)],
        ["Nature of business", text(vendor.nature_of_business)],
        ["Business activities", text(vendor.nature_bus_activities)],
        [
          "Core activity",
          text(vendor.nature_of_core_business_activity_description),
        ],
        ["Promoters", text(vendor.promoters)],
        ["Address", text(vendor.address)],
        ["Email", text(vendor.email)],
        ["Mobile", text(vendor.mobile)],
        ["Annual turnover", text(vendor.annual_turnover)],
        ["Turnover FY", text(vendor.annual_turnover_fy)],
        ["Aadhaar validation", text(vendor.aadhaar_validation)],
        [
          "E-invoice",
          vendor.einvoice_status === null || vendor.einvoice_status === undefined
            ? "—"
            : vendor.einvoice_status
              ? "Enabled"
              : "Not enabled",
        ],
        ["Field visit conducted", text(vendor.field_visit_conducted)],
        ["Center jurisdiction", text(vendor.center_jurisdiction)],
        ["State jurisdiction", text(vendor.state_jurisdiction)],
      ]
      const worksheet = XLSX.utils.aoa_to_sheet(rows)
      worksheet["!cols"] = [{ wch: 24 }, { wch: 70 }]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor details")
      XLSX.writeFile(workbook, `vendor-${vendor.vendor_gst}.xlsx`)
      toast.success("Vendor profile exported to Excel.")
    } catch {
      toast.error("Excel export failed. Try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <FileDown className="size-3" />
      )}
      {exporting ? "Exporting…" : "Excel"}
    </Button>
  )
}
