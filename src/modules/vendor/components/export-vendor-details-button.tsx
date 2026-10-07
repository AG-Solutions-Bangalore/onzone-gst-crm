import * as React from "react"
import toast from "react-hot-toast"
import { FileDown, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button.tsx"
import type {
  VendorGstDetails,
  VendorPartyDetails,
} from "@/modules/vendor/types/vendor.types.ts"

function cell(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
}

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

/**
 * Downloads one vendor's party/brand line items as an `.xlsx` file in the
 * exact `vendor_gst_details.xlsx` import-template shape so the file can be
 * edited and re-uploaded via "Import Details (.xlsx)".
 */
export function ExportVendorDetailsButton({
  vendor,
  partyRows,
}: {
  vendor: VendorGstDetails
  partyRows?: VendorPartyDetails[]
}) {
  const [exporting, setExporting] = React.useState(false)

  function handleExport() {
    setExporting(true)
    try {
      const items =
        partyRows && partyRows.length > 0
          ? partyRows
          : ([
              {
                vendor_gst: vendor.vendor_gst,
                party_name: null,
                brand: null,
                amount: null,
                gst_amount: null,
                address: null,
                town: null,
                district: null,
                belt: null,
              },
            ] as VendorPartyDetails[])
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
      XLSX.writeFile(workbook, `vendor_gst_details-${vendor.vendor_gst}.xlsx`)
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
