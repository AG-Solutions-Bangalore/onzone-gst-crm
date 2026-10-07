import * as React from "react"
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
import { VendorGstTemplateButton } from "@/modules/vendor/components/vendor-gst-template-button.tsx"
import { UploadVendorGstButton } from "@/modules/vendor/components/upload-vendor-gst-button.tsx"
import { ExportVendorGstButton } from "@/modules/vendor-gst/components/export-vendor-gst-button.tsx"
import { vendorGstTableColumns } from "@/modules/vendor-gst/components/vendor-gst-columns.tsx"
import { useVendorGstRegistryView } from "@/modules/vendor/hooks/use-vendor-registry.ts"

type StatusFilter = "all" | "Finished" | "Pending"

/** `/vendor-gst` — GSTIN registry list with search, status filters, bulk import, and Excel export. */
export function VendorGstPage() {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  const registryView = useVendorGstRegistryView({
    search: debouncedSearch,
    status,
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

  function handleStatusChange(next: StatusFilter) {
    setStatus(next)
    setPage(0)
  }

  function handlePageSizeChange(nextSize: number) {
    setPageSize(nextSize)
    setPage(0)
  }

  function handleRefresh() {
    const id = toast.loading("Refreshing vendor GST registry…")
    registryView.refetch().then(
      () => toast.success("Vendor GST list updated.", { id }),
      () => toast.error("Failed to refresh. Try again.", { id }),
    )
  }

  const { counts, isLoading, isError, isFetching } = registryView

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-9 font-normal tracking-tight">
            Vendor GST
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Registry of GST numbers for verification and sync status tracking
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VendorGstTemplateButton target="gstin" />
          <UploadVendorGstButton target="gstin" />
          <ExportVendorGstButton
            rows={registryView.all}
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
          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status pills */}
              <div className="border-border/60 bg-muted/20 flex items-center rounded-lg border p-1 text-xs">
                {(
                  [
                    { id: "all", label: "All", count: counts.all },
                    { id: "Finished", label: "Finished", count: counts.finished },
                    { id: "Pending", label: "Pending", count: counts.pending },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleStatusChange(item.id)}
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
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search GSTIN or tag…"
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

          {/* Data Table */}
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
                Failed to load Vendor GST registry.
              </p>
              <Button variant="secondary" size="sm" onClick={() => registryView.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              columns={vendorGstTableColumns}
              data={registryView.rows}
              totalRows={registryView.total}
              manualPagination
              pageIndex={page}
              pageSize={pageSize}
              pageCount={registryView.pageCount}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              emptyMessage={
                search.trim() || status !== "all"
                  ? "No GSTINs match your search/filter."
                  : "No GSTIN records found."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
