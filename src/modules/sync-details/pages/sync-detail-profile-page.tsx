import * as React from "react"
import { Link, useParams } from "react-router-dom"
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

/** `/sync-details/:gstin` — full GST profile for one vendor. */
export function SyncDetailProfilePage() {
  const { gstin } = useParams()
  const {
    vendor,
    isLoading: isSyncLoading,
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

  // If vendor was imported in details list but not yet synced from GST Portal,
  // create fallback profile so details are immediately accessible without error.
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

  if (!effectiveVendor) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-base font-medium">Vendor not found</p>
        <p className="text-muted-foreground text-sm">
          No profile found for GSTIN{" "}
          <span className="font-mono">{gstin}</span>.
        </p>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/sync-details">
            <ArrowLeft className="size-4" /> Back to Sync Details
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sync-details">
            <ArrowLeft className="size-4" /> Sync Details
          </Link>
        </Button>
        <ExportVendorDetailsButton vendor={effectiveVendor} partyRows={partyRows} />
      </div>

      {/* Info banner for imported vendors pending official GST Portal verification */}
      {!isSyncedFromPortal && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-start gap-3 rounded-lg border p-4 text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">GST Portal Verification Pending</span>
            <span>
              This vendor was imported via party/brand line items, but full taxpayer registration details
              have not yet been synchronized from the government GST portal. Run GST Sync from Sync Details to fetch the official profile.
            </span>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {effectiveVendor.business_name || effectiveVendor.legal_name || "—"}
              </h2>
              {effectiveVendor.legal_name &&
                effectiveVendor.business_name &&
                effectiveVendor.legal_name !== effectiveVendor.business_name && (
                  <p className="text-muted-foreground text-sm">
                    Legal: {effectiveVendor.legal_name}
                  </p>
                )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="bg-muted font-mono text-sm font-semibold px-2.5 py-1 rounded-md">
                  {effectiveVendor.vendor_gst}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={copyGstin}
                  title="Copy GSTIN"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
                <Badge variant={gstinStatusVariant(effectiveVendor.gstin_status)}>
                  {effectiveVendor.gstin_status || "Unknown"}
                </Badge>
                {effectiveVendor.taxpayer_type && (
                  <Badge variant="outline">{effectiveVendor.taxpayer_type}</Badge>
                )}
                {effectiveVendor.constitution_of_business && (
                  <Badge variant="outline">
                    {effectiveVendor.constitution_of_business}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Details */}
      <div className="grid grid-cols-12 gap-4">
        {/* Business & Registration */}
        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base">Business & Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-border/60 divide-y">
              <Field label="Legal name" value={effectiveVendor.legal_name} />
              <Field label="PAN Number" value={effectiveVendor.pan_number} />
              <Field label="Constitution" value={effectiveVendor.constitution_of_business} />
              <Field label="Taxpayer type" value={effectiveVendor.taxpayer_type} />
              <Field
                label="Date of Registration"
                value={effectiveVendor.date_of_registration}
              />
              <Field
                label="Nature of Business"
                value={effectiveVendor.nature_of_business}
              />
              <Field
                label="Core Business Activity"
                value={effectiveVendor.nature_of_core_business_activity_description}
              />
              <Field label="Promoters" value={effectiveVendor.promoters} />
            </dl>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base">Contact & Location</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-border/60 divide-y">
              <Field label="Principal Address" value={effectiveVendor.address} />
              <Field label="Email" value={effectiveVendor.email} />
              <Field label="Mobile" value={effectiveVendor.mobile} />
              <Field
                label="Jurisdiction (Center)"
                value={effectiveVendor.center_jurisdiction}
              />
              <Field
                label="Jurisdiction (State)"
                value={effectiveVendor.state_jurisdiction}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-border/60 divide-y">
              <Field label="GSTIN status" value={effectiveVendor.gstin_status} />
              <Field
                label="Date of cancellation"
                value={effectiveVendor.date_of_cancellation}
              />
              <Field
                label="Annual turnover"
                value={
                  effectiveVendor.annual_turnover
                    ? `${effectiveVendor.annual_turnover} ${
                        effectiveVendor.annual_turnover_fy
                          ? `(${effectiveVendor.annual_turnover_fy})`
                          : ""
                      }`
                    : null
                }
              />
              <Field
                label="Aadhaar validation"
                value={effectiveVendor.aadhaar_validation}
              />
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
              <Field
                label="Field visit conducted"
                value={effectiveVendor.field_visit_conducted}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Linked Brand / Party Sales Line Items */}
        {partyRows.length > 0 && (
          <Card className="col-span-12">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Party & Brand Details ({partyRows.length})
                  </CardTitle>
                  <p className="text-muted-foreground text-xs mt-1">
                    Sales transactions and brand entries associated with this GSTIN
                  </p>
                </div>
                <span className="bg-muted text-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                  {partyRows.length} items
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={gstDetailsTableColumns}
                data={partyRows}
                pageSize={10}
                emptyMessage="No linked brand or party records found for this GSTIN."
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
