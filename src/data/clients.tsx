import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge.tsx"

/** Shared demo dataset for the Dashboard + Clients pages. */

export type Client = {
  id: string
  name: string
  gstin: string
  status: "Active" | "Pending" | "Overdue"
  invoices: number
  due: string
}

export const CLIENTS: Client[] = [
  { id: "1", name: "Acme Traders", gstin: "27ABCDE1234F1Z5", status: "Active", invoices: 24, due: "₹0" },
  { id: "2", name: "Bright Fabrics", gstin: "24ABCDE5678G2Z3", status: "Pending", invoices: 11, due: "₹18,400" },
  { id: "3", name: "Crest Logistics", gstin: "29ABCDE9012H3Z1", status: "Active", invoices: 32, due: "₹0" },
  { id: "4", name: "Delta Foods", gstin: "06ABCDE3456J4Z9", status: "Overdue", invoices: 7, due: "₹52,900" },
  { id: "5", name: "Everest Steel", gstin: "19ABCDE7890K5Z7", status: "Active", invoices: 19, due: "₹4,200" },
  { id: "6", name: "Fusion Retail", gstin: "33ABCDE2345L6Z2", status: "Pending", invoices: 5, due: "₹9,750" },
  { id: "7", name: "Galaxy Motors", gstin: "08ABCDE6789M7Z4", status: "Active", invoices: 41, due: "₹0" },
  { id: "8", name: "Harbor Pharma", gstin: "36ABCDE0123N8Z6", status: "Overdue", invoices: 9, due: "₹27,300" },
  { id: "9", name: "Indus Textiles", gstin: "24ABCDE4567P9Z8", status: "Active", invoices: 15, due: "₹0" },
  { id: "10", name: "Jade Ceramics", gstin: "18ABCDE8901Q1Z5", status: "Pending", invoices: 6, due: "₹12,600" },
]

/** Simulated fetcher — swap with a real API call later. */
export function fetchClients(): Promise<Client[]> {
  return new Promise((resolve) => setTimeout(() => resolve(CLIENTS), 600))
}

export const clientStatusVariant: Record<
  Client["status"],
  "success" | "default" | "destructive"
> = {
  Active: "success",
  Pending: "default",
  Overdue: "destructive",
}

export const clientColumns: ColumnDef<Client>[] = [
  { accessorKey: "name", header: "Client", enableSorting: true },
  { accessorKey: "gstin", header: "GSTIN", enableSorting: false },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={clientStatusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "invoices", header: "Invoices", enableSorting: true },
  { accessorKey: "due", header: "Due", enableSorting: true },
]
