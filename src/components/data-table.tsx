import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  /** Pass to enable the search box. */
  searchPlaceholder?: string
  pageSize?: number
  pageSizeOptions?: number[]
  emptyMessage?: string
  /** Makes the whole row clickable (e.g. open a details page). */
  onRowClick?: (row: TData) => void

  /** Server-side pagination & searching (optional) */
  manualPagination?: boolean
  pageIndex?: number
  pageCount?: number
  totalRows?: number
  onPageChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  searchValue?: string
  onSearchChange?: (search: string) => void
}

/**
 * Reusable TanStack Table wrapper styled with DESIGN.md tokens:
 * sorting, global filter / server search, and client / server pagination included.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage = "No results found.",
  onRowClick,
  manualPagination = false,
  pageIndex = 0,
  pageCount,
  totalRows,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  const isManual =
    manualPagination ||
    onPageChange !== undefined ||
    onPageSizeChange !== undefined ||
    pageCount !== undefined

  const pagination = isManual
    ? { pageIndex, pageSize }
    : internalPagination

  const effectivePageCount = isManual
    ? pageCount ?? (totalRows ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1)
    : undefined

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: isManual ? "" : globalFilter,
      pagination,
    },
    manualPagination: isManual,
    pageCount: effectivePageCount,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater
      if (isManual) {
        if (next.pageIndex !== pagination.pageIndex) {
          onPageChange?.(next.pageIndex)
        }
        if (next.pageSize !== pagination.pageSize) {
          onPageSizeChange?.(next.pageSize)
        }
      } else {
        setInternalPagination(next)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isManual ? undefined : getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!searchKey) {
        return JSON.stringify(row.original)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase())
      }
      const value = row.getValue(searchKey)
      return String(value ?? "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    },
  })

  const currentSearch = isManual ? (searchValue ?? "") : globalFilter

  const totalCount = isManual
    ? (totalRows ?? data.length)
    : table.getFilteredRowModel().rows.length

  const displayPageCount = isManual
    ? Math.max(1, effectivePageCount || 1)
    : Math.max(1, table.getPageCount() || 1)

  return (
    <div className="flex flex-col gap-4">
      {searchPlaceholder && (
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => {
              if (manualPagination && onSearchChange) {
                onSearchChange(e.target.value)
              } else {
                setGlobalFilter(e.target.value)
              }
            }}
            className="pl-9"
          />
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getIsSorted() === "asc"
                          ? "Sorted ascending — click to sort descending"
                          : header.column.getIsSorted() === "desc"
                            ? "Sorted descending — click to clear"
                            : "Click to sort"
                      }
                      className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="text-foreground size-3" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="text-foreground size-3" />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <p>
            Page {pagination.pageIndex + 1} of {displayPageCount} · {totalCount}{" "}
            row(s)
          </p>
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                const nextSize = Number(e.target.value)
                if (isManual) {
                  onPageSizeChange?.(nextSize)
                } else {
                  table.setPageSize(nextSize)
                }
              }}
              className="bg-card text-foreground border-outline-variant rounded border px-1.5 py-0.5 text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (isManual) {
                onPageChange?.(Math.max(0, pagination.pageIndex - 1))
              } else {
                table.previousPage()
              }
            }}
            disabled={pagination.pageIndex <= 0}
          >
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (isManual) {
                onPageChange?.(pagination.pageIndex + 1)
              } else {
                table.nextPage()
              }
            }}
            disabled={pagination.pageIndex + 1 >= displayPageCount}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

