import Link from "next/link"
import { Plus, QrCode } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import { Pagination } from "@/components/shared/pagination"
import { RowActions } from "@/components/shared/row-actions"
import { deleteAsset } from "@/actions/assets"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Prisma } from "@/generated/prisma/client"
import { decodeOtherType } from "@/lib/other-type"

const typeOptions = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "TABLET", label: "Tablet" },
  { value: "PROJECTOR", label: "Projector" },
  { value: "ROUTER", label: "Router" },
  { value: "PHONE", label: "Phone" },
  { value: "CAMERA", label: "Camera" },
  { value: "PRINTER", label: "Printer" },
  { value: "NETWORKING", label: "Networking" },
  { value: "OTHER", label: "Other" },
]

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "CHECKED_OUT", label: "Checked Out" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "NEEDS_ATTENTION", label: "Needs Attention" },
  { value: "RETIRED", label: "Retired" },
]

const conditionOptions = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
]

const PAGE_SIZE = 25

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string
    status?: string
    condition?: string
    q?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const { type, status, condition, q } = params
  const page = Math.max(1, Number(params.page) || 1)

  const where: Prisma.AssetWhereInput = {}
  if (type) where.type = type as Prisma.AssetWhereInput["type"]
  if (status) where.status = status as Prisma.AssetWhereInput["status"]
  if (condition) where.condition = condition as Prisma.AssetWhereInput["condition"]
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { serialNumber: { contains: q, mode: "insensitive" } },
    ]
  }

  const [assets, totalCount] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.asset.count({ where }),
  ])
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const hasFilter = !!(type || status || condition || q)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" render={<Link href="/assets/qr-sheet" />}>
              <QrCode size={16} className="mr-1" />
              Labels
            </Button>
            <Button size="sm" render={<Link href="/assets/new" />}>
              <Plus size={16} className="mr-1" />
              Add Asset
            </Button>
          </div>
        }
      />

      <FilterBar
        fields={[
          { kind: "search", name: "q", placeholder: "Search name or serial..." },
          { kind: "select", name: "type", placeholder: "All types", options: typeOptions },
          { kind: "select", name: "status", placeholder: "All statuses", options: statusOptions },
          { kind: "select", name: "condition", placeholder: "All conditions", options: conditionOptions },
        ]}
      />

      {assets.length === 0 ? (
        hasFilter ? (
          <EmptyState
            title="No assets match your filters"
            description="Try clearing filters or searching for something else."
          />
        ) : (
          <EmptyState
            title="No assets registered"
            description="Start by registering your first device."
            actionLabel="Add Asset"
            actionHref="/assets/new"
          />
        )
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="relative rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <Link href={`/assets/${asset.id}`} className="block pr-10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{asset.name}</span>
                    <StatusBadge value={asset.status} variant="status" />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {asset.type === "OTHER"
                        ? (decodeOtherType(asset.notes).label ?? "Other")
                        : asset.type.replace(/_/g, " ")}
                    </span>
                    {asset.location && (
                      <>
                        <span>&middot;</span>
                        <span>{asset.location}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1">
                    <StatusBadge value={asset.condition} variant="condition" />
                  </div>
                </Link>
                <div className="absolute top-3 right-3">
                  <RowActions
                    id={asset.id}
                    itemName={asset.name}
                    editHref={`/assets/${asset.id}/edit`}
                    onDelete={deleteAsset}
                    successMessage="Asset deleted"
                    description="This removes the asset permanently. If it has session or issue history, retire it instead."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="relative hover:bg-accent cursor-pointer"
                  >
                    <TableCell>
                      {/* Pseudo-element stretches the link to cover the whole
                          row so clicking any cell navigates. RowActions sits
                          in a relative/z-10 wrapper so its menu still works. */}
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium hover:underline before:absolute before:inset-0"
                      >
                        {asset.name}
                      </Link>
                      {asset.serialNumber && (
                        <div className="text-xs text-muted-foreground">{asset.serialNumber}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {asset.type === "OTHER"
                        ? (decodeOtherType(asset.notes).label ?? "Other")
                        : asset.type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={asset.status} variant="status" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={asset.condition} variant="condition" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{asset.location ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="relative z-10">
                        <RowActions
                          id={asset.id}
                          itemName={asset.name}
                          editHref={`/assets/${asset.id}/edit`}
                          onDelete={deleteAsset}
                          successMessage="Asset deleted"
                          description="This removes the asset permanently. If it has session or issue history, retire it instead."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  )
}
