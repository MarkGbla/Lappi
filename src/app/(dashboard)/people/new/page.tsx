import { PageHeader } from "@/components/layout/page-header"
import { PersonForm } from "@/components/people/person-form"

export default function NewPersonPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Person"
        breadcrumbs={[
          { label: "People", href: "/people" },
          { label: "New" },
        ]}
      />
      <PersonForm />
    </div>
  )
}
