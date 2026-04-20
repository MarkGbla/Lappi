import Link from "next/link"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterBar } from "@/components/shared/filter-bar"
import { Pagination } from "@/components/shared/pagination"
import { RowActions } from "@/components/shared/row-actions"
import { deletePerson } from "@/actions/people"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Prisma } from "@/generated/prisma/client"

const roleOptions = [
  { value: "MEMBER", label: "Member" },
]

const PAGE_SIZE = 25

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const { role, q } = params
  const page = Math.max(1, Number(params.page) || 1)

  const where: Prisma.PersonWhereInput = { isActive: true }
  if (role) where.role = role as Prisma.PersonWhereInput["role"]
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
    ]
  }

  const [people, totalCount] = await Promise.all([
    prisma.person.findMany({
      where,
      orderBy: { lastName: "asc" },
      include: {
        _count: { select: { sessions: true } },
      },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.person.count({ where }),
  ])
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasFilter = !!(role || q)

  return (
    <div className="space-y-6">
      <PageHeader
        title="People"
        action={
          <Button size="sm" render={<Link href="/people/new" />}>
            <Plus size={16} className="mr-1" />
            Add Person
          </Button>
        }
      />

      <FilterBar
        fields={[
          { kind: "search", name: "q", placeholder: "Search by name..." },
          { kind: "select", name: "role", placeholder: "All roles", options: roleOptions },
        ]}
      />

      {people.length === 0 ? (
        hasFilter ? (
          <EmptyState title="No people match your filters" />
        ) : (
          <EmptyState
            title="No people registered"
            description="Add community members and staff."
            actionLabel="Add Person"
            actionHref="/people/new"
          />
        )
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {people.map((person) => (
              <div
                key={person.id}
                className="relative rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <Link href={`/people/${person.id}`} className="block pr-10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{person.firstName} {person.lastName}</span>
                    <Badge variant="outline" className="text-xs">{person.role}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {person.phone ?? person.email ?? "No contact"} &middot; {person._count.sessions} sessions
                  </div>
                </Link>
                <div className="absolute top-3 right-3">
                  <RowActions
                    id={person.id}
                    itemName={`${person.firstName} ${person.lastName}`}
                    editHref={`/people/${person.id}/edit`}
                    onDelete={deletePerson}
                    successMessage="Person deleted"
                    description="This removes the record permanently. If they have session or issue history, deactivate them instead."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <Link href={`/people/${person.id}`} className="font-medium hover:underline">
                        {person.firstName} {person.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{person.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {person.phone ?? person.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{person._count.sessions}</TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        id={person.id}
                        itemName={`${person.firstName} ${person.lastName}`}
                        editHref={`/people/${person.id}/edit`}
                        onDelete={deletePerson}
                        successMessage="Person deleted"
                        description="This removes the record permanently. If they have session or issue history, deactivate them instead."
                      />
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
