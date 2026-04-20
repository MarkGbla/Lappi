import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helpers"
import { toCsv, csvResponse } from "@/lib/csv"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  await requireAuth()
  const { entity } = await params
  const timestamp = new Date().toISOString().slice(0, 10)

  switch (entity) {
    case "assets": {
      const assets = await prisma.asset.findMany({
        orderBy: { name: "asc" },
      })
      const csv = toCsv(assets, [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "serialNumber", label: "Serial Number" },
        { key: "status", label: "Status" },
        { key: "condition", label: "Condition" },
        { key: "location", label: "Location" },
        { key: "purchaseDate", label: "Purchase Date" },
        { key: "notes", label: "Notes" },
        { key: "createdAt", label: "Created" },
      ])
      return csvResponse(csv, `assets-${timestamp}.csv`)
    }

    case "sessions": {
      const sessions = await prisma.usageSession.findMany({
        include: { asset: true, person: true },
        orderBy: { checkedOutAt: "desc" },
      })
      const rows = sessions.map((s) => ({
        id: s.id,
        assetName: s.asset.name,
        assetSerial: s.asset.serialNumber ?? "",
        personName: `${s.person.firstName} ${s.person.lastName}`,
        purpose: s.purpose,
        checkedOutAt: s.checkedOutAt,
        checkedInAt: s.checkedInAt,
        conditionOnReturn: s.conditionOnReturn ?? "",
        notes: s.notes ?? "",
      }))
      const csv = toCsv(rows, [
        { key: "id", label: "ID" },
        { key: "assetName", label: "Asset" },
        { key: "assetSerial", label: "Serial Number" },
        { key: "personName", label: "Person" },
        { key: "purpose", label: "Purpose" },
        { key: "checkedOutAt", label: "Checked Out" },
        { key: "checkedInAt", label: "Checked In" },
        { key: "conditionOnReturn", label: "Condition on Return" },
        { key: "notes", label: "Notes" },
      ])
      return csvResponse(csv, `sessions-${timestamp}.csv`)
    }

    case "people": {
      const people = await prisma.person.findMany({
        orderBy: { lastName: "asc" },
      })
      const rows = people.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email ?? "",
        phone: p.phone ?? "",
        role: p.role,
        isActive: p.isActive,
        createdAt: p.createdAt,
      }))
      const csv = toCsv(rows, [
        { key: "id", label: "ID" },
        { key: "firstName", label: "First Name" },
        { key: "lastName", label: "Last Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "role", label: "Role" },
        { key: "isActive", label: "Active" },
        { key: "createdAt", label: "Created" },
      ])
      return csvResponse(csv, `people-${timestamp}.csv`)
    }

    case "issues": {
      const issues = await prisma.issue.findMany({
        include: { asset: true, reportedBy: true, assignedTo: true },
        orderBy: { createdAt: "desc" },
      })
      const rows = issues.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        assetName: i.asset.name,
        severity: i.severity,
        status: i.status,
        reporter: `${i.reportedBy.firstName} ${i.reportedBy.lastName}`,
        assignee: i.assignedTo
          ? `${i.assignedTo.firstName} ${i.assignedTo.lastName}`
          : "",
        resolutionNotes: i.resolutionNotes ?? "",
        repairCost: i.repairCost?.toString() ?? "",
        createdAt: i.createdAt,
        resolvedAt: i.resolvedAt,
      }))
      const csv = toCsv(rows, [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "assetName", label: "Asset" },
        { key: "severity", label: "Severity" },
        { key: "status", label: "Status" },
        { key: "reporter", label: "Reported By" },
        { key: "assignee", label: "Assigned To" },
        { key: "description", label: "Description" },
        { key: "resolutionNotes", label: "Resolution Notes" },
        { key: "repairCost", label: "Repair Cost" },
        { key: "createdAt", label: "Created" },
        { key: "resolvedAt", label: "Resolved" },
      ])
      return csvResponse(csv, `issues-${timestamp}.csv`)
    }

    default:
      notFound()
  }
}
