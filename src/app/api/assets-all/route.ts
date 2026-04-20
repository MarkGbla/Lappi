import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth-helpers"

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const assets = await prisma.asset.findMany({
    where: { status: { not: "RETIRED" } },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(
    assets.map((a) => ({
      id: a.id,
      label: `${a.name} (${a.type})`,
    }))
  )
}
