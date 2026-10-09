import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { Check, Copy } from "lucide-react"
import toast from "react-hot-toast"

import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  fetchStatusVariant,
  gstinStatusVariant,
} from "@/modules/vendor/components/vendor-columns.tsx"
import type { VendorTableRow } from "@/modules/vendor/types/vendor.types.ts"

function CopyGstinBtn({ gstin }: { gstin: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(gstin)
      setCopied(true)
      toast.success("GSTIN copied.")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Failed to copy.")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-5 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      title="Copy GSTIN"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  )
}

export const syncDetailsColumns: ColumnDef<VendorTableRow>[] = [
  {
    id: "slno",
    header: "SlNo",
    enableSorting: false,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination
      return (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {pageIndex * pageSize + row.index + 1}
        </span>
      )
    },
  },
  {
    accessorKey: "vendor_gst",
    header: "GSTIN",
    enableSorting: true,
    cell: ({ row }) => {
      const gstin = row.original.vendor_gst
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/sync-details/${gstin}`}
              title={`View details for ${gstin}`}
              className="text-info font-mono text-[13px] font-medium break-all"
            >
              {gstin}
            </Link>
            <CopyGstinBtn gstin={gstin} />
          </div>
          {row.original.business_name && (
            <span className="text-muted-foreground text-xs line-clamp-1">
              {row.original.business_name}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "legal_name",
    header: "Legal name",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm line-clamp-1">
        {row.original.legal_name || "—"}
      </span>
    ),
  },
  {
    accessorKey: "taxpayer_type",
    header: "Type",
    enableSorting: true,
    cell: ({ row }) => row.original.taxpayer_type || "—",
  },
  {
    accessorKey: "constitution_of_business",
    header: "Constitution",
    enableSorting: true,
    cell: ({ row }) => row.original.constitution_of_business || "—",
  },
  {
    accessorKey: "gstin_status",
    header: "GSTIN Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={gstinStatusVariant(row.original.gstin_status)} className="whitespace-normal text-center">
        {row.original.gstin_status || "Unknown"}
      </Badge>
    ),
  },
  {
    accessorKey: "fetchStatus",
    header: "Fetch",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={fetchStatusVariant(row.original.fetchStatus)}>
        {row.original.fetchStatus || "—"}
      </Badge>
    ),
  },
]
