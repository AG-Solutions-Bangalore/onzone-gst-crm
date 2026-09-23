import * as React from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { ArrowLeft, Check, Copy } from "lucide-react"

import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { gstinStatusVariant } from "@/modules/vendor/components/vendor-columns.tsx"
import { useVendorGstDetails } from "@/modules/vendor/hooks/use-vendors.ts"

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
  const { vendor, isLoading, isError, refetch } = useVendorGstDetails(gstin)
  const [copied, setCopied] = React.useState(false)

  async function copyGstin() {
    if (!vendor) return
    try {
      await navigator.clipboard.writeText(vendor.vendor_gst)
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

  if (isError || !vendor) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/vendors">
            <ArrowLeft className="size-4" /> Vendors
          </Link>
        </Button>
        <p className="text-lg font-medium">
          {isError ? "Couldn't load vendor details." : "Vendor not found."}
        </p>
        <p className="text-muted-foreground font-mono text-sm">{gstin}</p>
        {isError && (
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
        <Link to="/vendors">
          <ArrowLeft className="size-4" /> Vendors
        </Link>
      </Button>

      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <h1 className="truncate text-[28px] leading-9 font-normal tracking-tight">
              {vendor.business_name || vendor.legal_name || vendor.vendor_gst}
            </h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-1.5 font-mono text-sm">
              <span>
                {vendor.vendor_gst}
                {vendor.pan_number ? ` · PAN ${vendor.pan_number}` : ""}
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
          <div className="flex flex-wrap gap-2">
            <Badge variant={gstinStatusVariant(vendor.gstin_status)}>
              {vendor.gstin_status || "Unknown"}
            </Badge>
            {vendor.taxpayer_type && (
              <Badge variant="outline">{vendor.taxpayer_type}</Badge>
            )}
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
              <Field label="Legal name" value={vendor.legal_name} />
              <Field label="Constitution" value={vendor.constitution_of_business} />
              <Field label="Taxpayer type" value={vendor.taxpayer_type} />
              <Field label="Date of registration" value={vendor.date_of_registration} />
              <Field label="Nature of business" value={vendor.nature_of_business} />
              <Field label="Business activities" value={vendor.nature_bus_activities} />
              <Field
                label="Core activity"
                value={vendor.nature_of_core_business_activity_description}
              />
              <Field label="Promoters" value={vendor.promoters} />
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="Address" value={vendor.address} />
              <Field label="Email" value={vendor.email} />
              <Field label="Mobile" value={vendor.mobile} />
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="GSTIN status" value={vendor.gstin_status} />
              <Field label="Date of cancellation" value={vendor.date_of_cancellation} />
              <Field label="Annual turnover" value={vendor.annual_turnover} />
              <Field label="Turnover FY" value={vendor.annual_turnover_fy} />
              <Field label="Aadhaar validation" value={vendor.aadhaar_validation} />
              <Field
                label="E-invoice"
                value={
                  vendor.einvoice_status === null ||
                  vendor.einvoice_status === undefined
                    ? null
                    : vendor.einvoice_status
                      ? "Enabled"
                      : "Not enabled"
                }
              />
              <Field label="Field visit conducted" value={vendor.field_visit_conducted} />
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <CardHeader>
            <CardTitle>Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
              <Field label="Center" value={vendor.center_jurisdiction} />
              <Field label="State" value={vendor.state_jurisdiction} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
