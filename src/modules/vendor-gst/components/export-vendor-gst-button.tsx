import * as React from "react"
import toast from "react-hot-toast"
import { FileDown, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button.tsx"
import type { VendorGst } from "@/modules/vendor/types/vendor.types.ts"

function cell(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
}

/** Blank GSTIN import template columns (`vendor_gst.xlsx`, sheet `Sheet1`). */
const TEMPLATE_HEADERS = ["vendor_gst", "vendor_gst_tag"] as const

/** Downloads Vendor GST registry rows as an `.xlsx` file. */
export function ExportVendorGstButton({
  rows,
  disabled,
}: {
  rows: VendorGst[]
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
      // Same shape as the `vendor_gst.xlsx` import template so the file
      // can be edited and re-uploaded via "Import GSTIN (.xlsx)".
      const data: string[][] = [
        [...TEMPLATE_HEADERS],
        ...rows.map((r) => [r.vendor_gst, cell(r.vendor_gst_tag)]),
      ]
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      worksheet["!cols"] = [
        { wch: 20 }, // vendor_gst
        { wch: 20 }, // vendor_gst_tag
      ]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, "vendor_gst.xlsx")
      toast.success(`Exported ${rows.length} GSTINs to Excel.`)
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
