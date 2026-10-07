import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, RefreshCw } from "lucide-react";

import { DataTable } from "@/components/data-table.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts";
import { SEARCH_DEBOUNCE_MS } from "@/lib/pagination.ts";
import {
  gstDetailsTableColumns,
  vendorTableColumns,
} from "@/modules/vendor/components/vendor-columns.tsx";
import {
  ExportGstDetailsListButton,
  ExportVendorsButton,
} from "@/modules/vendor/components/export-vendors-button.tsx";
import { VendorGstTemplateButton } from "@/modules/vendor/components/vendor-gst-template-button.tsx";
import { UploadVendorGstButton } from "@/modules/vendor/components/upload-vendor-gst-button.tsx";
import { UpdateVendorGstDetailsButton } from "@/modules/vendor/components/update-vendor-gst-details-button.tsx";
import {
  useVendorPartyView,
  useVendorProfilesView,
} from "@/modules/vendor/hooks/use-vendors.ts";

type StatusFilter = "all" | "active" | "attention";
type TypeFilter = "all" | "Regular" | "Composition";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "attention", label: "Needs attention" },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Regular", label: "Regular" },
  { value: "Composition", label: "Composition" },
];

export const VENDORS_TAB_STORAGE_KEY = "onzone.vendors.activeTab";

