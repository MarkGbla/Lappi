import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth-helpers"

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const people = await prisma.person.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, phone: true, role: true },
    orderBy: { lastName: "asc" },
  })

  return NextResponse.json(
    people.map((p) => ({
      id: p.id,
      label: `${p.firstName} ${p.lastName}`,
      sub: p.phone ?? p.role,
    }))
  )
}
