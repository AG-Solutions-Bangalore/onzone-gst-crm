import { useQuery } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2, RefreshCw, Triangle } from "lucide-react"
import toast from "react-hot-toast"

import { DataTable } from "@/components/data-table.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { clientColumns, fetchClients } from "@/data/clients.tsx"

/** Landing route (`/`) — hero, design primitives, live client table. */
export function DashboardPage() {
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  return (
    <>
      {/* hero — asymmetric per DESIGN.md */}
      <section className="grid grid-cols-12 items-center gap-6 py-16">
        <div className="col-span-12 lg:col-span-7">
          <Badge>Ship 26 · GST filing is live</Badge>
          <h1 className="mt-4 text-[40px] leading-[48px] font-normal tracking-[-0.01em] text-balance sm:text-[64px] sm:leading-[72px] sm:tracking-[-0.02em]">
            Deploy billing. Scale compliance.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-7">
            Deploy your GST workspace in milliseconds; scale from zero to
            millions of invoices without thinking about servers.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => toast.success("Invoice created successfully.")}
            >
              Create invoice <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => toast("Client import queued.")}
            >
              Import clients
            </Button>
          </div>
        </div>
        <div className="col-span-12 flex justify-start lg:col-span-5 lg:justify-center">
          <div className="bg-card border-outline-variant flex items-center gap-4 rounded-xl border p-6 shadow-sm">
            <Triangle className="fill-primary text-primary size-16" />
            <div>
              <p className="text-[20px] leading-7 font-medium">99.99% uptime</p>
              <p className="text-muted-foreground text-sm">
                Autonomous infrastructure for every return.
              </p>
              <Badge variant="accent" className="mt-2">
                GSTR-1 · GSTR-3B ready
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* primitives */}
      <section className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Primary, secondary and tertiary actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Primary action shipped.")}>
              Primary
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast("Secondary action noted.")}
            >
              Secondary
            </Button>
            <Button
              variant="tertiary"
              onClick={() => toast("Tertiary action noted.")}
            >
              Tertiary
            </Button>
            <Button
              variant="success"
              onClick={() => toast.success("Payment reconciled.")}
            >
              Success
            </Button>
            <Button
              variant="accent"
              onClick={() => toast("Campaign highlighted.", { icon: "✦" })}
            >
              Highlight
            </Button>
            <Button
              variant="destructive"
              onClick={() => toast.error("Invoice voided.")}
            >
              Delete
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-xs">
              150ms ease · full radius on primary.
            </p>
          </CardFooter>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Inputs & badges</CardTitle>
            <CardDescription>
              GSTIN search with focus-ring treatment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Search by GSTIN or client…" />
            <div className="flex flex-wrap gap-2">
              <Badge>Filed</Badge>
              <Badge variant="accent">Attention</Badge>
              <Badge variant="outline">Draft</Badge>
              <Badge variant="success">
                <CheckCircle2 className="size-3" /> Paid
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => toast("Opening validation rules…")}
            >
              View validation rules →
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>React Query</CardTitle>
            <CardDescription>
              Cached, retry-safe server state for clients.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                Status:{" "}
                <span className="font-medium">
                  {clientsQuery.isLoading
                    ? "loading…"
                    : clientsQuery.isError
                      ? "error"
                      : `${clientsQuery.data?.length ?? 0} clients`}
                </span>
              </p>
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
            </div>
            {clientsQuery.isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
                <Skeleton className="h-8 w-4/6" />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Data stays fresh for 30s, cached for 5m. Toggle theme or
                refetch — no duplicate requests.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* data table */}
      <section className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Clients</CardTitle>
                <CardDescription>
                  Sortable, filterable, paginated React Table.
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success("Client added to workspace.")}
              >
                Add client
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {clientsQuery.isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
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
    </>
  )
}
