import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { PersonForm } from "@/components/people/person-form"

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const person = await prisma.person.findUnique({ where: { id } })
  if (!person) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Person"
        breadcrumbs={[
          { label: "People", href: "/people" },
          { label: `${person.firstName} ${person.lastName}`, href: `/people/${person.id}` },
          { label: "Edit" },
        ]}
      />
      <PersonForm person={person} />
    </div>
  )
}
