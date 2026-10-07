/**
 * Vendor API barrel — one import point for the whole module.
 * Domain clients live in `vendor-registry.api.ts`, `vendor-sync.api.ts`
 * and `vendor-party.api.ts`; this file only re-exports them so existing
 * imports keep working.
 */

export {
  fetchVendorGstList,
  fetchVendorGstTags,
  uploadVendorGstFile,
  VENDOR_GST_TEMPLATE_URL,
} from "@/modules/vendor/api/vendor-registry.api.ts"
export {
  fetchVendorGstSyncDetailsById,
  fetchVendorGstSyncDetailsList,
  updateVendorGstDetails,
} from "@/modules/vendor/api/vendor-sync.api.ts"
export {
  deleteVendorGstDetails,
  fetchVendorGstDetailsList,
  uploadVendorGstDetailsFile,
  VENDOR_GST_DETAILS_TEMPLATE_URL,
} from "@/modules/vendor/api/vendor-party.api.ts"
