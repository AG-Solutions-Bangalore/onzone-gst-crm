import { useQuery } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

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
import { clientColumns, fetchClients } from "@/data/clients.tsx"

/** `/clients` — full client registry with search, sort, pagination. */
export function ClientsPage() {
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  return (
    <section className="pt-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                {clientsQuery.data
                  ? `${clientsQuery.data.length} registered clients`
                  : "Loading registry…"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void clientsQuery.refetch()
                  toast("Refreshing client list…")
                }}
              >
                <RefreshCw className="size-3" /> Refetch
              </Button>
              <Button
                size="sm"
                onClick={() => toast.success("Client added to workspace.")}
              >
                Add client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clientsQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : clientsQuery.isError ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-sm">Failed to load clients.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void clientsQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <DataTable
              columns={clientColumns}
              data={clientsQuery.data ?? []}
              searchKey="name"
              searchPlaceholder="Search clients…"
            />
          )}
        </CardContent>
      </Card>
    </section>
  )
}
