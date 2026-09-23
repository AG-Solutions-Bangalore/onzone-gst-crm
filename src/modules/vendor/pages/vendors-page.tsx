import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { RefreshCw } from "lucide-react"

import { DataTable } from "@/components/data-table.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
} from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { vendorTableColumns } from "@/modules/vendor/components/vendor-columns.tsx"
import {
  useVendorGstDetailsList,
  useVendorGstList,
} from "@/modules/vendor/hooks/use-vendors.ts"
import type { VendorTableRow } from "@/modules/vendor/types/vendor.types.ts"

type StatusFilter = "all" | "active" | "attention"
type TypeFilter = "all" | "Regular" | "Composition"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "attention", label: "Needs attention" },
]

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Regular", label: "Regular" },
  { value: "Composition", label: "Composition" },
]

/** `/vendors` — registry joining the GST list + details list. */
export function VendorsPage() {
  const listQuery = useVendorGstList()
  const detailsQuery = useVendorGstDetailsList()
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

  function updateParams(next: { status: StatusFilter; type: TypeFilter }) {
    const params: Record<string, string> = {}
    if (next.status !== "all") params.status = next.status
    if (next.type !== "all") params.type = next.type
    setSearchParams(params, { replace: true })
  }

  const rows = React.useMemo<VendorTableRow[]>(() => {
    const fetchByGstin = new Map(
      (listQuery.data ?? []).map((v) => [v.vendor_gst, v.vendor_gst_status]),
    )
    return (detailsQuery.data ?? []).map((v) => ({
      ...v,
      fetchStatus: fetchByGstin.get(v.vendor_gst),
    }))
  }, [listQuery.data, detailsQuery.data])

  const counts = React.useMemo(() => {
    const active = rows.filter((r) => r.gstin_status === "Active").length
    return {
      all: rows.length,
      active,
      attention: rows.length - active,
    }
  }, [rows])

  const filteredRows = React.useMemo(() => {
    return rows.filter((r) => {
      if (status === "active" && r.gstin_status !== "Active") return false
      if (status === "attention" && r.gstin_status === "Active") return false
      if (type !== "all" && r.taxpayer_type !== type) return false
      return true
    })
  }, [rows, status, type])

  const isLoading = listQuery.isLoading || detailsQuery.isLoading
  const isError = listQuery.isError || detailsQuery.isError
  const isFiltered = status !== "all" || type !== "all"

  function handleRefresh() {
    void Promise.all([listQuery.refetch(), detailsQuery.refetch()])
    toast("Refreshing vendor registry…")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-9 font-normal tracking-tight">
            Vendors
          </h1>
          <p className="text-muted-foreground text-sm">
            Every GSTIN in the workspace — search, filter, and open a profile.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh}>
          <RefreshCw className="size-3" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-sm">Failed to load vendors.</p>
              <Button variant="secondary" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground w-14 text-xs">
                    Status
                  </span>
                  {STATUS_FILTERS.map((f) => (
                    <Button
                      key={f.value}
                      size="sm"
                      variant={status === f.value ? "default" : "secondary"}
                      onClick={() => updateParams({ status: f.value, type })}
                    >
                      {f.label}
                      <span className="tabular-nums opacity-70">
                        {counts[f.value]}
                      </span>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground w-14 text-xs">
                    Type
                  </span>
                  {TYPE_FILTERS.map((f) => (
                    <Button
                      key={f.value}
                      size="sm"
                      variant={type === f.value ? "default" : "secondary"}
                      onClick={() => updateParams({ status, type: f.value })}
                    >
                      {f.label}
                    </Button>
                  ))}
                  <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                    Showing {filteredRows.length} of {rows.length}
                  </span>
                </div>
              </div>
              <DataTable
                key={`${status}-${type}`}
                columns={vendorTableColumns}
                data={filteredRows}
                searchPlaceholder="Search GSTIN, business…"
                pageSize={10}
                emptyMessage={
                  isFiltered
                    ? "No vendors match these filters."
                    : "No vendors found."
                }
                onRowClick={(row) => navigate(`/vendors/${row.vendor_gst}`)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
