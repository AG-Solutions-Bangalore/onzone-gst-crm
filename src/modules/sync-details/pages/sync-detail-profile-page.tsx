import * as React from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  FileUser,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  ChartColumn,
} from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import {
  formatINR,
  groupPartyRowsByBrand,
} from "@/modules/vendor/components/vendor-columns.tsx"
import { ExportVendorDetailsButton } from "@/modules/vendor/components/export-vendor-details-button.tsx"
import {
  useVendorGstDetails,
  useVendorGstSyncDetailsById,
  useVendorPartyRows,
} from "@/modules/vendor/hooks/use-vendors.ts"
import type { VendorGstSyncDetails } from "@/modules/vendor/types/vendor.types.ts"
import { cn } from "@/lib/utils.ts"

const FY_OPTIONS = ["FY 2025-26", "FY 2024-25", "FY 2023-24"]

/** "20-10-2017" / ISO → "20 Oct 2017". Falls back to the raw value. */
function formatRegDate(val?: string | null): string | null {
  if (!val) return null
  const trimmed = val.trim()
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  let d: Date | null = null
  if (dmy) {
    d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
  } else {
    const parsed = new Date(trimmed)
    if (!isNaN(parsed.getTime())) d = parsed
  }
  if (!d || isNaN(d.getTime())) return trimmed
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatJurisdiction(state?: string | null, center?: string | null) {
  let stateLine: string | null = null
  let centerLine: string | null = null

  if (state) {
    const trimmed = state.trim()
    stateLine = /^state\s*[-:]/i.test(trimmed) ? trimmed : `State - ${trimmed}`
  }

  if (center) {
    const trimmed = center.trim()
    centerLine = /^(division|center|circle)\s*[-:]/i.test(trimmed)
      ? trimmed
      : `Division - ${trimmed}`
  }

  return { stateLine, centerLine }
}

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string
  value?: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3.5 border-b border-[#18202f]",
        isLast && "border-b-0 pb-1",
      )}
    >
      <span className="text-[#8c9bab] text-sm shrink-0">{label}</span>
      <span className="text-white text-right text-sm font-medium break-words">
        {value ?? "—"}
      </span>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  children,
  isLast = false,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 border-b border-[#18202f]",
        isLast && "border-b-0 pb-1",
      )}
    >
      <Icon className="text-[#8c9bab] mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <span className="text-[#8c9bab] text-xs">{label}</span>
        <div className="text-slate-200 text-sm mt-0.5 leading-snug break-words">
          {children}
        </div>
      </div>
    </div>
  )
}

