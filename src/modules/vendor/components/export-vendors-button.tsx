import * as React from "react"
import toast from "react-hot-toast"
import { FileDown, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button.tsx"
import type {
  VendorPartyDetails,
  VendorTableRow,
} from "@/modules/vendor/types/vendor.types.ts"

function cell(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

/** `vendor_gst.xlsx` import template columns (sheet `Sheet1`). */
const VENDOR_GST_TEMPLATE_HEADERS = ["vendor_gst", "vendor_gst_tag"] as const

/**
 * Blank `vendor_gst_details.xlsx` import template columns
 * (sheet `Sheet1`), in template order.
 */
const VENDOR_GST_DETAILS_TEMPLATE_HEADERS = [
  "vendor_gst",
  "party_name",
  "brand",
  "amount",
  "gst_amount",
  "address",
  "town",
  "district",
  "belt",
] as const

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
      // Same shape as the `vendor_gst.xlsx` import template (profiles carry
      // no tag, so that column stays blank for the user to fill before any
      // re-upload via "Import GSTIN (.xlsx)").
      const data: string[][] = [
        [...VENDOR_GST_TEMPLATE_HEADERS],
        ...rows.map((r) => [r.vendor_gst, ""]),
      ]
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      worksheet["!cols"] = [
        { wch: 20 }, // vendor_gst
        { wch: 20 }, // vendor_gst_tag
      ]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, "vendor_gst.xlsx")
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

/** Downloads uploaded GST details line items as an `.xlsx` file. */
export function ExportGstDetailsListButton({
  items,
  disabled,
}: {
  items: VendorPartyDetails[]
  disabled?: boolean
}) {
  const [exporting, setExporting] = React.useState(false)

  function handleExport() {
    if (!items.length) {
      toast.error("Nothing to export.")
      return
    }
    setExporting(true)
    try {
      // Same shape as the `vendor_gst_details.xlsx` import template so the
      // file can be edited and re-uploaded via "Import Details (.xlsx)".
      const data: string[][] = [
        [...VENDOR_GST_DETAILS_TEMPLATE_HEADERS],
        ...items.map((r) => [
          r.vendor_gst,
          cell(r.party_name),
          cell(r.brand),
          cell(r.amount),
          cell(r.gst_amount),
          cell(r.address),
          cell(r.town),
          cell(r.district),
          cell(r.belt),
        ]),
      ]
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      worksheet["!cols"] = [
        { wch: 18 }, // vendor_gst
        { wch: 28 }, // party_name
        { wch: 18 }, // brand
        { wch: 16 }, // amount
        { wch: 16 }, // gst_amount
        { wch: 45 }, // address
        { wch: 20 }, // town
        { wch: 20 }, // district
        { wch: 20 }, // belt
      ]
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, "vendor_gst_details.xlsx")
      toast.success(`Exported ${items.length} details to Excel.`)
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
      disabled={disabled || exporting || items.length === 0}
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

