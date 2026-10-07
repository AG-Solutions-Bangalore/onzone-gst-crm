import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Loader2, RefreshCw, Search, X } from "lucide-react"

import { DataTable } from "@/components/data-table.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { SEARCH_DEBOUNCE_MS } from "@/lib/pagination.ts"
import { cn } from "@/lib/utils.ts"
import { UpdateVendorGstDetailsButton } from "@/modules/vendor/components/update-vendor-gst-details-button.tsx"
import { ExportVendorsButton } from "@/modules/vendor/components/export-vendors-button.tsx"
import { syncDetailsColumns } from "@/modules/sync-details/components/sync-details-columns.tsx"
import { useVendorProfilesView } from "@/modules/vendor/hooks/use-vendor-sync.ts"

type StatusFilter = "all" | "active" | "attention"
type TypeFilter = "all" | "Regular" | "Composition"

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Regular", label: "Regular" },
  { value: "Composition", label: "Composition" },
]

/** `/sync-details` — Portal-synced vendor profiles with filters, search, sync trigger, and Excel export. */
export function SyncDetailsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const statusParam = searchParams.get("status")
  const status: StatusFilter =
    statusParam === "active" || statusParam === "attention"
      ? statusParam
      : "all"

  const typeParam = searchParams.get("type")
  const type: TypeFilter =
    typeParam === "Regular" || typeParam === "Composition" ? typeParam : "all"

  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  const profilesView = useVendorProfilesView({
    search: debouncedSearch,
    status,
    type,
    page: page + 1,
    perPage: pageSize,
  })

  function updateStatus(nextStatus: StatusFilter) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (nextStatus !== "all") params.set("status", nextStatus)
        else params.delete("status")
        return params
      },
      { replace: true },
    )
    setPage(0)
  }

  function updateType(nextType: TypeFilter) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (nextType !== "all") params.set("type", nextType)
        else params.delete("type")
        return params
      },
      { replace: true },
    )
    setPage(0)
  }

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
    const id = toast.loading("Refreshing GST sync details…")
    profilesView.refetch().then(
      () => toast.success("GST sync details updated.", { id }),
      () => toast.error("Failed to refresh. Try again.", { id }),
    )
  }

  const { counts, isLoading, isError, isFetching } = profilesView

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-9 font-normal tracking-tight">
            Sync Details
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            GST Portal verified vendor profiles, active taxpayer data, and compliance records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UpdateVendorGstDetailsButton />
          <ExportVendorsButton
            rows={profilesView.all}
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
            <div className="flex flex-wrap items-center gap-2">
              {/* Status pills */}
              <div className="border-border/60 bg-muted/20 flex items-center rounded-lg border p-1 text-xs">
                {(
                  [
                    { id: "all", label: "All", count: counts.all },
                    { id: "active", label: "Active", count: counts.active },
                    { id: "attention", label: "Needs attention", count: counts.attention },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateStatus(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all",
                      status === item.id
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{item.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums",
                        status === item.id
                          ? "bg-muted text-foreground"
                          : "bg-muted/60 text-muted-foreground",
                      )}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Taxpayer type filter */}
              <select
                value={type}
                onChange={(e) => updateType(e.target.value as TypeFilter)}
                aria-label="Taxpayer type"
                className="bg-card text-foreground border-input focus-visible:border-ring h-9 w-36 rounded-md border px-2 text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/10"
              >
                {TYPE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search vendor, PAN, GSTIN…"
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
                Failed to load Sync Details.
              </p>
              <Button variant="secondary" size="sm" onClick={() => profilesView.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              columns={syncDetailsColumns}
              data={profilesView.rows}
              totalRows={profilesView.total}
              pageIndex={page}
              pageSize={pageSize}
              pageCount={profilesView.pageCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              onRowClick={(row) => navigate(`/sync-details/${row.vendor_gst}`)}
              emptyMessage={
                search.trim() || status !== "all" || type !== "all"
                  ? "No sync records match your search / filters."
                  : "No sync details records found."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