/** `/sync-details/:gstin` — full GST profile for one vendor matching the reference dark UI design. */
export function SyncDetailProfilePage() {
  const { gstin } = useParams()
  const { vendor, isLoading: isSyncLoading } = useVendorGstDetails(gstin)

  // Party/brand rows: prefer the by-id endpoint (`{data, gstdetails}`),
  // fall back to the cached party list filtered by GSTIN.
  const byIdQuery = useVendorGstSyncDetailsById(vendor?.id)
  const partyRowsQuery = useVendorPartyRows(gstin)
  const partyRows =
    (byIdQuery.data?.gstdetails?.length ?? 0) > 0
      ? (byIdQuery.data?.gstdetails ?? [])
      : (partyRowsQuery.rows ?? [])
  const [copied, setCopied] = React.useState(false)
  const [fy, setFy] = React.useState(FY_OPTIONS[0])

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
      gstin_status: "Active",
      taxpayer_type: "Regular",
      constitution_of_business: "Proprietorship",
      date_of_registration: null,
      nature_of_business: "Retail Business",
      nature_bus_activities: "Trader, Retailer",
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

  const brandRows = React.useMemo(() => groupPartyRowsByBrand(partyRows), [partyRows])

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
        <Skeleton className="h-8 w-36 bg-[#161d2b]" />
        <Skeleton className="h-44 w-full rounded-2xl bg-[#0f141f]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-2xl bg-[#0f141f]" />
          <Skeleton className="h-64 rounded-2xl bg-[#0f141f]" />
          <Skeleton className="h-64 rounded-2xl bg-[#0f141f]" />
        </div>
        <Skeleton className="h-56 rounded-2xl bg-[#0f141f]" />
      </div>
    )
  }

  if (!effectiveVendor) {
    return (
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center text-white">
        <p className="text-base font-semibold">Vendor not found</p>
        <p className="text-[#8c9bab] text-sm">
          No profile found for GSTIN <span className="font-mono text-white">{gstin}</span>.
        </p>
        <Button variant="secondary" size="sm" asChild className="mt-2">
          <Link to="/sync-details">
            <ArrowLeft className="size-4" /> Back to Sync Details
          </Link>
        </Button>
      </div>
    )
  }

  const title = effectiveVendor.business_name || effectiveVendor.legal_name || "—"
  const regDate = formatRegDate(effectiveVendor.date_of_registration)
  const natureTitle = effectiveVendor.nature_of_business || "Retail Business"
  const natureSub =
    effectiveVendor.nature_bus_activities ||
    effectiveVendor.nature_of_core_business_activity_description ||
    "Trader, Retailer"

  const rawStatus = (effectiveVendor.gstin_status || "Active").trim()
  const isActive = rawStatus.toLowerCase() === "active"
  const statusText = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)
  const taxpayerType = effectiveVendor.taxpayer_type?.trim() || "Regular"
  const constitution = effectiveVendor.constitution_of_business?.trim() || "Proprietorship"

  const { stateLine, centerLine } = formatJurisdiction(
    effectiveVendor.state_jurisdiction,
    effectiveVendor.center_jurisdiction,
  )

  const annualTurnover = effectiveVendor.annual_turnover || null
  const annualTurnoverFy = effectiveVendor.annual_turnover_fy
    ? effectiveVendor.annual_turnover_fy.replace(/[()]/g, "").trim()
    : null

  const einvoiceText =
    effectiveVendor.einvoice_status === null || effectiveVendor.einvoice_status === undefined
      ? "Not enabled"
      : effectiveVendor.einvoice_status === true || String(effectiveVendor.einvoice_status).toLowerCase() === "enabled"
        ? "Enabled"
        : "Not enabled"

  const aadhaarText =
    effectiveVendor.aadhaar_validation === null || effectiveVendor.aadhaar_validation === undefined || effectiveVendor.aadhaar_validation === ""
      ? "No"
      : String(effectiveVendor.aadhaar_validation).toLowerCase() === "yes" || String(effectiveVendor.aadhaar_validation).toLowerCase() === "true"
        ? "Yes"
        : String(effectiveVendor.aadhaar_validation)

  const fieldVisitText =
    effectiveVendor.field_visit_conducted === null || effectiveVendor.field_visit_conducted === undefined || effectiveVendor.field_visit_conducted === ""
      ? "No"
      : String(effectiveVendor.field_visit_conducted).toLowerCase() === "yes" || String(effectiveVendor.field_visit_conducted).toLowerCase() === "true"
        ? "Yes"
        : String(effectiveVendor.field_visit_conducted)

  return (
    <div className="flex flex-col gap-4 font-sans text-white">
      {/* Top action navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-[#8c9bab] hover:text-white hover:bg-[#141b27]"
        >
          <Link to="/sync-details">
            <ArrowLeft className="size-4" /> Sync Details
          </Link>
        </Button>
        <ExportVendorDetailsButton vendor={effectiveVendor} partyRows={partyRows} />
      </div>

      {/* Info banner for un-synced vendors */}
      {!isSyncedFromPortal && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-start gap-3 rounded-xl border p-4 text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">GST Portal Verification Pending</span>
            <span className="text-[#cbd5e1]">
              This vendor was imported via party/brand line items, but full taxpayer registration details
              have not yet been synchronized from the government GST portal. Run GST Sync from Sync Details to fetch the official profile.
            </span>
          </div>
        </div>
      )}

      {/* ── Top Header Card ────────────────────────────────────────── */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-2xl p-6 md:p-7 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Avatar + Title + GSTIN + Badges */}
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-full bg-[#162338] border border-[#233554]/60 flex items-center justify-center shrink-0">
              <Store className="size-7 text-[#4aa5ff]" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-2xl md:text-[26px] font-bold tracking-tight text-white leading-tight">
                {title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-[#8c9bab]">
                  GSTIN: {effectiveVendor.vendor_gst}
                </span>
                <button
                  type="button"
                  onClick={copyGstin}
                  title="Copy GSTIN"
                  className="text-[#8c9bab] hover:text-white transition-colors cursor-pointer inline-flex items-center"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold",
                    isActive
                      ? "bg-[#0b261b] border border-[#14532d] text-[#34d399]"
                      : "bg-[#241a1a] border border-[#531414] text-[#f87171]",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isActive ? "bg-[#10b981]" : "bg-red-400",
                    )}
                  />
                  {statusText}
                </span>
                {taxpayerType && (
                  <span className="inline-flex items-center rounded-full px-3.5 py-0.5 text-xs font-medium bg-[#141b27] border border-[#222c3d] text-[#cbd5e1]">
                    {taxpayerType}
                  </span>
                )}
                {constitution && (
                  <span className="inline-flex items-center rounded-full px-3.5 py-0.5 text-xs font-medium bg-[#141b27] border border-[#222c3d] text-[#cbd5e1]">
                    {constitution}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Registered on + Nature of business */}
          <div className="flex flex-wrap items-center gap-8 lg:gap-12 shrink-0">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-6 text-[#94a3b8] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-[#8c9bab]">Registered on</span>
                <span className="text-sm font-bold text-white whitespace-nowrap">
                  {regDate || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="size-6 text-[#94a3b8] shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white whitespace-nowrap">
                  {natureTitle}
                </span>
                <span className="text-xs text-[#8c9bab] whitespace-nowrap">
                  {natureSub}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle: 3 Info Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Business Details */}
        <div className="bg-[#0f141f] border border-[#1e2638] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-2">
              <FileUser className="size-5 text-[#38bdf8]" />
              <h3 className="text-base font-semibold text-white">Business Details</h3>
            </div>
            <DetailRow label="Legal Name" value={effectiveVendor.legal_name} />
            <DetailRow label="PAN Number" value={effectiveVendor.pan_number} />
            <DetailRow label="Constitution" value={constitution} isLast />
          </div>
        </div>

        {/* Card 2: Contact & Location */}
        <div className="bg-[#0f141f] border border-[#1e2638] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-2">
            <MapPin className="size-5 text-[#818cf8]" />
            <h3 className="text-base font-semibold text-white">Contact & Location</h3>
          </div>
          <ContactRow icon={MapPin} label="Address">
            {effectiveVendor.address || "—"}
          </ContactRow>
          <ContactRow icon={Mail} label="Email">
            {effectiveVendor.email || "—"}
          </ContactRow>
          <ContactRow icon={Phone} label="Mobile">
            {effectiveVendor.mobile || "—"}
          </ContactRow>
          <ContactRow icon={Landmark} label="Jurisdiction" isLast>
            {stateLine && <div>{stateLine}</div>}
            {centerLine && <div>{centerLine}</div>}
            {!stateLine && !centerLine && <div>—</div>}
          </ContactRow>
        </div>

        {/* Card 3: Compliance */}
        <div className="bg-[#0f141f] border border-[#1e2638] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-2">
            <ShieldCheck className="size-5 text-[#34d399]" />
            <h3 className="text-base font-semibold text-white">Compliance</h3>
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-[#18202f]">
            <span className="text-sm text-[#8c9bab]">GSTIN Status</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold",
                isActive
                  ? "bg-[#0b261b] border border-[#14532d] text-[#34d399]"
                  : "bg-[#241a1a] border border-[#531414] text-[#f87171]",
              )}
            >
              {statusText}
            </span>
          </div>
          <div className="flex items-start justify-between py-3.5 border-b border-[#18202f]">
            <span className="text-sm text-[#8c9bab]">Annual Turnover</span>
            <div className="text-right">
              <span className="text-sm font-medium text-white block">
                {annualTurnover || "—"}
              </span>
              {annualTurnoverFy && (
                <span className="text-xs text-[#8c9bab] block mt-0.5">
                  ({annualTurnoverFy})
                </span>
              )}
            </div>
          </div>
          <DetailRow label="E-invoice" value={einvoiceText} />
          <DetailRow label="Aadhaar Validation" value={aadhaarText} />
          <DetailRow label="Field Visit Conducted" value={fieldVisitText} isLast />
        </div>
      </div>

      {/* ── Bottom: Brand-wise Transactions Card ────────────────────── */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2.5">
            <ChartColumn className="size-5 text-[#38bdf8]" />
            <h3 className="text-base md:text-lg font-semibold text-white">
              Brand-wise Transactions ({brandRows.length})
            </h3>
          </div>
          <div className="relative">
            <select
              value={fy}
              onChange={(e) => setFy(e.target.value)}
              aria-label="Financial year"
              className="bg-[#121824] border border-[#212b3c] hover:border-[#334155] text-white text-xs md:text-sm font-normal rounded-lg pl-3 pr-8 py-1.5 appearance-none cursor-pointer outline-none transition-colors"
            >
              {FY_OPTIONS.map((o) => (
                <option key={o} value={o} className="bg-[#121824] text-white">
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown className="size-4 text-[#8c9bab] pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2" />
          </div>
        </div>

        {/* Table */}
        {brandRows.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-[#18202f]">
                  <th className="w-14 py-3 px-3 text-xs md:text-sm font-normal text-[#8c9bab] text-left">
                    #
                  </th>
                  <th className="py-3 px-4 text-xs md:text-sm font-normal text-[#8c9bab] text-left">
                    Brand
                  </th>
                  <th className="py-3 px-4 text-xs md:text-sm font-normal text-[#8c9bab] text-left">
                    Taxable Amount (₹)
                  </th>
                  <th className="py-3 px-4 text-xs md:text-sm font-normal text-[#8c9bab] text-left">
                    GST Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {brandRows.map((b, i) => (
                  <tr
                    key={b.brand}
                    className="border-b border-[#18202f] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-3 text-sm font-normal text-slate-300 tabular-nums">
                      {i + 1}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-white tracking-wide">
                      {b.brand}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-bold text-[#38bdf8] tabular-nums">
                      {formatINR(b.taxableAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-bold text-[#facc15] tabular-nums">
                      {formatINR(b.gstAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#8c9bab] rounded-xl border border-dashed border-[#1e2638] p-8 text-center text-sm">
            No brand transactions found for this GSTIN.
          </p>
        )}
      </div>
    </div>
  )
}
