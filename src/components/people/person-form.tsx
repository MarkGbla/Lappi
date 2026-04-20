"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createPersonSchema, type CreatePersonInput } from "@/lib/validations/person"
import { createPerson, updatePerson } from "@/actions/people"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PersonFormProps = {
  person?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    role: string
  }
}

export function PersonForm({ person }: PersonFormProps) {
  const router = useRouter()
  const isEditing = !!person

  const form = useForm<CreatePersonInput>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      firstName: person?.firstName ?? "",
      lastName: person?.lastName ?? "",
      phone: person?.phone ?? "",
      email: person?.email ?? "",
      role: "MEMBER",
      password: "",
    },
  })

  async function onSubmit(data: CreatePersonInput) {
    const result = isEditing
      ? await updatePerson(person!.id, data)
      : await createPerson(data)

    if (result.success) {
      toast.success(isEditing ? "Person updated" : "Person added")
      router.push(isEditing ? `/people/${person!.id}` : "/people")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...form.register("firstName")}
            aria-invalid={!!form.formState.errors.firstName}
            aria-describedby={form.formState.errors.firstName ? "firstName-error" : undefined}
          />
          {form.formState.errors.firstName && (
            <p id="firstName-error" className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...form.register("lastName")}
            aria-invalid={!!form.formState.errors.lastName}
            aria-describedby={form.formState.errors.lastName ? "lastName-error" : undefined}
          />
          {form.formState.errors.lastName && (
            <p id="lastName-error" className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register("phone")} placeholder="+232 76 000 000" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Person"}
        </Button>
      </div>
    </form>
  )
}
