import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { Copy, Check } from "lucide-react"
import toast from "react-hot-toast"

import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import type { VendorGst } from "@/modules/vendor/types/vendor.types.ts"

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
      className="size-6 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      title="Copy GSTIN"
      aria-label="Copy GSTIN"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  )
}

export function vendorGstStatusVariant(
  status: string | null | undefined,
): "success" | "accent" | "default" {
  if (status === "Finished") return "success"
  if (status === "Pending") return "accent"
  return "default"
}

export const vendorGstTableColumns: ColumnDef<VendorGst>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "vendor_gst",
    header: "GSTIN",
    enableSorting: true,
    cell: ({ row }) => {
      const gstin = row.original.vendor_gst
      return (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/sync-details/${gstin}`}
            className="hover:text-primary font-mono text-[13px] font-medium transition-colors"
          >
            {gstin}
          </Link>
          <CopyGstinBtn gstin={gstin} />
        </div>
      )
    },
  },
  {
    accessorKey: "vendor_gst_tag",
    header: "Tag",
    enableSorting: true,
    cell: ({ row }) => {
      const tag = row.original.vendor_gst_tag
      return tag ? (
        <Badge variant="outline" className="font-medium">
          {tag}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  },
  {
    accessorKey: "vendor_gst_status",
    header: "Sync Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={vendorGstStatusVariant(row.original.vendor_gst_status)}>
        {row.original.vendor_gst_status || "Unknown"}
      </Badge>
    ),
  },
]