/** `/vendors` — registry with server-driven search + pagination. */
export function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active tab persists across navigation, browser back/forward, and session storage.
  const tabParam = searchParams.get("tab") || searchParams.get("view");
  const storedTab = React.useMemo(() => {
    try {
      return sessionStorage.getItem(VENDORS_TAB_STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  const viewMode: "synced" | "details" =
    tabParam === "details" || (!tabParam && storedTab === "details")
      ? "details"
      : "synced";

  // Persist whatever resolved (URL param, legacy param, or stored value) so
  // a direct/bookmarked link like `/vendors?view=details` also survives a
  // detail-page round-trip that drops the query string.
  React.useEffect(() => {
    try {
      sessionStorage.setItem(VENDORS_TAB_STORAGE_KEY, viewMode);
    } catch {
      // storage unavailable — URL param alone still works
    }
  }, [viewMode]);

  function handleTabChange(next: string) {
    const mode = next === "details" ? "details" : "synced";
    try {
      sessionStorage.setItem(VENDORS_TAB_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (mode === "details") {
          params.set("tab", "details");
        } else {
          params.delete("tab");
        }
        params.delete("view"); // clean legacy
        return params;
      },
      { replace: true },
    );
    setSyncedPage(0);
    setPartyPage(0);
  }

  const statusParam = searchParams.get("status");
  const status: StatusFilter =
    statusParam === "active" || statusParam === "attention"
      ? statusParam
      : "all";

  const typeParam = searchParams.get("type");
  const type: TypeFilter =
    typeParam === "Regular" || typeParam === "Composition" ? typeParam : "all";

  function updateParams(next: { status: StatusFilter; type: TypeFilter }) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next.status !== "all") params.set("status", next.status);
        else params.delete("status");
        if (next.type !== "all") params.set("type", next.type);
        else params.delete("type");
        return params;
      },
      { replace: true },
    );
    setSyncedPage(0)
  }

  // --- Synced profiles tab state (search is debounced like a server query)
  const [syncedSearch, setSyncedSearch] = React.useState("")
  const [syncedPage, setSyncedPage] = React.useState(0)
  const [syncedPageSize, setSyncedPageSize] = React.useState(10)
  const debouncedSyncedSearch = useDebouncedValue(
    syncedSearch,
    SEARCH_DEBOUNCE_MS,
  )
  const profilesView = useVendorProfilesView({
    search: debouncedSyncedSearch,
    status,
    type,
    page: syncedPage + 1,
    perPage: syncedPageSize,
  })

  // --- Line-items tab state
  const [partySearch, setPartySearch] = React.useState("")
  const [partyPage, setPartyPage] = React.useState(0)
  const [partyPageSize, setPartyPageSize] = React.useState(10)
  const debouncedPartySearch = useDebouncedValue(
    partySearch,
    SEARCH_DEBOUNCE_MS,
  )
  const partyView = useVendorPartyView({
    search: debouncedPartySearch,
    page: partyPage + 1,
    perPage: partyPageSize,
  })

  function handleSyncedSearch(val: string) {
    setSyncedSearch(val)
    setSyncedPage(0)
  }

  function handleSyncedPageSize(size: number) {
    setSyncedPageSize(size)
    setSyncedPage(0)
  }

  function handlePartySearch(val: string) {
    setPartySearch(val)
    setPartyPage(0)
  }

  function handlePartyPageSize(size: number) {
    setPartyPageSize(size)
    setPartyPage(0)
  }

  /** Detail URL keeps the active tab so "back" restores it. */
  function vendorHref(gstin: string) {
    return `/vendors/${gstin}${viewMode === "details" ? "?tab=details" : ""}`;
  }

  const isLoading =
    viewMode === "synced" ? profilesView.isLoading : partyView.isLoading;
  const isError =
    viewMode === "synced" ? profilesView.isError : partyView.isError;
  const isFetching = profilesView.isFetching || partyView.isFetching;
  const isFiltered =
    status !== "all" || type !== "all" || debouncedSyncedSearch.trim() !== "";

  function handleRefresh() {
    const id = toast.loading("Refreshing vendor data…");
    void Promise.all([profilesView.refetch(), partyView.refetch()]).then(
      (results) => {
        if (
          results.some((r) =>
            Array.isArray(r) ? r.some((s) => s.isError) : r.isError,
          )
        ) {
          toast.error("Refresh failed. Try again.", { id });
        } else {
          toast.success("Vendor data up to date.", { id });
        }
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-9 font-normal tracking-tight">
            Vendors
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewMode === "synced" ? (
            <>
              <VendorGstTemplateButton target="gstin" />
              <UploadVendorGstButton target="gstin" />
              <UpdateVendorGstDetailsButton />
              <ExportVendorsButton
                rows={profilesView.all}
                disabled={isLoading || isError}
              />
            </>
          ) : (
            <>
              <VendorGstTemplateButton target="details" />
              <UploadVendorGstButton target="details" />
              <ExportGstDetailsListButton
                items={partyView.all}
                disabled={partyView.isLoading || partyView.isError}
              />
            </>
          )}
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

      <Tabs
        value={viewMode}
        onValueChange={(v) => handleTabChange(v as "synced" | "details")}
        className="flex flex-col gap-4"
      >
        {/* shadcn Tabs — unified segmented pill group with active motion badge */}
        <div className="flex items-center">
          <TabsList aria-label="Vendor views">
            <TabsTrigger value="synced">
              <span>Synced Vendors</span>
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors duration-200",
                  viewMode === "synced"
                    ? "bg-foreground text-background"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {profilesView.total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="details">
              <span>GST Brand / Line Items</span>
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors duration-200",
                  viewMode === "details"
                    ? "bg-foreground text-background"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {partyView.total}
              </span>
            </TabsTrigger>
          </TabsList>
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
              <p className="text-sm">Failed to load vendor records.</p>
              <Button variant="secondary" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          ) : (
            <>
            <TabsContent value="synced" forceMount>
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
                        {profilesView.counts[f.value]}
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
                </div>
              </div>
              <div
                className={cn(
                  "transition-opacity duration-150",
                  isFetching && "pointer-events-none opacity-60",
                )}
              >
                <DataTable
                  columns={vendorTableColumns}
                  data={profilesView.rows}
                  searchPlaceholder="Search GSTIN, business…"
                  pageSize={syncedPageSize}
                  emptyMessage={
                    isFiltered
                      ? "No vendors match this search / filters."
                      : "No vendors found."
                  }
                  onRowClick={(row) => navigate(vendorHref(row.vendor_gst))}
                  manualPagination
                  pageIndex={profilesView.page - 1}
                  pageCount={profilesView.pageCount}
                  totalRows={profilesView.total}
                  onPageChange={setSyncedPage}
                  onPageSizeChange={handleSyncedPageSize}
                  searchValue={syncedSearch}
                  onSearchChange={handleSyncedSearch}
                />
              </div>
            </TabsContent>
            <TabsContent value="details" forceMount>
            <div
              className={cn(
                "transition-opacity duration-150",
                isFetching && "pointer-events-none opacity-60",
              )}
            >
              <DataTable
                columns={gstDetailsTableColumns}
                data={partyView.rows}
                searchPlaceholder="Search GSTIN, party name, brand, town…"
                pageSize={partyPageSize}
                emptyMessage="No GST line items found. Upload vendor_gst_details.xlsx to import."
                onRowClick={(row) => navigate(vendorHref(row.vendor_gst))}
                manualPagination
                pageIndex={partyView.page - 1}
                pageCount={partyView.pageCount}
                totalRows={partyView.total}
                onPageChange={setPartyPage}
                onPageSizeChange={handlePartyPageSize}
                searchValue={partySearch}
                onSearchChange={handlePartySearch}
              />
            </div>
            </TabsContent>
            </>
          )}
        </CardContent>
      </Card>
      </Tabs>
    </div>
  );
}
