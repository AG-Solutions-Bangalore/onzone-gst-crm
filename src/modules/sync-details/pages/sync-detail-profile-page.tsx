import * as React from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  Copy,
  FileUser,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Store,
  ChartColumn,
} from "lucide-react";

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  formatINR,
  groupPartyRowsByBrand,
} from "@/modules/vendor/components/vendor-columns.tsx";
import { ExportVendorDetailsButton } from "@/modules/vendor/components/export-vendor-details-button.tsx";
import {
  CallActionButtons,
  getContactLinks,
} from "@/modules/vendor/components/contact-actions.tsx";
import {
  useVendorGstDetails,
  useVendorGstSyncDetailsById,
  useVendorPartyRows,
} from "@/modules/vendor/hooks/use-vendors.ts";
import type { VendorGstSyncDetails } from "@/modules/vendor/types/vendor.types.ts";
import { cn } from "@/lib/utils.ts";

/** "20-10-2017" / ISO → "20 Oct 2017". Falls back to the raw value. */
function formatRegDate(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  let d: Date | null = null;
  if (dmy) {
    d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  } else {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d || isNaN(d.getTime())) return trimmed;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatJurisdiction(state?: string | null) {
  let stateLine: string | null = null;

  if (state) {
    const trimmed = state.trim();
    stateLine = /^state\s*[-:]/i.test(trimmed) ? trimmed : `State - ${trimmed}`;
  }

  return { stateLine };
}

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3.5 border-b border-border/60",
        isLast && "border-b-0 pb-1",
      )}
    >
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="text-foreground text-right text-sm font-medium break-words">
        {value ?? "—"}
      </span>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
  isLast = false,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 border-b border-border/60",
        isLast && "border-b-0 pb-1",
      )}
    >
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <span className="text-muted-foreground text-xs">{label}</span>
        <div className="text-foreground text-sm mt-0.5 leading-snug break-words">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ active, text }: { active: boolean; text: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold border",
        active
          ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-destructive",
        )}
      />
      {text}
    </span>
  );
}

