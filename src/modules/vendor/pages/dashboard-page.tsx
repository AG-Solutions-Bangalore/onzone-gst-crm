import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ChevronRight,
  Loader2,
  Receipt,
  RefreshCw,
} from "lucide-react"

import { DataTable } from "@/components/data-table.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { attentionColumns } from "@/modules/vendor/components/vendor-columns.tsx"
import { StatCard } from "@/modules/vendor/components/stat-card.tsx"
import { useVendorGstDetailsList } from "@/modules/vendor/hooks/use-vendors.ts"

function countBy<T>(items: T[], key: (item: T) => string): [string, number][] {
  const map = new Map<string, number>()
  for (const item of items) {
    const k = key(item) || "Unknown"
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

function DistributionBars({
  title,
  description,
  entries,
  total,
}: {
  title: string
  description: string
  entries: [string, number][]
  total: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.map(([label, count]) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{label}</span>
              <span className="text-muted-foreground ml-2 shrink-0 tabular-nums">
                {count}
              </span>
            </div>
            <div className="bg-surface-low h-2 overflow-hidden rounded-full">
              <div
                className="bg-secondary h-full rounded-full transition-all"
                style={{ width: `${total ? (count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** `/` — vendor GST overview: KPIs, breakdowns, attention list. */
export function DashboardPage() {
  const detailsQuery = useVendorGstDetailsList()
  const navigate = useNavigate()
  const vendors = React.useMemo(
    () => detailsQuery.data ?? [],
    [detailsQuery.data],
  )

  const stats = React.useMemo(() => {
    const total = vendors.length
    const active = vendors.filter((v) => v.gstin_status === "Active").length
    const attention = vendors.filter((v) => v.gstin_status !== "Active").length
    const composition = vendors.filter(
      (v) => v.taxpayer_type === "Composition",
    ).length
    return { total, active, attention, composition }
  }, [vendors])

  const attentionVendors = React.useMemo(
    () => vendors.filter((v) => v.gstin_status !== "Active"),
    [vendors],
  )

  const recentVendors = React.useMemo(
    () =>
      [...vendors]
        .filter((v) => v.date_of_registration)
        .sort((a, b) =>
          String(b.date_of_registration).localeCompare(
            String(a.date_of_registration),
          ),
        )
        .slice(0, 5),
    [vendors],
  )

  const statusEntries = React.useMemo(
    () => countBy(vendors, (v) => v.gstin_status ?? "Unknown"),
    [vendors],
  )
  const taxpayerEntries = React.useMemo(
    () => countBy(vendors, (v) => v.taxpayer_type ?? "Unknown"),
    [vendors],
  )

  function handleRefresh() {
    const id = toast.loading("Refreshing vendor data…")
    void detailsQuery.refetch().then((result) => {
      if (result.isError) {
        toast.error("Refresh failed. Try again.", { id })
      } else {
        toast.success("Vendor data up to date.", { id })
      }
    })
  }

  if (detailsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="col-span-12 h-28 sm:col-span-6 lg:col-span-3" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (detailsQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-lg font-medium">Couldn't load vendor data.</p>
        <p className="text-muted-foreground text-sm">
          Check your connection and try again.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void detailsQuery.refetch()
            toast("Retrying…")
          }}
        >
          <RefreshCw className="size-3" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-9 font-normal tracking-tight">
            Vendor GST overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Live GST data · {stats.total} vendors tracked
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={detailsQuery.isFetching}
        >
          {detailsQuery.isFetching ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          {detailsQuery.isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            label="Total vendors"
            value={String(stats.total)}
            hint="tracked GSTINs"
            icon={Building2}
            to="/vendors"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            label="Active GSTIN"
            value={String(stats.active)}
            hint="filing-ready taxpayers"
            icon={BadgeCheck}
            tone="success"
            to="/vendors?status=active"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            label="Needs attention"
            value={String(stats.attention)}
            hint="suspended / cancelled"
            icon={AlertTriangle}
            tone={stats.attention > 0 ? "error" : "default"}
            to="/vendors?status=attention"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            label="Composition dealers"
            value={String(stats.composition)}
            hint="of total vendors"
            icon={Receipt}
            tone="accent"
            to="/vendors?type=Composition"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Needs attention</CardTitle>
                <CardDescription>
                  Vendors whose GSTIN is not active — follow up before filing.
                </CardDescription>
              </div>
              {attentionVendors.length > 0 && (
                <Button variant="link" className="h-auto p-0" asChild>
                  <Link to="/vendors?status=attention">
                    View all <ChevronRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={attentionColumns}
              data={attentionVendors}
              pageSize={5}
              emptyMessage="All clear — every GSTIN is active."
              onRowClick={(row) => navigate(`/vendors/${row.vendor_gst}`)}
            />
          </CardContent>
        </Card>

        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <DistributionBars
            title="GSTIN status"
            description="Registration health across vendors."
            entries={statusEntries}
            total={stats.total}
          />
          <DistributionBars
            title="Taxpayer type"
            description="Regular vs composition split."
            entries={taxpayerEntries}
            total={stats.total}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently registered</CardTitle>
          <CardDescription>
            Latest GST registrations in the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-outline-variant">
          {recentVendors.map((v) => (
            <Link
              key={v.vendor_gst}
              to={`/vendors/${v.vendor_gst}`}
              className="hover:bg-surface-low flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {v.business_name || v.legal_name || v.vendor_gst}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {v.vendor_gst}
                </p>
              </div>
              <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs tabular-nums">
                {v.date_of_registration}
                <ChevronRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
