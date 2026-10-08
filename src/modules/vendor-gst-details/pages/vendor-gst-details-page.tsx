import * as React from "react"
import toast from "react-hot-toast"
import { Check, Copy, Loader2, RefreshCw, Search, X } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { SEARCH_DEBOUNCE_MS } from "@/lib/pagination.ts"
import { ExportGstDetailsListButton } from "@/modules/vendor/components/export-vendors-button.tsx"
import { VendorGstTemplateButton } from "@/modules/vendor/components/vendor-gst-template-button.tsx"
import { UploadVendorGstButton } from "@/modules/vendor/components/upload-vendor-gst-button.tsx"
import { DeleteVendorGstDetailsButton } from "@/modules/vendor/components/delete-vendor-gst-details-button.tsx"
import { useVendorPartyView } from "@/modules/vendor/hooks/use-vendor-party.ts"
import type { VendorPartyDetails } from "@/modules/vendor/types/vendor.types.ts"

function formatCurrency(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—"
  const num = Number(val)
  if (isNaN(num)) return String(val)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num)
}

function GstinCell({ gstin, sub }: { gstin: string; sub?: string | null }) {
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
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[13px] font-medium break-all">{gstin}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          title="Copy GSTIN"
        >
          {copied ? (
            <Check className="size-3 text-emerald-500" />
          ) : (
            <Copy className="size-3" />
          )}
        </Button>
      </div>
      {sub && (
        <span className="text-muted-foreground text-xs">{sub}</span>
      )}
    </div>
  )
}

const columns: ColumnDef<VendorPartyDetails>[] = [
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
      <GstinCell
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

/** `/vendor-gst-details` — Party / Brand line items registry with upload, export, and row deletion. */
export function VendorGstDetailsPage() {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  const partyView = useVendorPartyView({
    search: debouncedSearch,
    page: page + 1,
    perPage: pageSize,
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(0)
  }

  function handleClearSearch() {
    setSearch("")
    setPage(0)
  }

  function handlePageSizeChange(nextSize: number) {
    setPageSize(nextSize)
    setPage(0)
  }

  function handleRefresh() {
    const id = toast.loading("Refreshing vendor GST details…")
    partyView.refetch().then(
      () => toast.success("Vendor GST details updated.", { id }),
      () => toast.error("Failed to refresh. Try again.", { id }),
    )
  }

  const { isLoading, isError, isFetching, total } = partyView

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-9 font-normal tracking-tight">
            Vendor GST Details
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Party and brand line items with billing amounts and regional locations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VendorGstTemplateButton target="details" />
          <UploadVendorGstButton target="details" />
          <DeleteVendorGstDetailsButton
            ids={partyView.all.map((r) => r.id)}
            disabled={isLoading || isError}
          />
          <ExportGstDetailsListButton
            items={partyView.all}
            disabled={isLoading || isError}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                Total Records:
              </span>
              <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
                {total}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search party, brand, GSTIN…"
                value={search}
                onChange={handleSearchChange}
                className="pr-8 pl-8 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-destructive text-sm font-medium">
                Failed to load Vendor GST details.
              </p>
              <Button variant="secondary" size="sm" onClick={() => partyView.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={partyView.rows}
              totalRows={partyView.total}
              pageIndex={page}
              pageSize={pageSize}
              pageCount={partyView.pageCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              emptyMessage={
                search.trim()
                  ? "No details match your search."
                  : "No GST details records found."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