/** `/vendor-gst-details/:gstin` — full GST profile for one vendor. Theme-aware (light + dark). */
export function SyncDetailProfilePage() {
  const { gstin } = useParams();
  const { vendor, isLoading: isSyncLoading } = useVendorGstDetails(gstin);

  // Party/brand rows: prefer the by-id endpoint (`{data, gstdetails}`),
  // fall back to the cached party list filtered by GSTIN.
  const byIdQuery = useVendorGstSyncDetailsById(vendor?.id);
  const partyRowsQuery = useVendorPartyRows(gstin);
  const partyRows =
    (byIdQuery.data?.gstdetails?.length ?? 0) > 0
      ? (byIdQuery.data?.gstdetails ?? [])
      : (partyRowsQuery.rows ?? []);
  const [copied, setCopied] = React.useState(false);

  // If vendor was imported in details list but not yet synced from GST Portal,
  // create fallback profile so details are immediately accessible without error.
  const fallbackVendor = React.useMemo<VendorGstSyncDetails | null>(() => {
    if (vendor) return vendor;
    if (partyRows.length === 0 || !gstin) return null;
    const first = partyRows[0];
    const cleanGstin = gstin.trim().toUpperCase();
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
    };
  }, [vendor, partyRows, gstin]);

  const effectiveVendor = vendor || fallbackVendor;
  const isSyncedFromPortal = !!vendor;
  const isLoading = isSyncLoading || partyRowsQuery.isLoading;

  const brandRows = React.useMemo(
    () => groupPartyRowsByBrand(partyRows),
    [partyRows],
  );

  const totalTaxable = React.useMemo(
    () => brandRows.reduce((sum, b) => sum + b.taxableAmount, 0),
    [brandRows],
  );

  async function copyGstin() {
    if (!effectiveVendor) return;
    try {
      await navigator.clipboard.writeText(effectiveVendor.vendor_gst);
      setCopied(true);
      toast.success("GSTIN copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy GSTIN.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (!effectiveVendor) {
    return (
      <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-base font-semibold">Vendor not found</p>
        <p className="text-muted-foreground text-sm">
          No profile found for GSTIN <span className="font-mono">{gstin}</span>.
        </p>
        <Button variant="secondary" size="sm" asChild className="mt-2">
          <Link to="/vendor-gst-details">
            <ArrowLeft className="size-4" /> Back to Vendor GST Details
          </Link>
        </Button>
      </div>
    );
  }

  const title =
    effectiveVendor.business_name || effectiveVendor.legal_name || "—";
  const regDate = formatRegDate(effectiveVendor.date_of_registration);
  const natureTitle = effectiveVendor.nature_of_business || "Retail Business";
  const natureSub =
    effectiveVendor.nature_bus_activities ||
    effectiveVendor.nature_of_core_business_activity_description ||
    "Trader, Retailer";

  const rawStatus = (effectiveVendor.gstin_status || "Active").trim();
  const isActive = rawStatus.toLowerCase() === "active";
  const statusText = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  const taxpayerType = effectiveVendor.taxpayer_type?.trim() || "Regular";
  const constitution =
    effectiveVendor.constitution_of_business?.trim() || "Proprietorship";

  const { stateLine } = formatJurisdiction(effectiveVendor.state_jurisdiction);

  const annualTurnover = effectiveVendor.annual_turnover || null;
  const annualTurnoverFy = effectiveVendor.annual_turnover_fy
    ? effectiveVendor.annual_turnover_fy.replace(/[()]/g, "").trim()
    : null;

  const einvoiceText =
    effectiveVendor.einvoice_status === null ||
    effectiveVendor.einvoice_status === undefined
      ? "Not enabled"
      : effectiveVendor.einvoice_status === true ||
          String(effectiveVendor.einvoice_status).toLowerCase() === "enabled"
        ? "Enabled"
        : "Not enabled";

  const aadhaarText =
    effectiveVendor.aadhaar_validation === null ||
    effectiveVendor.aadhaar_validation === undefined ||
    effectiveVendor.aadhaar_validation === ""
      ? "No"
      : String(effectiveVendor.aadhaar_validation).toLowerCase() === "yes" ||
          String(effectiveVendor.aadhaar_validation).toLowerCase() === "true"
        ? "Yes"
        : String(effectiveVendor.aadhaar_validation);

  const fieldVisitText =
    effectiveVendor.field_visit_conducted === null ||
    effectiveVendor.field_visit_conducted === undefined ||
    effectiveVendor.field_visit_conducted === ""
      ? "No"
      : String(effectiveVendor.field_visit_conducted).toLowerCase() === "yes" ||
          String(effectiveVendor.field_visit_conducted).toLowerCase() === "true"
        ? "Yes"
        : String(effectiveVendor.field_visit_conducted);

  const mobileLinks = getContactLinks(effectiveVendor.mobile);

  return (
    <div className="flex flex-col gap-4">
      {/* Top action navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/vendor-gst-details">
            <ArrowLeft className="size-4" /> Vendor GST Details
          </Link>
        </Button>
        <ExportVendorDetailsButton
          vendor={effectiveVendor}
          partyRows={partyRows}
        />
      </div>

      {/* Info banner for un-synced vendors */}
      {!isSyncedFromPortal && (
        <div className="border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-start gap-3 rounded-xl border p-4 text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">
              GST Portal Verification Pending
            </span>
            <span>
              This vendor was imported via party/brand line items, but full
              taxpayer registration details have not yet been synchronized from
              the government GST portal. Run GST Sync from Excel Detail to fetch
              the official profile.
            </span>
          </div>
        </div>
      )}

      {/* ── Top Header Card ────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-7 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Avatar + Title + GSTIN + Badges */}
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-full bg-info/10 border border-info/20 flex items-center justify-center shrink-0">
              <Store className="size-7 text-info" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-2xl md:text-[26px] font-bold tracking-tight leading-tight">
                {title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-muted-foreground">
                  GSTIN: {effectiveVendor.vendor_gst}
                </span>
                <button
                  type="button"
                  onClick={copyGstin}
                  title="Copy GSTIN"
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <StatusPill active={isActive} text={statusText} />
                {taxpayerType && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3.5 py-0.5 text-xs font-medium"
                  >
                    {taxpayerType}
                  </Badge>
                )}
                {constitution && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3.5 py-0.5 text-xs font-medium"
                  >
                    {constitution}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Registered on + Nature of business */}
          <div className="flex flex-wrap items-center gap-8 lg:gap-12 shrink-0">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-6 text-muted-foreground shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Registered on
                </span>
                <span className="text-sm font-bold whitespace-nowrap">
                  {regDate || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="size-6 text-muted-foreground shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-bold whitespace-nowrap">
                  {natureTitle}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {natureSub}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle: 3 Info Cards (fixed height on desktop, extra content scrolls inside) ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
        {/* Card 1: Business Details */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:h-[420px] md:overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2 shrink-0">
            <FileUser className="size-5 text-info" />
            <h3 className="text-base font-semibold">Business Details</h3>
          </div>
          <div className="syn-scroll min-h-0 flex-1 md:overflow-y-auto md:pr-1">
            <DetailRow label="Legal Name" value={effectiveVendor.legal_name} />
            <DetailRow label="PAN Number" value={effectiveVendor.pan_number} />
            <div className="flex items-start justify-between py-3.5 border-b border-border/60">
              <span className="text-sm text-muted-foreground">
                Annual Turnover
              </span>
              <div className="text-right">
                <span className="text-sm font-medium block">
                  {annualTurnover || "—"}
                </span>
                {annualTurnoverFy && (
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    ({annualTurnoverFy})
                  </span>
                )}
              </div>
            </div>
            <DetailRow label="E-invoice" value={einvoiceText} />
            <DetailRow label="Aadhaar Validation" value={aadhaarText} />
            <DetailRow
              label="Field Visit Conducted"
              value={fieldVisitText}
              isLast
            />
          </div>
        </div>

        {/* Card 2: Contact & Location */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:h-[420px] md:overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2 shrink-0">
            <MapPin className="size-5 text-indigo-400" />
            <h3 className="text-base font-semibold">Contact & Location</h3>
          </div>
          <div className="syn-scroll min-h-0 flex-1 md:overflow-y-auto md:pr-1">
            <ContactRow icon={MapPin} label="Address">
              {effectiveVendor.address || "—"}
            </ContactRow>
            <ContactRow icon={Mail} label="Email">
              {effectiveVendor.email || "—"}
            </ContactRow>
            <ContactRow icon={Phone} label="Mobile">
              {mobileLinks.digits ? (
                <div className="flex flex-col gap-2">
                  <span className="font-medium tabular-nums">
                    {mobileLinks.raw}
                  </span>
                  <CallActionButtons mobile={mobileLinks.raw} />
                </div>
              ) : (
                "—"
              )}
            </ContactRow>
            <ContactRow icon={Landmark} label="Jurisdiction" isLast>
              {stateLine && <div>{stateLine}</div>}
              {!stateLine && <div>—</div>}
            </ContactRow>
          </div>
        </div>

        {/* Card 3: Brand-wise Transactions */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:h-[420px] md:overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2 shrink-0">
            <ChartColumn className="size-5 text-info" />
            <h3 className="text-base font-semibold">
              Brand-wise Transactions ({brandRows.length})
            </h3>
          </div>
          <div className="syn-scroll min-h-0 flex-1 overflow-y-auto max-h-[320px] md:max-h-none md:pr-1">
            {brandRows.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="z-10">
                  <tr className="border-b border-border/60">
                    <th className="sticky top-0 bg-card z-10 py-3 px-2 text-sm font-normal text-muted-foreground text-left">
                      Brand
                    </th>
                    <th className="sticky top-0 bg-card z-10 py-3 px-2 text-sm font-normal text-muted-foreground text-right">
                      Taxable Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brandRows.map((b) => (
                    <tr
                      key={b.brand}
                      className="border-b border-border/60 last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-2 text-sm font-medium tracking-wide">
                        {b.brand}
                      </td>
                      <td className="py-3 px-2 text-sm font-bold text-info tabular-nums text-right">
                        {formatINR(b.taxableAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="z-10">
                  <tr className="border-t-2 border-border shadow-[0_-1px_0_0_hsl(var(--border))]">
                    <td className="sticky bottom-0 bg-card z-10 py-3.5 px-2 text-sm font-bold">Total</td>
                    <td className="sticky bottom-0 bg-card z-10 py-3.5 px-2 text-sm font-bold text-info tabular-nums text-right">
                      {formatINR(totalTaxable)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-muted-foreground rounded-xl border border-dashed border-border p-8 text-center text-sm">
                No brand transactions found for this GSTIN.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
