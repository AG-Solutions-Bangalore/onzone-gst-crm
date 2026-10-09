import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge.tsx"
import type {
  VendorGstSyncDetails,
  VendorPartyDetails,
  VendorTableRow,
} from "@/modules/vendor/types/vendor.types.ts"

export function gstinStatusVariant(
  status: string | null | undefined,
): "success" | "destructive" | "accent" | "default" {
  if (!status) return "default"
  if (status === "Active") return "success"
  if (status.toLowerCase().includes("cancel")) return "destructive"
  if (status === "Suspended" || status.toLowerCase().includes("unsync")) return "accent"
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
        to={`/sync-details/${gstin}`}
        title={`View details for ${gstin}`}
        className="text-info font-mono text-[13px] font-medium whitespace-normal break-all"
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
export const attentionColumns: ColumnDef<VendorGstSyncDetails>[] = [
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

export function parseAmount(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0
  if (typeof val === "number") return isNaN(val) ? 0 : val
  const num = Number(String(val).replace(/[^0-9.-]/g, ""))
  return isNaN(num) ? 0 : num
}

export function formatINR(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—"
  const num = typeof val === "number" ? val : parseAmount(val)
  if (isNaN(num)) return String(val)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

function formatCurrency(val: unknown): string {
  return formatINR(val)
}

/** Table columns for party/brand rows (`fetch-vendor-gst-details-list`). */
export const gstDetailsTableColumns: ColumnDef<VendorPartyDetails>[] = [
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
    cell: ({ row }) => (
      <GstinLink
        gstin={row.original.vendor_gst}
        sub={row.original.party_name}
      />
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    enableSorting: true,
    cell: ({ row }) => row.original.brand || "—",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "gst_amount",
    header: "GST Amount",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums">
        {formatCurrency(row.original.gst_amount)}
      </span>
    ),
  },
  {
    accessorKey: "town",
    header: "Town / District",
    enableSorting: true,
    cell: ({ row }) => {
      const parts = [row.original.town, row.original.district].filter(Boolean)
      return parts.length ? parts.join(", ") : "—"
    },
  },
  {
    accessorKey: "belt",
    header: "Belt",
    enableSorting: true,
    cell: ({ row }) => row.original.belt || "—",
  },
]

/** One aggregated row for the “Brand-wise Transactions” card. */
export type BrandTransactionRow = {
  brand: string
  taxableAmount: number
  gstAmount: number
  count: number
}

/** Group party/brand line items by brand, summing taxable + GST amounts. */
export function groupPartyRowsByBrand(rows: VendorPartyDetails[]): BrandTransactionRow[] {
  const map = new Map<string, BrandTransactionRow>()
  for (const r of rows) {
    const key = (r.brand || "—").trim().toUpperCase() || "—"
    const existing = map.get(key)
    if (existing) {
      existing.taxableAmount += parseAmount(r.amount)
      existing.gstAmount += parseAmount(r.gst_amount)
      existing.count += 1
    } else {
      map.set(key, {
        brand: key,
        taxableAmount: parseAmount(r.amount),
        gstAmount: parseAmount(r.gst_amount),
        count: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => b.taxableAmount - a.taxableAmount)
}

/** Columns for the Brand-wise Transactions table (design: # / Brand / Taxable / GST). */
export const brandWiseTransactionColumns: ColumnDef<BrandTransactionRow>[] = [
  {
    id: "slno",
    header: "#",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-foreground text-[15px] tabular-nums">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-foreground text-[15px] font-medium tracking-wide">
        {row.original.brand}
      </span>
    ),
  },
  {
    accessorKey: "taxableAmount",
    header: "Taxable Amount (₹)",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-blue-500 dark:text-[#5aa9ff] text-[15px] font-semibold tabular-nums">
        {formatINR(row.original.taxableAmount)}
      </span>
    ),
  },
  {
    accessorKey: "gstAmount",
    header: "GST Amount (₹)",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-amber-600 dark:text-amber-300 text-[15px] font-semibold tabular-nums">
        {formatINR(row.original.gstAmount)}
      </span>
    ),
  },
]


