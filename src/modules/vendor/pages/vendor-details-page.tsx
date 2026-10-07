import * as React from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { AlertCircle, ArrowLeft, Check, Copy } from "lucide-react"

import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { DataTable } from "@/components/data-table.tsx"
import {
  gstDetailsTableColumns,
  gstinStatusVariant,
} from "@/modules/vendor/components/vendor-columns.tsx"
import { ExportVendorDetailsButton } from "@/modules/vendor/components/export-vendor-details-button.tsx"
import {
  useVendorGstDetails,
  useVendorGstSyncDetailsById,
  useVendorPartyRows,
} from "@/modules/vendor/hooks/use-vendors.ts"
import type { VendorGstSyncDetails } from "@/modules/vendor/types/vendor.types.ts"

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

/** `/vendors/:gstin` — full GST profile for one vendor. */
export function VendorDetailsPage() {
  const { gstin } = useParams()
  const [searchParams] = useSearchParams()
  const {
    vendor,
    isLoading: isSyncLoading,
    isError: isSyncError,
    refetch,
  } = useVendorGstDetails(gstin)

  // Party/brand rows: prefer the by-id endpoint (`{data, gstdetails}`),
  // fall back to the cached party list filtered by GSTIN.
  const byIdQuery = useVendorGstSyncDetailsById(vendor?.id)
  const partyRowsQuery = useVendorPartyRows(gstin)
  const partyRows =
    (byIdQuery.data?.gstdetails?.length ?? 0) > 0
      ? (byIdQuery.data?.gstdetails ?? [])
      : (partyRowsQuery.rows ?? [])
  const [copied, setCopied] = React.useState(false)

  // If vendor was imported in details list (vendor_gst_details.xlsx) but has not yet
  // been synced from GST Portal via /updateVendorGSTDetails, create a fallback profile
  // from party rows so details are immediately accessible without "Vendor not found" error.
  const fallbackVendor = React.useMemo<VendorGstSyncDetails | null>(() => {
    if (vendor) return vendor
    if (partyRows.length === 0 || !gstin) return null
    const first = partyRows[0]
    const cleanGstin = gstin.trim().toUpperCase()
    return {
      id: first.id,
      vendor_gst: cleanGstin,
      business_name: first.party_name,
      legal_name: first.party_name,
      pan_number: cleanGstin.length >= 12 ? cleanGstin.slice(2, 12) : null,
      address: first.address,
      town: first.town,
      district: first.district,
      belt: first.belt,
      gstin_status: "Unsynced",
      taxpayer_type: "Regular",
      constitution_of_business: null,
      date_of_registration: null,
      nature_of_business: null,
      nature_bus_activities: null,
      nature_of_core_business_activity_description: null,
      promoters: null,
      email: null,
      mobile: null,
      date_of_cancellation: null,
      annual_turnover: null,
      annual_turnover_fy: null,
      aadhaar_validation: null,
      einvoice_status: null,
      field_visit_conducted: null,
      center_jurisdiction: first.district || first.belt || null,
      state_jurisdiction: first.belt || null,
      created_at: first.created_at,
      updated_at: first.updated_at,
    }
  }, [vendor, partyRows, gstin])

  const effectiveVendor = vendor || fallbackVendor
  const isSyncedFromPortal = !!vendor
  const isLoading = isSyncLoading || partyRowsQuery.isLoading

  // Back link keeps the originating tab (?tab=details or ?view=details or sessionStorage)
  // so the registry restores it instead of resetting to Synced Vendors.
  const tabParam = searchParams.get("tab") || searchParams.get("view")
  const backTo = React.useMemo(() => {
    if (tabParam === "details" || tabParam === "synced") {
      return `/vendors?tab=${tabParam}`
    }
    try {
      const stored = sessionStorage.getItem("onzone.vendors.activeTab")
      if (stored === "details" || stored === "synced") {
        return `/vendors?tab=${stored}`
      }
    } catch {
      // ignore
    }
    return "/vendors"
  }, [tabParam])

  async function copyGstin() {
    if (!effectiveVendor) return
    try {
      await navigator.clipboard.writeText(effectiveVendor.vendor_gst)
      setCopied(true)
      toast.success("GSTIN copied to clipboard.")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy GSTIN.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="col-span-12 h-64 lg:col-span-6" />
          <Skeleton className="col-span-12 h-64 lg:col-span-6" />
        </div>
      </div>
    )
  }

  if ((isSyncError && partyRowsQuery.isError) || !effectiveVendor) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link to={backTo}>
            <ArrowLeft className="size-4" /> Vendors
          </Link>
        </Button>
        <p className="text-lg font-medium">
          {isSyncError ? "Couldn't load vendor details." : "Vendor not found."}
        </p>
        <p className="text-muted-foreground font-mono text-sm">{gstin}</p>
        <p className="text-muted-foreground text-xs">
          This GSTIN has neither been synced from the GST Portal nor imported via GST details.
        </p>
        {isSyncError && (
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="tertiary" size="inline" className="w-fit" asChild>
        <Link to={backTo}>
          <ArrowLeft className="size-4" /> Vendors
        </Link>
      </Button>

      {/* Info banner for imported vendors pending official GST Portal verification */}
      {!isSyncedFromPortal && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          <AlertCircle className="size-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-300">
              GST Line Items Imported — GST Portal Sync Pending
            </p>
            <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
              This vendor was imported from <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">vendor_gst_details.xlsx</code> with {partyRows.length} brand line items.
              Official government registration details (promoters, constitution, turnover) will populate once synced via <strong>Sync from GST</strong> in the registry.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <h1 className="truncate text-[28px] leading-9 font-normal tracking-tight">
              {effectiveVendor.business_name || effectiveVendor.legal_name || effectiveVendor.vendor_gst}
            </h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-1.5 font-mono text-sm">
              <span>
                {effectiveVendor.vendor_gst}
                {effectiveVendor.pan_number ? ` · PAN ${effectiveVendor.pan_number}` : ""}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Copy GSTIN"
                onClick={copyGstin}
                className="size-7"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={gstinStatusVariant(effectiveVendor.gstin_status)}>
              {effectiveVendor.gstin_status || "Unknown"}
            </Badge>
            {effectiveVendor.taxpayer_type && (
              <Badge variant="outline">{effectiveVendor.taxpayer_type}</Badge>
            )}
            <ExportVendorDetailsButton vendor={effectiveVendor} partyRows={partyRows} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Business</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="Legal name" value={effectiveVendor.legal_name} />
              <Field label="Constitution" value={effectiveVendor.constitution_of_business} />
              <Field label="Taxpayer type" value={effectiveVendor.taxpayer_type} />
              <Field label="Date of registration" value={effectiveVendor.date_of_registration} />
              <Field label="Nature of business" value={effectiveVendor.nature_of_business} />
              <Field label="Business activities" value={effectiveVendor.nature_bus_activities} />
              <Field
                label="Core activity"
                value={effectiveVendor.nature_of_core_business_activity_description}
              />
              <Field label="Promoters" value={effectiveVendor.promoters} />
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="Address" value={effectiveVendor.address} />
              <Field label="Email" value={effectiveVendor.email} />
              <Field label="Mobile" value={effectiveVendor.mobile} />
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="GSTIN status" value={effectiveVendor.gstin_status} />
              <Field label="Date of cancellation" value={effectiveVendor.date_of_cancellation} />
              <Field label="Annual turnover" value={effectiveVendor.annual_turnover} />
              <Field label="Turnover FY" value={effectiveVendor.annual_turnover_fy} />
              <Field label="Aadhaar validation" value={effectiveVendor.aadhaar_validation} />
              <Field
                label="E-invoice"
                value={
                  effectiveVendor.einvoice_status === null ||
                  effectiveVendor.einvoice_status === undefined
                    ? null
                    : effectiveVendor.einvoice_status
                      ? "Enabled"
                      : "Not enabled"
                }
              />
              <Field label="Field visit conducted" value={effectiveVendor.field_visit_conducted} />
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="Center" value={effectiveVendor.center_jurisdiction} />
              <Field label="State" value={effectiveVendor.state_jurisdiction} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {partyRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Party & brand details ({partyRows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={gstDetailsTableColumns}
              data={partyRows}
              searchPlaceholder="Search party, brand…"
              pageSize={10}
              emptyMessage="No party details for this GSTIN."
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

