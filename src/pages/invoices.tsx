import type { ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"

import { DataTable } from "@/components/data-table.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"

type Invoice = {
  id: string
  client: string
  amount: string
  status: "Paid" | "Pending" | "Overdue"
  date: string
}

const INVOICES: Invoice[] = [
  { id: "INV-1041", client: "Acme Traders", amount: "₹48,200", status: "Paid", date: "12 Sep 2026" },
  { id: "INV-1042", client: "Delta Foods", amount: "₹52,900", status: "Overdue", date: "08 Sep 2026" },
  { id: "INV-1043", client: "Bright Fabrics", amount: "₹18,400", status: "Pending", date: "15 Sep 2026" },
  { id: "INV-1044", client: "Crest Logistics", amount: "₹96,000", status: "Paid", date: "02 Sep 2026" },
  { id: "INV-1045", client: "Harbor Pharma", amount: "₹27,300", status: "Overdue", date: "28 Aug 2026" },
  { id: "INV-1046", client: "Everest Steel", amount: "₹64,750", status: "Pending", date: "18 Sep 2026" },
  { id: "INV-1047", client: "Galaxy Motors", amount: "₹1,20,000", status: "Paid", date: "20 Sep 2026" },
]

const statusVariant: Record<Invoice["status"], "success" | "default" | "destructive"> = {
  Paid: "success",
  Pending: "default",
  Overdue: "destructive",
}

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: "id", header: "Invoice", enableSorting: true },
  { accessorKey: "client", header: "Client", enableSorting: true },
  { accessorKey: "amount", header: "Amount", enableSorting: true },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "date", header: "Date", enableSorting: true },
]

/** `/invoices` — invoice ledger with status badges. */
export function InvoicesPage() {
  return (
    <section className="pt-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                {INVOICES.length} invoices this month
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => toast.success("Invoice created successfully.")}
            >
              New invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={INVOICES}
            searchKey="client"
            searchPlaceholder="Search invoices…"
          />
        </CardContent>
      </Card>
    </section>
  )
}
