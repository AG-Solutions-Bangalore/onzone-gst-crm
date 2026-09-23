import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge.tsx"
import type {
  VendorGstDetails,
  VendorTableRow,
} from "@/modules/vendor/types/vendor.types.ts"

export function gstinStatusVariant(
  status: string | null | undefined,
): "success" | "destructive" | "accent" | "default" {
  if (!status) return "default"
  if (status === "Active") return "success"
  if (status.toLowerCase().includes("cancel")) return "destructive"
  if (status === "Suspended") return "accent"
  return "default"
}

export function fetchStatusVariant(
  status: string | null | undefined,
): "success" | "default" {
  return status === "Finished" ? "success" : "default"
}

function GstinLink({ gstin, sub }: { gstin: string; sub?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Link
        to={`/vendors/${gstin}`}
        className="hover:text-tertiary font-mono text-[13px] font-medium whitespace-normal break-all"
      >
        {gstin}
      </Link>
      {sub && (
        <span className="text-muted-foreground text-xs whitespace-normal">
          {sub}
        </span>
      )}
    </div>
  )
}

/** Vendors registry table (details + fetch status). */
export const vendorTableColumns: ColumnDef<VendorTableRow>[] = [
  {
    accessorKey: "vendor_gst",
    header: "GSTIN",
    enableSorting: true,
    cell: ({ row }) => (
      <GstinLink
        gstin={row.original.vendor_gst}
        sub={row.original.business_name}
      />
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
    header: "GSTIN status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={gstinStatusVariant(row.original.gstin_status)}>
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

/** Compact table for vendors needing attention (non-active GSTIN). */
export const attentionColumns: ColumnDef<VendorGstDetails>[] = [
  {
    accessorKey: "vendor_gst",
    header: "GSTIN",
    enableSorting: true,
    cell: ({ row }) => (
      <GstinLink
        gstin={row.original.vendor_gst}
        sub={row.original.business_name}
      />
    ),
  },
  {
    accessorKey: "gstin_status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={gstinStatusVariant(row.original.gstin_status)}>
        {row.original.gstin_status || "Unknown"}
      </Badge>
    ),
  },
]
