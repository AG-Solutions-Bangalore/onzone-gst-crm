import * as React from "react"
import toast from "react-hot-toast"
import { FileDown, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button.tsx"
import type { VendorTableRow } from "@/modules/vendor/types/vendor.types.ts"

function cell(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

/** Downloads the given vendor rows as an `.xlsx` file. */
export function ExportVendorsButton({
  rows,
  disabled,
}: {
  rows: VendorTableRow[]
  disabled?: boolean
}) {
  const [exporting, setExporting] = React.useState(false)

  function handleExport() {
    if (!rows.length) {
      toast.error("Nothing to export.")
      return
    }
    setExporting(true)
    try {
      const sheetData = rows.map((r) => ({
        GSTIN: r.vendor_gst,
        "Business name": cell(r.business_name),
        "Legal name": cell(r.legal_name),
        PAN: cell(r.pan_number),
        "Taxpayer type": cell(r.taxpayer_type),
        Constitution: cell(r.constitution_of_business),
        "GSTIN status": cell(r.gstin_status),
        "Date of registration": cell(r.date_of_registration),
        Mobile: cell(r.mobile),
        Email: cell(r.email),
        Address: cell(r.address),
        "Annual turnover": cell(r.annual_turnover),
        "Turnover FY": cell(r.annual_turnover_fy),
        "Fetch status": cell(r.fetchStatus),
      }))
      const worksheet = XLSX.utils.json_to_sheet(sheetData)
      worksheet["!cols"] = [
        { wch: 18 }, // GSTIN
        { wch: 28 }, // Business name
        { wch: 28 }, // Legal name
        { wch: 13 }, // PAN
        { wch: 14 }, // Taxpayer type
        { wch: 16 }, // Constitution
        { wch: 14 }, // GSTIN status
        { wch: 14 }, // Date of registration
        { wch: 14 }, // Mobile
        { wch: 26 }, // Email
        { wch: 50 }, // Address
        { wch: 24 }, // Annual turnover
        { wch: 12 }, // Turnover FY
        { wch: 12 }, // Fetch status
      ]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors")
      const stamp = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(workbook, `vendors-${stamp}.xlsx`)
      toast.success(`Exported ${rows.length} vendors to Excel.`)
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
      disabled={disabled || exporting || rows.length === 0}
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
